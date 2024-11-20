import { db } from "@/db";
import { getCurrentSession } from "@/features/auth/lib/server/session";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  {
    params: { workspaceId, memberId },
  }: { params: { workspaceId: string; memberId: number } }
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
    if (!workspace)
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    const member = await db.member.findUnique({
      where: {
        id: Number(memberId),
      },
      include: { user: true },
    });

    if (!member) {
      return NextResponse.json(
        {
          error: "This member doesnt exist",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(member, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
