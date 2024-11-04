import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";
import { toast } from "sonner";

export type Attachments = {
  file: File;
  isUploading: boolean;
  url?: string;
};

export default function useMediaUpload() {
  const [attachments, setAttachments] = useState<Attachments[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>();

  const { startUpload, isUploading } = useUploadThing("attachment", {
    onBeforeUploadBegin(files) {
      console.log(files, 'before upload');
      setAttachments((prev) => [
        ...prev,
        ...files.map((file) => ({ file, isUploading: true })),
      ]);
      return files;
    },
    onUploadProgress: setUploadProgress,
    onClientUploadComplete(res) {
      if (!res) {
        toast.error("No result returned from uploadthing");
        return;
      }
      console.log(res, 'client upload complete');

      setAttachments((prev) =>
        prev.map((attachment) => {
          const matchingResult = res.find((r) => r.name === attachment.file.name);
          if (matchingResult) {
            return {
              ...attachment,
              isUploading: false,
              url: matchingResult.url,
            };
          }
          return attachment;
        })
      );
    },
    onUploadError(e) {
      setAttachments((prev) => prev.filter((a) => !a.isUploading));
      toast.error(e.message);
    },
  });

  function handleStartUpload(files: File[]) {
    if (isUploading) {
      toast.error("Please wait for the current upload to finish");
      return;
    }
    startUpload(files);
  }

  function removeAttachment(filename: string) {
    setAttachments((prev) => prev.filter((a) => a.file.name !== filename));
  }

  function resetAttachments() {
    setAttachments([]);
    setUploadProgress(undefined);
  }

  return {
    startUpload: handleStartUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    resetAttachments,
  };
}