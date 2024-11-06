"use client";
import ChatComponent from "@/components/chat";
import MessageList from "@/components/message-list";
import useGetChannel from "@/features/channels/api/use-get-channel";
import { useGetMessages } from "@/features/channels/api/use-get-channel-messages";
import ChatInput from "@/features/channels/components/chat-input";
import Header from "@/features/channels/components/header";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { ModifiedMessage } from "@/features/messages/lib/types";
import { generateJoinCode } from "@/features/workspaces/lib/utils";
import { useChannelId } from "@/hooks/use-channel-id";
import useSession from "@/hooks/use-session";
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
function Page() {
  const [editorKey, setEditorkey] = useState<number>(0);
  const [messages, setMessages] = useState<ModifiedMessage[]>([]);
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const { member } = useCurrentMember({ workspaceId });
  const {user} = useSession()
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
    const formattedMessages: ModifiedMessage[] = initialMessages.map(
      (item) => ({
        body: item.body,
        channelId: item.channelId!,
        id: item.id,
        memberId: item.memberId,
        workspaceId: item.workspaceId,
        attachments: item.attachments,
        conversationId: null,
        parentId: null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        member:{
          ...item.member!
        }
      })
    );
    setMessages(formattedMessages);
  }, [initialMessages, setMessages, isMessagesLoading]);

  useEffect(() => {
    if (socket && channelId) {
      socket.emit("join-room", channelId);

      socket.on("new-message", (message: ModifiedMessage) => {
        console.log(message,'from server')
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
            return [message,...prevMessages];
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
      
      if (socket && body && member && workspaceId && channelId) {
        const key = generateJoinCode();
        const newMessage: ModifiedMessage = {
          body,
          memberId: member.id,
          workspaceId,
          channelId,
          userId: member.userId,
          key,
          id: key, // Temporary ID
          isPending: true,
          attachments: attachments || [],
          conversationId: null,
          parentId: null,
          createdAt: new Date(),
          member:{...member,user:{
            email:user?.email!,
            fullname:user?.fullname!,
            avatarUrl:user?.avatarUrl || undefined
          }}
        };
        console.log(newMessage,'from client')
        // Optimistically add the message
        setMessages((prevMessages) => [newMessage, ...prevMessages]);

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
      <MessageList
        channelName={channel.name}
        channelCreationTime={channel.createdAt}
        data={messages}
        loadMore={() => {}}
        isLoadingMore={false}
        canLoadMore={false}
      />

      <ChatInput
        editorKey={editorKey}
        placeholder={`Message # ${channel.name}`}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default Page;
