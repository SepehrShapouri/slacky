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
    const [messages] = await Promise.all([
      db.messages.findMany({
        where: {
          workspaceId,
          body: { contains: query, mode: "insensitive" },
        },
        select: {
          id:true,
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
    return NextResponse.json( messages , { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while searching" },
      { status: 500 }
    );
  }
}
