import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import useSession from "@/hooks/use-session";
import { useChannelId } from "@/hooks/use-channel-id";
import { useSocket } from "@/hooks/use-socket";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import ParentMessage from "@/features/messages/components/message";
import { ModifiedMessage, ReactionType } from "@/features/messages/lib/types";
import { useCreateMessagesAtom } from "@/features/messages/store/use-create-messages-atom";

import { useCurrentMember } from "@/features/members/api/use-current-member";

import useGetMessage from "@/features/channels/api/use-get-channel-message";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import EditorSkeletons from "@/components/editor-skeletons";
import hljs from "highlight.js";

import { AlertTriangle, Loader2, XIcon } from "lucide-react";
import { generateJoinCode } from "@/features/workspaces/lib/utils";
import Quill from "quill";
import MessageList from "@/components/message-list";
type EditorValue = {
  attachments?: string[];
  body: string;
};
const Editor = dynamic(
  () => {
    hljs.configure({ languages: ["javascript", "css", "html"] });
    //@ts-ignore
    window.hljs = hljs;
    return import("@/components/editor");
  },
  {
    ssr: false,
    loading: () => <EditorSkeletons />,
  }
);

type ThreadProps = {
  messageId: string;
  onClose: () => void;
};

function Thread({ messageId, onClose }: ThreadProps) {
  const [editorKey, setEditorkey] = useState<number>(0);
  // const [threadMessages, setThreadMessages] = useState<ModifiedMessage[]>();
  const editorRef = useRef<Quill | null>(null);
  //threadId = messageId+channelI
  const { user } = useSession();
  const socket = useSocket("channels");
  const threadSocket = useSocket("threads");

  const [_messages, setMessages] = useCreateMessagesAtom();

  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const { member } = useCurrentMember({ workspaceId });

  const threadId = `${messageId}_${channelId}`;

  const [editingId, setEditingId] = useState<string | null>(null);
  

  const { message, isMessageLoading } = useGetMessage({
    workspaceId,
    channelId,
    messageId,
  });
  const [parentMessage, setParentMessage] = useState<ModifiedMessage>();
  const [parentReplies, setParentReplies] = useState<ModifiedMessage[]>([]);

  useEffect(() => {
    if (isMessageLoading) return;
    if (!message) return;
    setParentMessage(message);
    setParentReplies(message.replies || []);
  }, [isMessageLoading, setParentMessage, message, setParentReplies]);

  useEffect(() => {
    if (socket && channelId) {
      socket.emit("join-room", channelId, member?.id);
      socket.on("user-online", (memberId: number) => {
        console.log("user is online", memberId);
      });

      socket.on("message-updated", async (updatedMessage: ModifiedMessage) => {
        setParentMessage((prevParentMessage) => ({
          ...prevParentMessage!,
          body: updatedMessage.body,
          updatedAt: new Date(),
        }));
      });

      socket.on(
        "message-deleted",
        (deletedMessageId: string, memberId: number) => {
          if (parentMessage?.memberId != member?.id) {
            toast.info("This thread has been deleted!");
          }
          setParentMessage(undefined);
          onClose();
        }
      );

      socket.on("reaction-added", (updatedMessage: ModifiedMessage) => {
        setParentMessage(updatedMessage);
      });

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

  useEffect(() => {
    if (threadSocket && threadId) {
      threadSocket.emit("join-thread", threadId, member?.id);
      threadSocket.on("new-message", (newReply: ModifiedMessage) => {
        setParentReplies((prevMessages) => {
          const existingMessageIndex = prevMessages.findIndex(
            (m) => m.key === newReply.key
          );
          if (existingMessageIndex !== -1) {
            const updatedMessages = [...prevMessages];
            updatedMessages[existingMessageIndex] = {
              ...newReply,
              isPending: false,
            };
            return updatedMessages;
          } else {
            return [newReply, ...prevMessages];
          }
        });
      });
      threadSocket.on("message-updated", (updatedReply: ModifiedMessage) => {
        setParentReplies((prevReplies) =>
          prevReplies.map((msg) =>
            msg.id == updatedReply.id ? updatedReply : msg
          )
        );
      });

      threadSocket.on(
        "message-deleted",
        (deletedReplyId: string, memberId: number) => {
          setParentReplies((prevReplies) =>
            prevReplies.filter((reply) => reply.id !== deletedReplyId)
          );
          if (memberId == member?.id) {
            toast.success("Message deleted");
          }
        }
      );
      threadSocket.on("reaction-added", (updatedMessage: ModifiedMessage) => {
        
        setParentReplies((prevReplies) =>
          prevReplies.map((msg) =>
            msg.id == updatedMessage.id ? updatedMessage : msg
          )
        );
      });

      threadSocket.on("error", (error: string) => {
        console.error("threadSocket error:", error);
        toast.error("Something went wrong");

        setParentReplies((prevReplies) => prevReplies.filter((m) => !m.isPending));
      });
    }

    return () => {
      if (threadSocket) {
        threadSocket.off("reaction-added");
        threadSocket.off("new-message");
        threadSocket.off("error");
        threadSocket.off("message-updated");
        threadSocket.off("message-deleted");
        threadSocket.emit("leave-room", threadId);
      }
    };
  }, [threadSocket, threadId]);

  const onSubmit = useCallback(
    ({ body, attachments }: EditorValue) => {
      if (
        threadSocket &&
        body &&
        member &&
        workspaceId &&
        channelId &&
        threadId
      ) {
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
          parentId: messageId,
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

        // setThreadMessages((prevThreads) => [newMessage, ...prevThreads]);
        setParentReplies((prevReplies) => [newMessage, ...prevReplies]);

        threadSocket.emit("send-message", {
          message: newMessage,
          parentMessageId: messageId,
          threadId,
        });

        setEditorkey((prev) => prev + 1);
      }
    },
    [threadSocket, member, workspaceId, channelId]
  );

  const deleteParentMessage = useCallback(
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

  const editParentMessage = useCallback(
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

  const reactToParentMessage = useCallback(
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

  const deleteReply = useCallback(
    (replyId: string) => {
      if (threadSocket && channelId) {
        setParentReplies((prevReplies) =>
          prevReplies.filter((msg) => msg.id !== replyId)
        );
        threadSocket.emit("delete-message", replyId, threadId);
      }
    },
    [threadSocket, threadId]
  );

  const editReply = useCallback(
    (replyId: string, newBody: string) => {
      if (
        threadSocket &&
        newBody.trim() &&
        member &&
        workspaceId &&
        channelId
      ) {
        const editedReply = {
          id: replyId,
          body: newBody,
          memberId: member.id,
          workspaceId,
          channelId,
        };

        setParentReplies((prevReplies) =>
          prevReplies.map((reply) =>
            reply.id === replyId ? { ...reply, body: newBody } : reply
          )
        );
        threadSocket.emit("edit-message", editedReply,threadId);
      }
    },
    [threadSocket, member, workspaceId, channelId]
  );

  const reactToReply = useCallback(
    (reaction: string, replyId: string) => {
      if (!member || !user) return;

      setParentReplies((prevReplies) => {
        return prevReplies.map((msg) => {
          if (msg.id !== replyId) return msg;

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
            messageId:replyId,
          };
          return { ...msg, reactions: [...msg.reactions, newReaction] };
        });
      });

      threadSocket?.emit("reaction", {
        reaction,
        threadId,
        memberId: member.id,
        messageId:replyId,
      });
    },
    [member, user, threadId, threadSocket]
  );

  if (isMessageLoading)
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center h-[49px] shrink-0 px-4 border-b">
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
        <div className="flex justify-between items-center h-[49px] shrink-0 px-4 border-b">
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
      <div className="flex justify-between items-center h-[49px] shrink-0 px-4 border-b">
        <p className="text-lg font-bold">Thread</p>
        <Button onClick={onClose} size="iconSm" variant="ghost">
          <XIcon className="size-5 stroke-1.5" />
        </Button>
      </div>
      <div>
        <ParentMessage
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
          onDelete={deleteParentMessage}
          onEdit={editParentMessage}
          onReact={reactToParentMessage}
          isCompact={false}
          editingId={null}
        />
        <div className="px-4 flex items-center gap-3 py-2">
          <p className="text-xs text-gray-500">
            {parentReplies.length} replies
          </p>
          <span className="flex-1 h-px w-full bg-gray-300" />
        </div>
      </div>
      {!!parentMessage.replies && (
        <MessageList
          variant="thread"
          data={parentReplies}
          onDelete={deleteReply}
          onReact={reactToReply}
          onEdit={editReply}
        />
      )}
      <div className="px-4">
        <Editor
          onSubmit={onSubmit}
          disabled={false}
          placeholder="Reply..."
          key={editorKey}
          innerRef={editorRef}
        />
      </div>
    </div>
  );
}

export default Thread;
