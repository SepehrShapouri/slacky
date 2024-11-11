import ChannelHero from "@/features/channels/components/channel-hero";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import Message from "@/features/messages/components/message";
import { ModifiedMessage } from "@/features/messages/lib/types";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import React, { useState } from "react";
type MessageListProps = {
  memberName?: string;
  memberImage?: string;
  channelName?: string;
  channelCreationTime?: Date;
  variant?: "channel" | "thread" | "conversation";
  data: ModifiedMessage[];
  loadMore: () => void;
  canLoadMore: boolean;
  isLoadingMore: boolean;
  onDelete: (messageId: string) => void;
  onEdit:(messageId: string, newBody: string) => void
  onReact:(reaction:string,messageId:string)=>void
};
const TIME_THRESHOLD = 5;
function MessageList({
  canLoadMore,
  data,
  isLoadingMore,
  loadMore,
  channelName,
  channelCreationTime,
  memberImage,
  memberName,
  variant = "channel",
  onDelete,
  onEdit,
  onReact
}: MessageListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const workspaceId = useWorkspaceId();
  const { member } = useCurrentMember({ workspaceId });
  const groupMessages = data.reduce((groups, message) => {
    const dateKey = format(message.createdAt!, "yyyy-MM-dd");
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].unshift(message);
    return groups;
  }, {} as Record<string, typeof data>);
  function formatDateLabel(dateStr: string) {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "yesterday";
    return format(date, "EEEE, MMMM d");
  }
  
  return (
    <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
      {Object.entries(groupMessages || {}).map(([dateKey, messages]) => (
        <div key={dateKey}>
          <div className="text-center my-2 relative">
            <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
            <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
              {formatDateLabel(dateKey)}
            </span>
          </div>
          {messages.map((message, index) => {
            const previousMessage = messages[index - 1];
            const isCompact =
              previousMessage &&
              previousMessage.member?.userId == message.member?.userId &&
              differenceInMinutes(
                message.createdAt!,
                previousMessage.createdAt!
              ) < TIME_THRESHOLD;

            return (
              <Message
                isPending={message.isPending}
                isAuthor={message.memberId == member?.id}
                key={message.id}
                id={message.id}
                memberId={message.memberId}
                authorImage={message.member?.user.avatarUrl}
                authorName={message.member?.user.fullname}
                reactions={message.reactions}
                body={message.body}
                attachments={message.attachments}
                updatedAt={message.updatedAt}
                onDelete={onDelete}
                createdAt={message.createdAt!}
                threadCount={0}
                threadImage={"str"}
                threadTimestamp={"10234353453"}
                isEditing={editingId == message.id}
                setEditingId={(id:string | null)=>setEditingId(id)}
                editingId={editingId}
                isCompact={isCompact}
                hideThreadButton={variant === "thread"}
                onEdit={onEdit}
                onReact={onReact}
              />
            );
          })}
        </div>
      ))}
      {variant === "channel" && channelName && channelCreationTime && (
        <ChannelHero name={channelName} creationTime={channelCreationTime} />
      )}
    </div>
  );
}

export default MessageList;
