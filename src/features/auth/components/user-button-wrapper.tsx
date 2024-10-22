import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentSession } from "../lib/server/session";
import { UserButton } from "./user-button";

async function UserButtonWrapper() {
  const { user } = await getCurrentSession();
  if (!user) redirect("/auth");
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserButton user={user}/>
    </Suspense>
  );
}

export default UserButtonWrapper;
