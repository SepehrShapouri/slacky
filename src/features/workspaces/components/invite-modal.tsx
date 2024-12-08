"use client";

import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyIcon, Loader2, RefreshCcw, Share2 } from "lucide-react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { toast } from "sonner";
import { useNewJoinCode } from "../api/use-new-join-code";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";

type InviteModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  workspaceName: string;
  joinCode: string;
  workspaceId:string
};

export default function InviteModal({
  open,
  setOpen,
  joinCode,
  workspaceName,
  workspaceId
}: InviteModalProps) {
  const router = useRouter();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "Regenerating the invite code for this workspace will result in the previous code being destroyed, meaning users will no longer be able to use the current code to access this workspace"
  );
  const { generateNewJoinCode, isGeneratingJoinCode } = useNewJoinCode();

  const inviteLink = `${window.location.origin}/join/${workspaceId}`;

  const handleCopy = React.useCallback(() => {
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        toast.success("Invite link copied to clipboard");
      })
      .catch((error) => {
        console.error("Failed to copy: ", error);
        toast.error("Failed to copy invite link");
      });
  }, [inviteLink]);

  const handleShare = React.useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${workspaceName} on Workify`,
          text: `Use this code to join: ${joinCode}`,
          url: inviteLink,
        });
        toast.success("Invite shared successfully");
      } catch (error) {
        console.error("Error sharing:", error);
        toast.error("Failed to share invite");
      }
    } else {
      toast.error("Sharing is not supported on this device");
    }
  }, [workspaceName, joinCode, inviteLink]);

  const handleNewCode = async () => {
    const ok = await confirm();
    if (!ok) return;
    generateNewJoinCode({ workspaceId });
  };
  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite people to {workspaceName}</DialogTitle>
            <DialogDescription>
              Share the code or link below to invite people to your workspace
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-y-6 py-10">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p
                className="text-4xl font-bold uppercase tracking-widest "
                aria-label={`Join code: ${joinCode}`}
              >
                {joinCode}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Use this code to join
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={handleCopy}
                variant="ghost"
                size="sm"
                className="w-32"
              >
                Copy link <CopyIcon className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={handleShare}
                variant="ghost"
                size="sm"
                className="w-32"
              >
                Share <Share2 className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <Button
              disabled={isGeneratingJoinCode}
              onClick={handleNewCode}
              variant="secondary"
            >
              {isGeneratingJoinCode ? (
                <p className="flex items-center">
                  Regenerating <Loader2 className="animate-spin ml-1" />
                </p>
              ) : (
                <p className="flex items-center">
                  New code
                  <RefreshCcw className="ml-1" />
                </p>
              )}
            </Button>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
