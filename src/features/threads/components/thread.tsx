import { Button } from "@/components/ui/button";
import useGetMessage from "@/features/channels/api/use-get-channel-message";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import Message from "@/features/messages/components/message";
import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { AlertTriangle, Loader2, XIcon } from "lucide-react";
import React from "react";
type ThreadProps = {
  messageId: string;
  onClose: () => void;
  
};
function Thread({ messageId, onClose }: ThreadProps) {
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const {member} = useCurrentMember({workspaceId})
  const { message, isMessageLoading } = useGetMessage({
    workspaceId,
    channelId,
    messageId,
  });
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

  if (!message)
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
          memberId={message.memberId}
          authorImage={message.member?.user.avatarUrl}
          authorName={message.member?.user?.fullname}
          isAuthor={message.memberId == member?.id}
          body={message.body}
          attachments={message.attachments}
          createdAt={message.createdAt!}
          id={message.id}
          updatedAt={message.updatedAt}
          reactions={message.reactions}
          isEditing={false}
          setEditingId={()=>{}}
          onDelete={()=>{}}
          onEdit={()=>{}}
          onReact={()=>{}}
          isCompact={false}
          editingId={null}
        />
      </div>
    </div>
  );
}

export default Thread;
