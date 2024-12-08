"use server";

//

import { redirect } from "next/navigation";
import { getCurrentSession, invalidateSession } from "./lib/server/session";
import { deleteSessionTokenCookie } from "./lib/server/cookies";

export async function logoutAction() {
  const { session } = await getCurrentSession();
  if (session === null) {
    return;
  }
  invalidateSession(session.id);
  deleteSessionTokenCookie();
  return redirect("/auth");
}
