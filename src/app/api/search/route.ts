import { db } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const workspaceId = searchParams.get("workspaceId");

  if (!query || !workspaceId)
    return NextResponse.json(
      { error: "Search query and workspace id are required" },
      { status: 400 }
    );

  try {
    const [members, channels, messages] = await Promise.all([
      db.member.findMany({
        where: {
          workspaceId,
          user: {
            fullname: { contains: query, mode: "insensitive" },
          },
        },
        select: {
          id: true,

          user: {
            select: {
              fullname: true,
              avatarUrl: true,
              email: true,
            },
          },
        },
      }),
      db.channels.findMany({
        where: {
          workspaceId,
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
      }),
      db.messages.findMany({
        where: {
          workspaceId,
          body: { contains: query, mode: "insensitive" },
        },
        select: {
          channelId: true,
          conversationId: true,
          body: true,
          member: {
            select: {
              id: true,
              user: {
                select: {
                  avatarUrl: true,
                  fullname: true,
                  email: true,
                  id: true,
                },
              },
            },
          },
        },
      }),
    ]);
    return NextResponse.json({ members, channels, messages }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while searching" },
      { status: 500 }
    );
  }
}
