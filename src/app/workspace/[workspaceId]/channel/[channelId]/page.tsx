"use client";
import AnimatedLogo from "@/components/animated-logo";
import MessageList from "@/components/message-list";
import MessageListSkeleton from "@/components/message-list-skeleton";
import useGetChannel from "@/features/channels/api/use-get-channel";
import { useGetMessages } from "@/features/channels/api/use-get-channel-messages";
import ChatInput from "@/features/channels/components/chat-input";
import Header from "@/features/channels/components/header";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { ModifiedMessage, ReactionType } from "@/features/messages/lib/types";
import { useCreateMessagesAtom } from "@/features/messages/store/use-create-messages-atom";
import { generateJoinCode } from "@/features/workspaces/lib/utils";
import { useChannelId } from "@/hooks/use-channel-id";
import useSession from "@/hooks/use-session";
import { useSocket } from "@/hooks/use-socket";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Loader2, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
type EditorValue = {
  attachments?: string[];
  body: string;
};

function Page() {
  const [editorKey, setEditorkey] = useState<number>(0);
  const [messages, setMessages] = useCreateMessagesAtom();

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
        replies: [...(item.replies || [])],
        reactions: item.reactions,
      })
    );
    setMessages(formattedMessages);
  }, [initialMessages, setMessages, isMessagesLoading]);

  useEffect(() => {
    if (socket && channelId) {
      socket.emit("join-room", channelId, member?.id);
      socket.on("user-online", (memberId: number) => {
        console.log("user is online", memberId);
      });
      socket.on("new-message", (message: ModifiedMessage) => {
        console.log("new message", message);
        setMessages((prevMessages) => {
          const existingMessageIndex = prevMessages.findIndex(
            (m) => m.key === message.key
          );
          if (existingMessageIndex !== -1) {
            const updatedMessages = [...prevMessages];
            updatedMessages[existingMessageIndex] = {
              ...message,
              isPending: false,
            };
            return updatedMessages;
          } else {
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
      socket.on("reaction-added", (updatedMessage: ModifiedMessage) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id == updatedMessage.id ? updatedMessage : msg
          )
        );
      });
      socket.on("new-reply", (newReply: ModifiedMessage) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => {
            const existingReply = msg.replies?.find((r) => r.id == newReply.id);
            if (existingReply) return msg;
            return msg.id == newReply.parentId
              ? { ...msg, replies: [newReply, ...(msg.replies || [])] }
              : msg;
          })
        );
      });
      socket.on("error", (error: string) => {
        console.error("Socket error:", error);
        toast.error("Something went wrong");
        // Remove the pending message on error
        setMessages((prevMessages) => prevMessages.filter((m) => !m.isPending));
      });
    }

    return () => {
      if (socket) {
        socket.off("reaction-added");
        socket.off("new-reply");
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
          id: key,
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
          reactions: [],
        };

        setMessages((prevMessages) => [newMessage, ...prevMessages]);

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

  const editMessage = useCallback(
    (messageId: string, newBody: string) => {
      if (socket && newBody.trim() && member && workspaceId && channelId) {
        const editedMessage = {
          id: messageId,
          body: newBody,
          memberId: member.id,
          workspaceId,
          channelId,
        };

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, body: newBody } : msg
          )
        );
        socket.emit("edit-message", editedMessage);
      }
    },
    [socket, member, workspaceId, channelId]
  );

  const reactToMessage = useCallback(
    (reaction: string, messageId: string) => {
      if (!member || !user) return;

      setMessages((prevMessages) => {
        return prevMessages.map((msg) => {
          if (msg.id !== messageId) return msg;

          const existingReactionIndex = msg.reactions.findIndex(
            (r) => r.memberId === member.id && r.value === reaction
          );

          if (existingReactionIndex !== -1) {
            const updatedReactions = msg.reactions.filter(
              (_, index) => index !== existingReactionIndex
            );
            return { ...msg, reactions: updatedReactions };
          }

          const newReaction: ReactionType & {
            member: { user: { fullname: string; avatarUrl: string } };
          } = {
            id: Date.now(),
            createdAt: new Date(),
            member: {
              user: {
                fullname: user.fullname!,
                avatarUrl: user.avatarUrl!,
              },
            },
            value: reaction,
            memberId: member.id,
            messageId,
          };
          return { ...msg, reactions: [...msg.reactions, newReaction] };
        });
      });

      socket?.emit("reaction", {
        reaction,
        messageId,
        memberId: member.id,
        channelId,
      });
    },
    [member, user, channelId, socket]
  );

  if (isChannelLoading)
    return (
      <div className="h-full flex-1 flex-col flex items-center justify-center">
        <AnimatedLogo />
        <p className="text-sm text-muted-foreground">Loading channel...</p>
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
    if(isMessagesLoading) return <MessageListSkeleton/>
  return (
    <>
      <div className="flex flex-col h-full">
        <Header title={channel.name} />
        <MessageList
          channelName={channel.name}
          channelCreationTime={channel.createdAt}
          data={messages}
          onDelete={deleteMessage}
          onEdit={editMessage}
          onReact={reactToMessage}
        />

        <ChatInput
          editorKey={editorKey}
          placeholder={`Message # ${channel.name}`}
          onSubmit={onSubmit}
        />
      </div>
    </>
  );
}

export default Page;
