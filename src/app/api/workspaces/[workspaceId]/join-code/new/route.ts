import { db } from "@/db";
import { getCurrentSession } from "@/features/auth/lib/server/session";
import { generateJoinCode } from "@/features/workspaces/lib/utils";
import { error } from "console";
import { NextResponse } from "next/server";

export async function PATCH(
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
    if (member?.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!member) {
      return NextResponse.json(
        { error: "This member doesnt exist" },
        { status: 404 }
      );
    }

    const newJoinCode = generateJoinCode();
    const updatedWorkspace = await db.workspaces.update({
      where: { id: workspaceId },
      data: {
        joinCode: newJoinCode,
        
      },
    });
    return NextResponse.json(updatedWorkspace, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
