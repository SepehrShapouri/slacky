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

    const body: { name: string } = await req.json();
    const { name } = body;
    const joinCode = generateJoinCode();

    const workspace = await db.$transaction(async (tx) => {
      // Create the workspace
      const workspace = await tx.workspaces.create({
        data: {
          joinCode,
          name,
          userId: user.id,
          creatorId: user.id,
        },
      });

      // Create the member
      await tx.member.create({
        data: {
          role: "ADMIN",
          userId: user.id,
          workspaceId: workspace.id,
        },
      });

      // Create the channel
      await tx.channels.create({
        data: {
          name: "general",
          workspaceId: workspace.id,
        },
      });

      return workspace;
    });

    return NextResponse.json(workspace, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}
