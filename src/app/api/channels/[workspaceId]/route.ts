import { db } from "@/db";
import { getCurrentSession } from "@/features/auth/lib/server/session";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params: { workspaceId } }: { params: { workspaceId: string } }
) {
  try {
    const { user } = await getCurrentSession();
    if (!user)
      return NextResponse.json({ error: "Unauthenticated" }, { status: 403 });
    const member = await db.member.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });
    if (!member) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 400 }
      );
    }
    const channels = await db.channels.findMany({
      where: {
        workspaceId,
      },
    });

    return NextResponse.json(channels, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function POST(
  req: Request,
  { params: { workspaceId } }: { params: { workspaceId: string } }
) {
  try {
    const { user } = await getCurrentSession();
    if (!user)
      return NextResponse.json({ error: "Unauthenticated" }, { status: 403 });
    const body: { name: string } = await req.json();
    const { name } = body;

    const member = await db.member.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });
    if (!member) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 400 }
      );
    }
    if (member.role != "ADMIN") {
      return NextResponse.json(
        {
          error:
            "You dont have permission to create a channel in this workspace",
        },
        { status: 401 }
      );
    }
    const parsedName = name.replace(/\s+/g, "-").toLocaleLowerCase();

    const createdChannel = await db.channels.create({
      data: {
        name: parsedName,
        workspaceId,
      },
    });

    return NextResponse.json(createdChannel, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
