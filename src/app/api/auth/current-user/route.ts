import { getCurrentSession } from "@/features/auth/lib/server/session";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { user, session } = await getCurrentSession();
    if (!user || !session)
      return NextResponse.json({ error: "Unauthenticated" }, { status: 403 });

    return NextResponse.json({ user, session }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
