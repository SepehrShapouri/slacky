import React from "react";
import dynamic from "next/dynamic";
import { Reactions } from "@prisma/client";
import { Delta, Op } from "quill/core";
import { format, isToday, isYesterday } from "date-fns";
import Hint from "@/components/hint";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import Thumbnail from "./thumbnail";
import hljs from "highlight.js";
import Toolbar from "./toolbar";
import { cn } from "@/lib/utils";

const Renderer = dynamic(
  () => {
    hljs.configure({ languages: ["javascript", "html", "css"] });
    //@ts-ignore
    window.hljs = hljs;
    return import("@/features/messages/components/renderer");
  },
  { ssr: false }
);
const Editor = dynamic(
  () => {
    hljs.configure({ languages: ["javascript", "css", "html"] });
    //@ts-ignore
    window.hljs = hljs;
    return import("@/components/editor");
  },
  {
    ssr: false,
    loading: () => <p>lodaing..</p>,
  }
);
type MessageProps = {
  isAuthor: boolean;
  id: string;
  memberId: number;
  authorImage: string | null | undefined;
  authorName?: string;
  reactions: Reactions[];
  body: string;
  attachments: string[];
  updatedAt?: Date;
  createdAt: Date;
  threadCount?: number;
  threadImage?: string;
  threadTimestamp?: string;
  isEditing: boolean;
  setEditingId: (id: string) => void;
  isCompact?: boolean;
  hideThreadButton?: boolean;
  isPending?: boolean;
  onDelete: (messageId: string) => void;
  editingId: string | null;
  onEdit: (messageId: string, newBody: string) => void;
};

function Message({
  attachments,
  authorImage,
  authorName = "member",
  body,
  createdAt,
  hideThreadButton,
  id,
  isAuthor,
  isCompact,
  isEditing,
  memberId,
  reactions,
  setEditingId,
  threadCount,
  threadImage,
  threadTimestamp,
  updatedAt,
  isPending,
  onDelete,
  onEdit,
  editingId,
}: MessageProps) {
  function isEqualDate(date1: Date, date2?: Date) {
    if (!date2 || !date1) return false;
    if (typeof date1 == "string" && typeof date2 == "string") {
      const formattedDate1 = new Date(date1);
      const formattedDate2 = new Date(date2);
      return formattedDate1.getTime() === formattedDate2.getTime();
    }
    return date1.getTime() === date2.getTime();
  }
  function formatFullTime(date: Date) {
    return `${
      isToday(date)
        ? "Today"
        : isYesterday(date)
        ? "Yesterdat"
        : format(date, "MMM d, yyy")
    } at ${format(date, "HH:mm:ss")}`;
  }
  const avatarFallback = authorName.charAt(0).toUpperCase();
  const isEdited = !isEqualDate(createdAt, updatedAt);
  function handleEdit(body: string) {
    onEdit(id, body);
    setEditingId("not-editing");
  }
  
  if (isCompact)
    return (
      <div className="flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative">
        <div className="flex items-start gap-2">
          <Hint label={formatFullTime(createdAt)}>
            <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
              {format(createdAt, "kk:mm")}
            </button>
          </Hint>
          {isEditing ? (
            <div className="w-full h-full">
              <Editor
                onSubmit={({ body }) => handleEdit(body)}
                onCancel={() => setEditingId("not-editing")}
                variant="update"
                defaultValue={JSON.parse(body)}
                disabled={false}
              />
            </div>
          ) : (
            <div className="flex flex-col w-full">
              <Renderer value={body} />
              {attachments ? (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((image) => (
                    <Thumbnail image={image} />
                  ))}
                </div>
              ) : null}
              {updatedAt && isEdited ? (
                <span className="!text-xs text-muted-foreground">(edited)</span>
              ) : null}
            </div>
          )}
          {isPending && (
            <Loader2 className="animate-spin size-4 text-muted-foreground " />
          )}
        </div>
        {!isEditing && !isPending && (
          <Toolbar
            isAuthor={isAuthor}
            isPending={false}
            handleEdit={() => setEditingId(id)}
            handleThread={() => {}}
            handleDelete={() => onDelete(id)}
            hideThreadButton={hideThreadButton}
            handleReaction={(value: string) => {}}
          />
        )}
      </div>
    );

  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
        isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]"
      )}
    >
      <div className="flex items-start gap-2">
        <button>
          <Avatar className="size-9 rounded-lg ">
            <AvatarImage
              className="rounded-lg"
              src={authorImage || undefined}
            />
            <AvatarFallback className="bg-sky-500 font-semibold text-white rounded-lg">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </button>
        {isEditing ? (
          <div className="w-full h-full">
            <Editor
              onSubmit={({ body }) => handleEdit(body)}
              onCancel={() => setEditingId("not-editing")}
              variant="update"
              defaultValue={JSON.parse(body)}
              disabled={false}
            />
          </div>
        ) : (
          <div className="flex flex-col w-full overflow-hidden">
            <div className="text-sm">
              <button
                className="font-bold text-primary hover:underline"
                onClick={() => {}}
              >
                {authorName}
              </button>
              <span>&nbsp;&nbsp;</span>
              <Hint label={formatFullTime(createdAt)}>
                <button className="text-xs text-muted-foreground hover:underline">
                  {format(createdAt, "HH:mm")}
                </button>
              </Hint>
            </div>
            <Renderer value={body} />
            {attachments ? (
              <div className="flex flex-wrap gap-2">
                {attachments.map((image) => (
                  <Thumbnail image={image} />
                ))}
              </div>
            ) : null}
            {updatedAt && isEdited ? (
              <span className="!text-xs text-muted-foreground">(edited)</span>
            ) : null}
          </div>
        )}
        {isPending && (
          <Loader2 className="animate-spin size-4 text-muted-foreground " />
        )}
      </div>
      {!isEditing && !isPending && (
        <Toolbar
          isAuthor={isAuthor}
          isPending={false}
          handleEdit={() => setEditingId(id)}
          handleThread={() => {}}
          handleDelete={() => onDelete(id)}
          hideThreadButton={hideThreadButton}
          handleReaction={(value: string) => {}}
        />
      )}
    </div>
  );
}

export default Message;
