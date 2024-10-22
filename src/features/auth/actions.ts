"use server";

//

import { redirect } from "next/navigation";
import { getCurrentSession, invalidateSession } from "./lib/server/session";
import { deleteSessionTokenCookie } from "./lib/server/cookies";

export async function logoutAction(): Promise<ActionResult> {
  const { session } = await getCurrentSession();
  if (session === null) {
    return {
      message: "Not authenticated",
    };
  }
  invalidateSession(session.id);
  deleteSessionTokenCookie();
  return redirect("/auth");
}

export type ActionResult = {
  message: string;
}
