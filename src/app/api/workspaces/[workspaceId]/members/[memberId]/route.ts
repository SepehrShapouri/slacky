import { db } from "@/db";
import { getCurrentSession } from "@/features/auth/lib/server/session";
import { Role } from "@prisma/client";
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
export async function PATCH(
  req: Request,
  {
    params: { workspaceId, memberId },
  }: { params: { workspaceId: string; memberId: number } }
) {
  try {
    const { user } = await getCurrentSession();
    if (!user)
      return NextResponse.json({ error: "Unauthenticated" }, { status: 403 });
    const body: { role: Role } = await req.json();
    const { role } = body;
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
    const currentMember = await db.member.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });
    if (currentMember?.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const updatedMember = await db.member.update({
      where: {
        id: Number(memberId),
        workspaceId,
      },
      data: {
        role,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(updatedMember, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: `something went wrong ${error}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const currentMember = await db.member.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });
    if (currentMember?.role !== "ADMIN" && currentMember?.id != memberId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    if (member.role == "ADMIN")
      return NextResponse.json(
        { error: "Admin cannot be removed" },
        { status: 400 }
      );

const removedMember = await db.member.delete({ where: { id: Number(memberId) } });
return NextResponse.json(removedMember,{status:200})
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: `something went wrong ${error}` },
      { status: 500 }
    );
  }
}
