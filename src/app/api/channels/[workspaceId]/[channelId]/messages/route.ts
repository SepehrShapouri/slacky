import { db } from "@/db";
import { getCurrentSession } from "@/features/auth/lib/server/session";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  {
    params: { workspaceId, channelId },
  }: { params: { workspaceId: string; channelId: string } }
) {
  try {
    const { user } = await getCurrentSession();
    if (!user)
      return NextResponse.json({ error: "Unauthenticated" }, { status: 403 });
    const workspace = await db.workspaces.findUnique({
      where: {
        id: workspaceId,
      },
    });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" });
    }
    const member = await db.member.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });
    if (!member)
      return NextResponse.json(
        { error: "You must be a member of this workspace to read messages" },
        { status: 401 }
      );

      
    const messages = await db.messages.findMany({
      where: {
        channelId,
        workspaceId,
      },
      include: {
        member: {
          include: {
            user: {
              select: {
                avatarUrl: true,
                fullname: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error
      },
      { status: 404 }
    );
  }
}
