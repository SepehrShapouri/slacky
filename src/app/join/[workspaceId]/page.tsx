"use client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import Image from "next/image";
import React, { useState } from "react";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { useJoinWorkspace } from "@/features/workspaces/api/use-join-workspace";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useGetWorkspaceInfo from "@/features/workspaces/api/use-get-workspace-info";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AnimatedLogo from "@/components/animated-logo";
function page() {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { isJoiningWorkspace, joinWorkspace } = useJoinWorkspace();
  const { workspaceInfo, isWorkspaceInfoLoading } = useGetWorkspaceInfo({
    workspaceId,
  });
  function handleComplete(value: string) {
    joinWorkspace(
      { joinCode: value, workspaceId },
      {
        onSuccess: () => {
          toast.success("Joined a new workspace", {
            description: `You are now a member of ${workspaceInfo?.name}`,
          });
          router.replace(`/workspace/${workspaceId}`);
        },
      }
    );
  }

  if (isWorkspaceInfoLoading)
    return (
      <div className="h-full flex items-center justify-center">
        <AnimatedLogo/>
        <p className="font-medium text-muted-foreground text-md">Loading workspace info...</p>
      </div>
    );

  if (workspaceInfo?.isMember) {
    return (
      <div className="h-full gap-4 flex items-center justify-center flex-col">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-extrabold">Oooops!</h1>
          <p className=" font-medium text-muted-foreground text-md">
            It seems like you are already a member of this workspace
          </p>
        </div>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="h-full flex flex-col gap-y-8 items-center justify-center bg-white p-8 rounded-lg shadow-md">
      <Image src="/hashtag.svg" width={60} height={60} alt="hashtag" />
      <div className="flex flex-col gap-y-4 items-center justify-center max-w-md">
        <div className="flex flex-col gap-y-2 items-center justify-center">
          <h1 className="text-2xl font-bold">Join {workspaceInfo?.name}</h1>
          <p className="text-md text-muted-foreground">
            Enter the workspace code to join
          </p>
        </div>
        <InputOTP
          disabled={isJoiningWorkspace}
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
          onComplete={(value) => handleComplete(value)}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <div className="flex gap-x-4">
        <Button
          size="lg"
          variant="secondary"
          asChild
          disabled={isJoiningWorkspace}
        >
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}

export default page;
