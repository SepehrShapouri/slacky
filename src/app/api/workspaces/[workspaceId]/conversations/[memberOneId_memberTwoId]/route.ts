import { db } from "@/db";
import { getCurrentSession } from "@/features/auth/lib/server/session";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  {
    params: { workspaceId, memberOneId_memberTwoId },
  }: { params: { workspaceId: string; memberOneId_memberTwoId: string } }
) {
  try {
    const { user } = await getCurrentSession();
    if (!user)
      return NextResponse.json({ error: "Unauthenticated" }, { status: 403 });
    const splittedMemberIds = memberOneId_memberTwoId.split("_");
    const memberOneId = Number(splittedMemberIds[0]);
    const memberTwoId = Number(splittedMemberIds[1]);

    const workspace = await db.workspaces.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) {
      return NextResponse.json(
        { error: "workspace not found" },
        { status: 404 }
      );
    }
    const memberOne = await db.member.findUnique({
      where: {
        id: memberOneId,
      },
    });
    const memberTwo = await db.member.findUnique({
      where: {
        id: memberTwoId,
      },
    });
    if (!memberOne || !memberTwo)
      return NextResponse.json({ error: "Invalid members" }, { status: 404 });

    const existingConversation = await db.conversations.findUnique({
      where: {
        memberOneId_memberTwoId_workspaceId: {
          memberOneId,
          memberTwoId,
          workspaceId,
        },
      },
    });
    if (existingConversation) {
      return NextResponse.json(
        existingConversation ,
        { status: 200 }
      );
    }

    const newConversation = await db.conversations.create({
      data: {
        memberOneId,
        memberTwoId,
        workspaceId,
      },
    });
    return NextResponse.json(
       newConversation ,
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
