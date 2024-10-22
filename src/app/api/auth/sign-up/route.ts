import { db } from "@/db";
import { setSessionTokenCookie } from "@/features/auth/lib/server/cookies";
import {
  checkEmailAvailability,
  verifyEmailInput,
} from "@/features/auth/lib/server/email";
import {
  hashPassword,
  verifyPasswordStrength,
} from "@/features/auth/lib/server/password";
import {
  createSession,
  generateSessionToken,
} from "@/features/auth/lib/server/session";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body: { email: string; password: string; username: string } =
      await req.json();
    console.log(body);
    const { email, password, username } = body;

    if (
      typeof email !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid or missing fields" },
        { status: 400 }
      );
    }
    if (email === "" || username === "" || password === "") {
      return NextResponse.json(
        { error: "Invalid or missing fields" },
        { status: 400 }
      );
    }
    if (!verifyEmailInput(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    const emailAvailable = await checkEmailAvailability(email);
    if (!emailAvailable) {
      return NextResponse.json(
        { error: "A user with this email address already exists" },
        { status: 400 }
      );
    }
    console.log("reached safe email");
    const strongPassword = await verifyPasswordStrength(password);
    console.log("reached strong pass", strongPassword);
    if (!strongPassword) {
      return NextResponse.json(
        {
          error:
            "Your password has been seen in security breaches, please choose a stronger password",
        },
        { status: 400 }
      );
    }
    console.log("reached strong pass");
    const password_hash = await hashPassword(password);
    console.log("reached hashed pass");
    const user = await db.user.create({
      data: {
        username,
        email,
        password_hash,
      },
    });
    console.log("user created");
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id);
    setSessionTokenCookie(sessionToken, session.expiresAt);
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}
