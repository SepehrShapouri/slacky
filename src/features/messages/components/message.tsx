import EditorSkeletons from "@/components/editor-skeletons";
import Hint from "@/components/hint";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePanel } from "@/hooks/use-panel";
import useSession from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { Reactions } from "@prisma/client";
import { format, isToday, isYesterday } from "date-fns";
import hljs from "highlight.js";
import { Loader2, User } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import Reaction from "./reaction";
import Thumbnail from "./thumbnail";
import Toolbar from "./toolbar";
type ReactionType = Reactions & {
  member: { user: { fullname: string; avatarUrl: string } };
};
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
    loading: () => <EditorSkeletons />,
  }
);
type MessageProps = {
  isAuthor: boolean;
  id: string;
  memberId: number;
  authorImage: string | null | undefined;
  authorName?: string;
  reactions: ReactionType[];
  body: string;
  attachments: string[];
  updatedAt?: Date;
  createdAt: Date;
  threadCount?: number;
  threadImage?: string;
  threadTimestamp?: Date;
  threadImageFallback?: string;
  isEditing: boolean;
  setEditingId: (id: string) => void;
  isCompact?: boolean;
  hideThreadButton?: boolean;
  isPending?: boolean;
  onDelete: (messageId: string) => void;
  editingId: string | null;
  onEdit: (messageId: string, newBody: string) => void;
  onReact: (reaction: string, messageId: string) => void;
  variant: "thread" | "channel" | "conversation";
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
  threadImageFallback,
  onEdit,
  editingId,
  onReact,
  variant = "channel",
}: MessageProps) {
  function countEmoji(reactions: ReactionType[], emoji: string): number {
    return reactions.filter((reaction) => reaction.value === emoji).length;
  }
  const { onOpenMessage, onClose, parentMessageId } = usePanel();

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
  const uniqueReactions = useMemo(() => {
    if (!reactions) return [];
    const uniqueEmojis = new Set(reactions.map((r) => r.value));
    return Array.from(uniqueEmojis).map((emoji) => ({
      value: emoji,
      count: countEmoji(reactions, emoji),
      users: reactions
        .filter((r) => r.value === emoji)
        .map((r) => r.member.user.fullname),
      members: reactions
        .filter((r) => r.value === emoji)
        .map((r) => r.memberId),
    }));
  }, [reactions]);

  if (isCompact)
    return (
      <div
        id={id}
        className={cn(
          "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
          isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]"
        )}
      >
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
              {attachments.length ? (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((image) => (
                    <Thumbnail image={image} />
                  ))}
                </div>
              ) : null}
              {updatedAt && isEdited ? (
                <span className="!text-xs text-muted-foreground">(edited)</span>
              ) : null}

              {!!uniqueReactions.length && (
                <div className="flex items-center flex-wrap gap-2 mt-1.5">
                  {uniqueReactions.map((reaction) => (
                    <Reaction
                      reaction={reaction}
                      onReact={onReact}
                      messageId={id}
                    />
                  ))}
                </div>
              )}
              {variant !== "thread" && !!threadCount && threadCount > 0 && (
                <div
                  onClick={() => onOpenMessage(id)}
                  className="cursor-pointer flex items-center gap-1.5 p-1 group/reply hover:bg-white hover:border-zinc-200 border border-transparent   rounded-md mt-1 transition"
                >
                  <Avatar className="size-6 rounded-md ">
                    <AvatarImage className="rounded-lg" src={threadImage} />
                    <AvatarFallback className="bg-sky-500 font-semibold text-white rounded-lg">
                      {threadImageFallback}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm text-sky-800 font-semibold">
                    {threadCount} {threadCount > 1 ? "replies" : "reply"}
                  </p>
                  <p className="text-xs text-muted-foreground group-hover/reply:hidden">
                    Last reply{" "}
                    {threadTimestamp ? formatFullTime(threadTimestamp) : "NA"}
                  </p>
                  <p className="text-xs text-muted-foreground group-hover/reply:inline hidden">
                    View thread
                  </p>
                </div>
              )}
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
            handleThread={() => onOpenMessage(id)}
            handleDelete={() => onDelete(id)}
            hideThreadButton={hideThreadButton}
            handleReaction={(value: string) => onReact(value, id)}
          />
        )}
      </div>
    );

  return (
    <div
    id={id}
      className={cn(
        "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
        isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]"
      )}
    >
      <div className="flex items-start gap-2">
        <button className="mt-[2.43px]">
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
          <div className="flex flex-col w-full overflow-hidden ">
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
            {attachments.length ? (
              <div className="flex flex-wrap gap-2">
                {attachments.map((image) => (
                  <Thumbnail image={image} />
                ))}
              </div>
            ) : null}
            {updatedAt && isEdited ? (
              <span className="!text-xs text-muted-foreground">(edited)</span>
            ) : null}
            {!!uniqueReactions.length && (
              <div className="flex items-center flex-wrap gap-2 mt-1.5">
                {uniqueReactions.map((reaction) => (
                  <Reaction
                    reaction={reaction}
                    messageId={id}
                    onReact={onReact}
                  />
                ))}
              </div>
            )}
            {variant !== "thread" && !!threadCount && threadCount > 0 && (
              <div
                onClick={() => onOpenMessage(id)}
                className="cursor-pointer flex items-center gap-1.5 p-1 group/reply hover:bg-white hover:border-zinc-200 border border-transparent   rounded-md mt-1 transition"
              >
                <Avatar className="size-6 rounded-md ">
                  <AvatarImage className="rounded-lg" src={threadImage} />
                  <AvatarFallback className="bg-sky-500 font-semibold text-white rounded-lg">
                    {threadImageFallback}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-sky-800 font-semibold">
                  {threadCount} {threadCount > 1 ? "replies" : "reply"}
                </p>
                <p className="text-xs text-muted-foreground group-hover/reply:hidden">
                  Last reply{" "}
                  {threadTimestamp ? formatFullTime(threadTimestamp) : "NA"}
                </p>
                <p className="text-xs text-muted-foreground group-hover/reply:inline hidden">
                  View thread
                </p>
              </div>
            )}
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
          handleThread={() => onOpenMessage(id)}
          handleDelete={() => {
            onDelete(id);
            if (parentMessageId === id) {
              onClose();
            }
          }}
          hideThreadButton={hideThreadButton}
          handleReaction={(value: string) => onReact(value, id)}
        />
      )}
    </div>
  );
}

export default Message;
