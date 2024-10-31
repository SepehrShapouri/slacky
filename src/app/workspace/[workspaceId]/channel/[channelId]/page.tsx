"use client";
import useGetChannel from "@/features/channels/api/use-get-channel";
import ChatInput from "@/features/channels/components/chat-input";
import Header from "@/features/channels/components/header";
import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Loader2, TriangleAlert } from "lucide-react";
import React from "react";

function page() {
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const { channel, isChannelLoading } = useGetChannel({
    workspaceId,
    channelId,
  });
  if (isChannelLoading)
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin size-6 text-muted-foreground" />
      </div>
    );
  if (!channel)
    return (
      <div className="h-full flex-1 flex-col flex items-center justify-center">
        <TriangleAlert className=" size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          This channel doesnt exist
        </p>
      </div>
    );
  return (
    <div className="flex flex-col h-full">
      <Header title={channel.name} />
      <div className="flex-1" />
      <ChatInput placeholder={`Message # ${channel.name}`} />
    </div>
  );
}

export default page;
