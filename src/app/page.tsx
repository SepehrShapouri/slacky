import { getCurrentSession } from "@/features/auth/lib/server/session";
import Image from "next/image";

export default async function Home() {
  const { user } = await getCurrentSession();
  return (
    <div>
      hello world, this is slacky
      {user?.username}
    </div>
  );
}
