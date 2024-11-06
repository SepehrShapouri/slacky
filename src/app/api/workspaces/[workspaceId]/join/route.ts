import { db } from "@/db";
import { getCurrentSession } from "@/features/auth/lib/server/session";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params: { workspaceId } }: { params: { workspaceId: string } }
) {
  try {
    const { user } = await getCurrentSession();
    if (!user)
      return NextResponse.json({ error: "Unauthenticated" }, { status: 403 });

    const body: { joinCode: string } = await req.json();
    const { joinCode } = body;
    
    const workspace = await db.workspaces.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) {
      return NextResponse.json(
        { error: "workspace not found" },
        { status: 404 }
      );
    }
    if (
      workspace.joinCode.toLocaleLowerCase() !== joinCode.toLocaleLowerCase()
    ) {
    
      return NextResponse.json(
        { error: "Invite code is invalid or expired" },
        { status: 401 }
      );
    }
    const existingMember = await db.member.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });
    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this workspace" },
        { status: 400 }
      );
    }

    const newMember = await db.member.create({
      data: {
        role: "MEMBER",
        userId: user.id,
        workspaceId,
      },
    });

    return NextResponse.json({ newMember, workspace }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
