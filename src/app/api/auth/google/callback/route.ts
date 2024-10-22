import { setSessionTokenCookie } from "@/features/auth/lib/server/cookies";
import {
  createSession,
  generateSessionToken,
} from "@/features/auth/lib/server/session";

import { cookies } from "next/headers";

import { google } from "@/features/auth/lib/server/oauth";
import { decodeIdToken, type OAuth2Tokens } from "arctic";
import { db } from "@/db";
import { getUserFromEmail } from "@/features/auth/lib/server/user";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("google_oauth_state")?.value ?? null;
  const codeVerifier = cookies().get("google_code_verifier")?.value ?? null;
  if (
    code === null ||
    state === null ||
    storedState === null ||
    codeVerifier === null
  ) {
    return new Response(null, {
      status: 400,
    });
  }
  if (state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch (e) {
    // Invalid code or client credentials
    return new Response(null, {
      status: 400,
    });
  }
  const googleUserResponse = await fetch(
    "https://www.googleapis.com/oauth2/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    }
  );
  const googleUser: {
    id: string;
    name: string;
    email: string;
    picture: string;
  } = await googleUserResponse.json();
  const existingUser = await db.user.findUnique({
    where: {
      googleId: googleUser.id,
    },
  });
  if (existingUser !== null) {
    if(googleUser.picture){
      await db.user.update({
        where: { id: existingUser.id },
        data: {
          avatarUrl: googleUser.picture,
        },
      });
    }
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingUser.id);
    setSessionTokenCookie(sessionToken, session.expiresAt);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  }
  const existingUserByEmail = await getUserFromEmail(googleUser.email);
  if (existingUserByEmail) {
    if (!existingUserByEmail.googleId) {
      await db.user.update({
        where: { id: existingUserByEmail.id },
        data: {
          googleId: googleUser.id,
          ...(googleUser.picture && { avatarUrl: googleUser.picture }),
        },
      });
    }
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingUserByEmail.id);
    setSessionTokenCookie(sessionToken, session.expiresAt);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  }
  const user = await db.user.create({
    data: {
      fullname: googleUser.name,
      googleId: googleUser.id,
      ...(googleUser.email && { email: googleUser.email }),
      ...(googleUser.picture && { avatarUrl: googleUser.picture }),
    },
  });

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);
  setSessionTokenCookie(sessionToken, session.expiresAt);
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
    },
  });
}
