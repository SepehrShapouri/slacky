import { db } from "@/db";
import { getCurrentSession } from "@/features/auth/lib/server/session";
import { createUploadthing, FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
const f = createUploadthing();

export const fileRouter = {
  attachment: f({
    image: { maxFileCount: 5, maxFileSize: "4MB" },
  })
    .middleware(async () => {
      const { user } = await getCurrentSession();
      if (!user) throw new UploadThingError("Unautorized");

      return {};
    })
    .onUploadComplete(async ({ file }) => {
      
      return { url: file.url };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
