"use client";
import ChatComponent from "@/components/chat";
import useGetChannel from "@/features/channels/api/use-get-channel";
import { useGetMessages } from "@/features/channels/api/use-get-channel-messages";
import ChatInput from "@/features/channels/components/chat-input";
import Header from "@/features/channels/components/header";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { generateJoinCode } from "@/features/workspaces/lib/utils";
import { useChannelId } from "@/hooks/use-channel-id";
import { useSocket } from "@/hooks/use-socket";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Loader2, TriangleAlert } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
type EditorValue = {
  attachments?: string[];
  body: string;
};
interface Message {
  id: string;
  body: string;
  memberId: number;
  workspaceId: string;
  channelId: string;
  attachments?: string[];
  key?: string;
  isPending?: boolean;
}

function Page() {
  const [editorKey, setEditorkey] = useState<number>(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const { member } = useCurrentMember({ workspaceId });
  const { messages: initialMessages, isMessagesLoading } = useGetMessages({
    workspaceId,
    channelId,
  });
  const { channel, isChannelLoading } = useGetChannel({
    workspaceId,
    channelId,
  });
  const socket = useSocket("channels");

  useEffect(() => {
    if (isMessagesLoading) return;

    if (!initialMessages) return;
    const formattedMessages: Message[] = initialMessages.map((item) => ({
      body: item.body,
      channelId: item.channelId!,
      id: item.id,
      memberId: item.memberId,
      workspaceId: item.workspaceId,
      attachments: item.attachments,
    }));
    setMessages(formattedMessages);
  }, [initialMessages, setMessages, isMessagesLoading]);

  useEffect(() => {
    if (socket && channelId) {
      socket.emit("join-room", channelId);

      socket.on("new-message", (message: Message) => {
        setMessages((prevMessages) => {
          const existingMessageIndex = prevMessages.findIndex(
            (m) => m.key === message.key
          );
          if (existingMessageIndex !== -1) {
            // Replace the pending message with the confirmed one
            const updatedMessages = [...prevMessages];
            updatedMessages[existingMessageIndex] = {
              ...message,
              isPending: false,
            };
            return updatedMessages;
          } else {
            // Add the new message if it doesn't exist
            return [...prevMessages, message];
          }
        });
      });

      socket.on("error", (error: string) => {
        console.error("Socket error:", error);
        toast.error("Something went wrong", {
          description: error,
        });
        // Remove the pending message on error
        setMessages((prevMessages) => prevMessages.filter((m) => !m.isPending));
      });
    }

    return () => {
      if (socket) {
        socket.off("new-message");
        socket.off("error");
        socket.emit("leave-room", channelId);
      }
    };
  }, [socket, channelId]);

  const onSubmit = useCallback(
    ({ body, attachments }: EditorValue) => {
      console.log(attachments,'in submit')
      if (socket && body && member && workspaceId && channelId) {
        const key = generateJoinCode();
        const newMessage = {
          body,
          memberId: member.id,
          workspaceId,
          channelId,
          userId: member.userId,
          key,
          id: key, // Temporary ID
          isPending: true,
          attachments
        };
        console.log(newMessage)
        // Optimistically add the message
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        // Emit the message to the server
        socket.emit("send-message", newMessage);
        setEditorkey((prev) => prev + 1);
      }
    },
    [socket, member, workspaceId, channelId]
  );

  if (isChannelLoading)
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin size-6 text-muted-foreground" />
      </div>
    );

  if (!channel)
    return (
      <div className="h-full flex-1 flex-col flex items-center justify-center">
        <TriangleAlert className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          This channel doesn't exist
        </p>
      </div>
    );

  return (
    <div className="flex flex-col h-full">
      <Header title={channel.name} />
      <div className="flex-1 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 p-2 rounded ${
              message.isPending ? "bg-gray-200" : "bg-gray-100"
            }`}
          >
            <span className="font-bold">User {message.memberId}: </span>
            {message.body}
            <div>{message.attachments?.map((media)=><Image src={media} width={100} height={100} alt="test"/>)}</div>
            {message.isPending && (
              <span className="text-xs text-gray-500 ml-2">(Sending...)</span>
            )}
          </div>
        ))}
      </div>
      <ChatInput
        editorKey={editorKey}
        placeholder={`Message # ${channel.name}`}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default Page;
