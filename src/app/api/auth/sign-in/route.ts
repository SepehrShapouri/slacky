import { setSessionTokenCookie } from "@/features/auth/lib/server/cookies";
import { verifyEmailInput } from "@/features/auth/lib/server/email";
import { verifyPasswordHash } from "@/features/auth/lib/server/password";
import {
  createSession,
  generateSessionToken,
} from "@/features/auth/lib/server/session";
import {
  getUserFromEmail,
  getUserPasswordHash,
} from "@/features/auth/lib/server/user";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body: { email: string; password: string } = await req.json();

    const { email, password } = body;

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing fields" },
        { status: 400 }
      );
    }
    if (email === "" || password === "") {
      return NextResponse.json(
        { error: "Invalid or missing fields" },
        { status: 400 }
      );
    }
    if (!verifyEmailInput(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const user = await getUserFromEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or user doesnt exist" },
        { status: 400 }
      );
    }
    const passwordHash = await getUserPasswordHash(user.id);
    const validPassword = await verifyPasswordHash(passwordHash, password);

    if (!validPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id);
    setSessionTokenCookie(sessionToken, session.expiresAt);

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(`Internal server error ${error ?? ""}`, {
      status: 500,
    });
  }
}
