import { db } from "@/db";
import { getCurrentSession } from "@/features/auth/lib/server/session";
import { Prisma } from "@prisma/client";
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
      include:{
        Channels:true,members:true
      }
    });
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
        { status: 401 }
      );
    }
    if (!workspace) {
      return NextResponse.json(
        {
          error:
            "You are not authorized to access this workspace, or it doesnt exist.",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(workspace, { status: 200 });
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
  { params: { workspaceId } }: { params: { workspaceId: string } }
) {
  try {
    const { user } = await getCurrentSession();
    if (!user)
      return NextResponse.json({ error: "Unauthenticated" }, { status: 403 });

    const body: { name: string } = await req.json();
    const { name } = body;
    const workspace = await db.workspaces.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) {
      return NextResponse.json(
        { error: "workspace not found" },
        { status: 404 }
      );
    }

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

    const updatedWorkspace = await db.workspaces.update({
      where: {
        id: workspaceId,
      },
      data: {
        name,
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

export async function DELETE(
  req: Request,
  { params: { workspaceId } }: { params: { workspaceId: string } }
) {
  try {
    const { user } = await getCurrentSession();
    if (!user)
      return NextResponse.json({ error: "Unauthenticated" }, { status: 403 });
    const workspace = await db.workspaces.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) {
      return NextResponse.json(
        { error: "workspace not found" },
        { status: 404 }
      );
    }
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

    // Start a transaction
    const deletedWorkspace = await db.$transaction(async (prisma) => {
      // Delete all members associated with the workspace
      await prisma.member.deleteMany({
        where: { workspaceId },
      });

      // Delete the workspace
      return prisma.workspaces.delete({
        where: { id: workspaceId },
      });
    });

    return NextResponse.json(deletedWorkspace, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            error:
              "Unable to delete workspace due to existing references. Please contact support.",
          },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { error: "An error occurred while deleting the workspace" },
      { status: 500 }
    );
  }
}
