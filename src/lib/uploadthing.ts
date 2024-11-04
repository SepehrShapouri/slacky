import { AppFileRouter } from "@/app/api/uploadthing/core";
import { generateReactHelpers, generateUploadButton } from "@uploadthing/react";
import { FileRouter } from "uploadthing/types";
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<AppFileRouter>();

export const UploadButton = generateUploadButton<FileRouter>();
