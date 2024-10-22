import { setSessionTokenCookie } from "@/features/auth/lib/server/cookies";
import {
  createSession,
  generateSessionToken,
} from "@/features/auth/lib/server/session";

import { github } from "@/features/auth/lib/server/oauth";
import { cookies } from "next/headers";

import { OAuth2Tokens } from "arctic";
import { db } from "@/db";
import { getUserFromEmail } from "@/features/auth/lib/server/user";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("github_oauth_state")?.value ?? null;

  if (code === null || state === null || storedState === null) {
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
    tokens = await github.validateAuthorizationCode(code);
  } catch (e) {
    return new Response(null, {
      status: 400,
    });
  }
  const githubUserResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken()}`,
    },
  });

  const githubUser: {
    login: string;
    id: number;
    avatar_url: string;
    email: string;
    name: string;
  } = await githubUserResponse.json();
  console.log(githubUser);
  const existingUser = await db.user.findUnique({
    where: {
      githubId: githubUser.id,
    },
  });

  if (existingUser !== null) {
    if (githubUser.avatar_url) {
      await db.user.update({
        where: { id: existingUser.id },
        data: {
          avatarUrl: githubUser.avatar_url,
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
  if (githubUser.email) {
    const existingUserByEmail = await getUserFromEmail(githubUser.email);
    if (existingUserByEmail) {
      if (!existingUserByEmail.githubId) {
        await db.user.update({
          where: { id: existingUserByEmail.id },
          data: {
            githubId: githubUser.id,
            ...(githubUser.avatar_url && { avatarUrl: githubUser.avatar_url }),
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
  }

  const user = await db.user.create({
    data: {
      fullname: githubUser.login,
      githubId: githubUser.id,
      ...(githubUser.email && { email: githubUser.email }),
      ...(githubUser.avatar_url && { avatarUrl: githubUser.avatar_url }),
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
