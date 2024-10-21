import { setSessionTokenCookie } from "@/features/auth/lib/server/cookies";
import {
  createSession,
  generateSessionToken,
} from "@/features/auth/lib/server/session";

import { github } from "@/features/auth/lib/auth";
import { cookies } from "next/headers";

import { OAuth2Tokens } from "arctic";
import { db } from "@/db";

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

  const githubUser:{login:string,id:number,avatarUrl:string,email:string,name:string,} = await githubUserResponse.json();

  //TODO: add email here so we can check if a user with this github email already exists
  console.log(githubUser);

  const existingUser = await db.user.findUnique({
    where: {
      githubId: githubUser.id,
    },
  });

  if (existingUser !== null) {
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

  const user = await db.user.create({
    data: {
      username: githubUser.login,
      githubId: githubUser.id,
      
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
