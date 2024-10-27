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
