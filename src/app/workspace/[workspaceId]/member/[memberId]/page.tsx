"use client";
import AnimatedLogo from "@/components/animated-logo";
import MessageList from "@/components/message-list";
import MessageListSkeleton from "@/components/message-list-skeleton";
import ChatInput from "@/features/channels/components/chat-input";
import Header from "@/features/direct-messages/components/header";
import useFindOrCreateConversation from "@/features/direct-messages/hooks/use-find-or-create-conversation";
import { useGetMessages } from "@/features/direct-messages/hooks/use-get-messages";
import { generateConversationKey } from "@/features/direct-messages/lib/utils";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { ModifiedMessage, ReactionType } from "@/features/messages/lib/types";
import { useCreateMessagesAtom } from "@/features/messages/store/use-create-messages-atom";
import { generateJoinCode } from "@/features/workspaces/lib/utils";
import { useMemberId } from "@/hooks/use-member-id";
import useSession from "@/hooks/use-session";
import useSingleMember from "@/hooks/use-single-member";
import { useSocket } from "@/hooks/use-socket";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
type EditorValue = {
  attachments?: string[];
  body: string;
};

function page() {
  const [editorKey, setEditorKey] = useState<number>(0);
  const socket = useSocket("conversation");
  const [messages, setMessages] = useCreateMessagesAtom();
  const workspaceId = useWorkspaceId();
  const memberId = useMemberId();
  const { user } = useSession();
  const { member: currentMember, isMemberLoading: isCurrentMemberLoading } =
    useCurrentMember({ workspaceId });

  const { member, isMemberLoading } = useSingleMember({ memberId });
  const memberOneId = currentMember?.id!;
  const memberTwoId = memberId!;
  const { conversation, isConversationloading } = useFindOrCreateConversation({
    workspaceId,
    memberOneId,
    memberTwoId,
  });
  const conversationId = conversation?.id;
  const { messages: initialMessages, isMessagesLoading } = useGetMessages({
    conversationId,
    workspaceId,
  });
  useEffect(() => {
    if (isMessagesLoading) return;
    if (!initialMessages) return;
    const formattedMessages: ModifiedMessage[] = initialMessages.map(
      (item) => ({
        body: item.body,
        conversationId: item.conversationId!,
        id: item.id,
        memberId: item.memberId,
        workspaceId: item.workspaceId,
        attachments: item.attachments,

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
    if (socket && conversationId) {
      socket.emit("join-room", conversationId, currentMember?.id);

      socket.on("new-message", (message: ModifiedMessage) => {
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
          if (memberId == currentMember?.id) {
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
        socket.emit("leave-room", conversationId);
      }
    };
  }, [socket, conversationId]);

  const onSubmit = useCallback(
    ({ body, attachments }: EditorValue) => {
      if (
        socket &&
        body &&
        member &&
        currentMember &&
        workspaceId &&
        conversationId
      ) {
        const key = generateJoinCode();
        const newMessage: ModifiedMessage = {
          body,
          memberId: currentMember?.id,
          workspaceId,
          userId: currentMember.userId,
          key,
          id: key,
          isPending: true,
          attachments: attachments || [],
          conversationId,
          parentId: null,
          createdAt: new Date(),
          member: {
            ...currentMember,
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
        setEditorKey((prev) => prev + 1);
      }
    },
    [socket, member, workspaceId, conversationId, currentMember]
  );
  const deleteMessage = useCallback(
    (messageId: string) => {
      if (socket && conversationId) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== messageId)
        );
        socket.emit("delete-message", messageId, conversationId);
      }
    },
    [socket, conversationId]
  );

  const editMessage = useCallback(
    (messageId: string, newBody: string) => {
      if (
        socket &&
        newBody.trim() &&
        currentMember &&
        workspaceId &&
        conversationId
      ) {
        const editedMessage = {
          id: messageId,
          body: newBody,
          memberId: currentMember.id,
          workspaceId,
          conversationId,
        };

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, body: newBody } : msg
          )
        );
        socket.emit("edit-message", editedMessage);
      }
    },
    [socket, currentMember, workspaceId, conversationId]
  );

  const reactToMessage = useCallback(
    (reaction: string, messageId: string) => {
      if (!currentMember || !user) return;

      setMessages((prevMessages) => {
        return prevMessages.map((msg) => {
          if (msg.id !== messageId) return msg;

          const existingReactionIndex = msg.reactions.findIndex(
            (r) => r.memberId === currentMember.id && r.value === reaction
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
            memberId: currentMember.id,
            messageId,
          };
          return { ...msg, reactions: [...msg.reactions, newReaction] };
        });
      });

      socket?.emit("reaction", {
        reaction,
        messageId,
        memberId: currentMember.id,
        conversationId,
      });
    },
    [currentMember, user, conversationId, socket]
  );

  if (isCurrentMemberLoading || isMemberLoading) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <AnimatedLogo />
        <p className="text-sm text-muted-foreground">Loading conversation...</p>
      </div>
    );
  }
  if (isMessagesLoading) return <MessageListSkeleton />;
  return (
    <div className="flex flex-col h-full">
      <Header
        fallback={member?.user?.fullname[0].toUpperCase() || "M"}
        name={member?.user?.fullname || "Member"}
        avatarUrl={member?.user?.avatarUrl || undefined}
        topic="Tasks"
      />

      <MessageList
        variant="conversation"
        avatarUrl={member?.user?.avatarUrl || undefined}
        userName={member?.user?.fullname}
        userNameFallback={member?.user?.fullname[0].toUpperCase()}
        data={messages}
        onDelete={deleteMessage}
        onEdit={editMessage}
        onReact={reactToMessage}
      />
      <ChatInput
        editorKey={editorKey}
        onSubmit={onSubmit}
        placeholder={`Say what's up to @${member?.user?.fullname}...or bomb him with tasks, your choice!`}
      />
    </div>
  );
}

export default page;
