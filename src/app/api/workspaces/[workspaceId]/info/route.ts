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

    const workspace = await db.workspaces.findUnique({
      where: {
        id: workspaceId,
      },
    });
    const member = await db.member.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });
    if (!workspace) {
      return NextResponse.json(
        {
          error:
            "You are not authorized to access this workspace, or it doesnt exist.",
        },
        { status: 404 }
      );
    }
    const data: {
      name: string;
      isMember: boolean;
    } = {
      isMember: !!member,
      name: workspace.name,
    };
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
