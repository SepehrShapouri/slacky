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
  const { user } = useSession();
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
        member: {
          ...item.member!,
        },
      })
    );
    setMessages(formattedMessages);
  }, [initialMessages, setMessages, isMessagesLoading]);

  useEffect(() => {
    if (socket && channelId) {
      socket.emit("join-room", channelId,member?.id);
      socket.on("user-online",(memberId:number)=>{
        console.log('user is online',memberId)
      })
      socket.on("new-message", (message: ModifiedMessage) => {
        
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
            return [message, ...prevMessages];
          }
        });
      });
      socket.on("message-updated", (updatedMessage: ModifiedMessage) => {
        
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id == updatedMessage.id ? updatedMessage : msg
          )
        );
      });
      socket.on(
        "message-deleted",
        (deletedMessageId: string, memberId: number) => {
          setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg.id !== deletedMessageId)
          );
          if (memberId == member?.id) {
            toast.success("Message deleted");
          }
        }
      );
      socket.on("error", (error: string) => {
        console.error("Socket error:", error);
        toast.error("Something went wrong");
        // Remove the pending message on error
        setMessages((prevMessages) => prevMessages.filter((m) => !m.isPending));
      });
    }

    return () => {
      if (socket) {
        socket.off("new-message");
        socket.off("error");
        socket.off("message-updated");
        socket.off("message-deleted");
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
          member: {
            ...member,
            user: {
              email: user?.email!,
              fullname: user?.fullname!,
              avatarUrl: user?.avatarUrl || undefined,
            },
          },
        };
        
        // Optimistically add the message
        setMessages((prevMessages) => [newMessage, ...prevMessages]);

        // Emit the message to the server
        socket.emit("send-message", newMessage);
        setEditorkey((prev) => prev + 1);
      }
    },
    [socket, member, workspaceId, channelId]
  );
  const deleteMessage = useCallback(
    (messageId: string) => {
      if (socket && channelId) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== messageId)
        );
        socket.emit("delete-message", messageId, channelId);
      }
    },
    [socket, channelId]
  );

  const editMessage = useCallback((messageId: string, newBody: string) => {
    if (socket && newBody.trim() && member && workspaceId && channelId) {
      const editedMessage = {
        id: messageId,
        body: newBody,
        memberId: member.id,
        workspaceId,
        channelId,
      };
      // Optimistic update
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, body: newBody } : msg
        )
      );
      socket.emit("edit-message", editedMessage);
      // setEditingId(null);
    }
  }, [socket, member, workspaceId, channelId]);
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
        onDelete={deleteMessage}
        onEdit={editMessage}
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


