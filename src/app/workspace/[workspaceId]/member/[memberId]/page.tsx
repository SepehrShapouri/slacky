"use client";
import AnimatedLogo from "@/components/animated-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ChatInput from "@/features/channels/components/chat-input";
import Header from "@/features/direct-messages/components/header";
import UserBanner from "@/features/direct-messages/components/user-banner";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useMemberId } from "@/hooks/use-member-id";
import useSingleMember from "@/hooks/use-single-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useState } from "react";

function page() {
  const [editorKey, setEditorKey] = useState<number>(0);
  const workspaceId = useWorkspaceId();
  const memberId = useMemberId();
  const { member: currentMember, isMemberLoading: isCurrentMemberLoading } =
    useCurrentMember({ workspaceId });
    console.log(memberId)
  const { member, isMemberLoading } = useSingleMember({ memberId });
  if (isCurrentMemberLoading || isMemberLoading) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <AnimatedLogo />
        <p className="text-sm text-muted-foreground">Loading conversation...</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full">
      <Header
        fallback={member?.user?.fullname[0].toUpperCase() || "M"}
        name={member?.user?.fullname || "Member"}
        avatarUrl={member?.user?.avatarUrl || undefined}
        topic="Tasks"
      />
      <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
        <UserBanner
          avatarUrl={member?.user?.avatarUrl || undefined}
          name={member?.user?.fullname}
          fallback={member?.user?.fullname[0].toUpperCase()}
        />
      </div>
      <ChatInput
        editorKey={editorKey}
        onSubmit={() => {}}
        placeholder={`Say what's up to @${member?.user?.fullname}...or bomb him with tasks, your choice!`}
      />
    </div>
  );
}

export default page;
