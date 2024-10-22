import { db } from "@/db";

export function verifyEmailInput(email: string): boolean {
  return /^.+@.+\..+$/.test(email) && email.length < 256;
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
  const existingUserByEmail = await db.user.findUnique({
    where: {
      email,
    },
  });
  if (existingUserByEmail) return false;
  return true;
}
