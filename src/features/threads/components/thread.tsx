import { Button } from "@/components/ui/button";
import useGetMessage from "@/features/channels/api/use-get-channel-message";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import Message from "@/features/messages/components/message";
import { ModifiedMessage, ReactionType } from "@/features/messages/lib/types";
import { useCreateMessagesAtom } from "@/features/messages/store/use-create-messages-atom";
import { useChannelId } from "@/hooks/use-channel-id";
import useSession from "@/hooks/use-session";
import { useSocket } from "@/hooks/use-socket";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2, XIcon } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
type ThreadProps = {
  messageId: string;
  onClose: () => void;
};
function Thread({ messageId, onClose }: ThreadProps) {
  const { user } = useSession();
  const socket = useSocket("channels");

  const queryClient = useQueryClient();
  const queryKey = ["message", messageId];

  const [messages, setMessages] = useCreateMessagesAtom();

  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const { member } = useCurrentMember({ workspaceId });

  const [editingId, setEditingId] = useState<string | null>(null);
  const { message, isMessageLoading } = useGetMessage({
    workspaceId,
    channelId,
    messageId,
  });
  const [parentMessage, setParentMessage] = useState<ModifiedMessage>();
  useEffect(() => {
    if (isMessageLoading) return;
    if (!message) return;
    setParentMessage(message);
  }, [isMessageLoading, setParentMessage, message]);
  useEffect(() => {
    if (socket && channelId) {
      socket.emit("join-room", channelId, member?.id);
      socket.on("user-online", (memberId: number) => {
        console.log("user is online", memberId);
      });
      //edit
      socket.on("message-updated", async (updatedMessage: ModifiedMessage) => {
        setParentMessage((prevParentMessage) => ({
          ...prevParentMessage!,
          body: updatedMessage.body,
          updatedAt: new Date(),
        }));
      });
      //delete
      socket.on(
        "message-deleted",
        (deletedMessageId: string, memberId: number) => {
          // setMessages((prevMessages) =>
          //   prevMessages.filter((msg) => msg.id !== deletedMessageId)
          // );
          // if (memberId == member?.id) {
          //   toast.success("Message deleted");
          // }
          if (parentMessage?.memberId != member?.id) {
            toast.info("This thread has been deleted!");
          }
          setParentMessage(undefined);
          onClose();
        }
      );
      //react
      socket.on("reaction-added", (updatedMessage: ModifiedMessage) => {
        // setMessages((prevMessages) =>
        //   prevMessages.map((msg) =>
        //     msg.id == updatedMessage.id ? updatedMessage : msg
        //   )
        // );
        setParentMessage(updatedMessage);
      });
      //error
      socket.on("error", (error: string) => {
        console.error("Socket error:", error);
        toast.error("Something went wrong");

        setMessages((prevMessages) => prevMessages.filter((m) => !m.isPending));
      });
    }

    return () => {
      if (socket) {
        socket.off("reaction-added");
        socket.off("new-message");
        socket.off("error");
        socket.off("message-updated");
        socket.off("message-deleted");
        socket.emit("leave-room", channelId);
      }
    };
  }, [socket, channelId]);

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
    async (messageId: string, newBody: string) => {
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
        setParentMessage((prevParentMessage) => ({
          ...prevParentMessage!,
          body: newBody,
          updatedAt: new Date(),
        }));
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
      setParentMessage((prevMessage) => {
        if (!prevMessage) return undefined;

        const existingReactionIndex = prevMessage.reactions.findIndex(
          (r) => r.memberId === member.id && r.value === reaction
        );
        if (existingReactionIndex !== -1) {
          const updatedReactions = prevMessage.reactions.filter(
            (_, index) => index !== existingReactionIndex
          );
          return { ...prevMessage, reactions: updatedReactions };
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

        return {
          ...prevMessage,
          reactions: [...prevMessage.reactions, newReaction],
        };
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

  if (isMessageLoading)
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center h-[49px] px-4 border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button onClick={onClose} size="iconSm" variant="ghost">
            <XIcon className="size-5 stroke-1.5" />
          </Button>
        </div>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );

  if (!parentMessage)
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center h-[49px] px-4 border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button onClick={onClose} size="iconSm" variant="ghost">
            <XIcon className="size-5 stroke-1.5" />
          </Button>
        </div>
        <div className="flex flex-col gap-y-1.5 items-center justify-center h-full">
          <AlertTriangle className="size-5  text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Message not found.</p>
        </div>
      </div>
    );

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center h-[49px] px-4 border-b">
        <p className="text-lg font-bold">Thread</p>
        <Button onClick={onClose} size="iconSm" variant="ghost">
          <XIcon className="size-5 stroke-1.5" />
        </Button>
      </div>
      <div>
        <Message
          hideThreadButton
          memberId={parentMessage.memberId}
          authorImage={parentMessage.member?.user.avatarUrl}
          authorName={parentMessage.member?.user?.fullname}
          isAuthor={parentMessage.memberId == member?.id}
          body={parentMessage.body}
          attachments={parentMessage.attachments}
          createdAt={parentMessage.createdAt!}
          id={parentMessage.id}
          updatedAt={parentMessage.updatedAt}
          reactions={parentMessage.reactions}
          isEditing={editingId == messageId}
          setEditingId={setEditingId}
          onDelete={deleteMessage}
          onEdit={editMessage}
          onReact={reactToMessage}
          isCompact={false}
          editingId={null}
        />
      </div>
    </div>
  );
}

export default Thread;
