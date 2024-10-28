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
    const body: { email: string; password: string; fullname: string } =
      await req.json();
    
    const { email, password, fullname } = body;

    if (
      typeof email !== "string" ||
      typeof fullname !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid or missing fields" },
        { status: 400 }
      );
    }
    if (email === "" || fullname === "" || password === "") {
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
    
    const strongPassword = await verifyPasswordStrength(password);
    
    if (!strongPassword) {
      return NextResponse.json(
        {
          error:
            "Your password has been seen in security breaches, please choose a stronger password",
        },
        { status: 400 }
      );
    }
    
    const password_hash = await hashPassword(password);
    
    const user = await db.user.create({
      data: {
        fullname,
        email: email.toLowerCase(),
        password_hash,
      },
    });
    
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id);
    setSessionTokenCookie(sessionToken, session.expiresAt);
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}
