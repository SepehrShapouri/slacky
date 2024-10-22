import { db } from "@/db";
import { User } from "@prisma/client";

export async function getUserPasswordHash(userId: number): Promise<string> {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new Error("Invalid user ID");
  }
  if (!user.password_hash) {
    throw new Error("Missing data, try authenticating with other options");
  }
  return user.password_hash;
}

export async function getUserFromEmail(email: string): Promise<User | null> {
  const user = await db.user.findUnique({
    where: {
      email:email.toLowerCase(),
    },
  });
  if (!user) return null;
  return user;
}
