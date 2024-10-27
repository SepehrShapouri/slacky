import { db } from "@/db";
import { getCurrentSession } from "@/features/auth/lib/server/session";
import { generateJoinCode } from "@/features/workspaces/lib/utils";
import { NextResponse } from "next/server";

export async function GET(_req: Request) {
  try {
    const { user } = await getCurrentSession();
    if (!user)
      return NextResponse.json({ error: "Unauthenticated" }, { status: 403 });

    const workspaces = await db.workspaces.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    });
    return NextResponse.json(workspaces, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await getCurrentSession();
    if (!user)
      return NextResponse.json({ error: "Unauthenticated" }, { status: 403 });
    //TODO:create a proper joinCode
    const body: { name: string } = await req.json();
    const { name } = body;
    const joinCode = generateJoinCode()

    const workspace = await db.workspaces.create({
      data: {
        joinCode,
        name,
        userId: user.id,
        creatorId: user.id,
      },
    });
    await db.member.create({
      data: {
        role: "ADMIN",
        userId: user.id,
        workspaceId: workspace.id,
      },
    });
    return NextResponse.json(workspace, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
