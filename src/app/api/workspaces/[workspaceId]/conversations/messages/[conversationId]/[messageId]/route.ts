import { db } from "@/db";
import { getCurrentSession } from "@/features/auth/lib/server/session";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  {
    params: { workspaceId, conversationId, messageId },
  }: {
    params: { workspaceId: string; conversationId: string; messageId: string };
  }
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

    const message = await db.messages.findUnique({
      where: {
        id: messageId,
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
        reactions: {
          include: {
            member: {
              include: {
                user: {
                  select: {
                    fullname: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
        replies: {
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
            reactions: {
              include: {
                member: {
                  include: {
                    user: {
                      select: {
                        fullname: true,
                        avatarUrl: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
    if (!message)
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    return NextResponse.json(message, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error,
      },
      { status: 404 }
    );
  }
}
