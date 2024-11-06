'use client'
import { EmojiPopover } from "@/components/emoji-popover";
import Hint from "@/components/hint";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { MessageSquareTextIcon, Pencil, SmileIcon, Trash } from "lucide-react";

type ToolbarProps = {
  isAuthor: boolean;
  isPending: boolean;
  handleEdit: () => void;
  handleThread: () => void;
  handleDelete: () => void;
  hideThreadButton?: boolean;
  handleReaction: (value: string) => void;
};

export default function Toolbar({
  handleDelete,
  handleEdit,
  handleThread,
  hideThreadButton,
  isAuthor,
  isPending,
  handleReaction,
}: ToolbarProps) {
    
  const [ConfirmDialog, confirm] = useConfirm(
    "Are yous sure?",
    "This action is irreversible"
  );

  async function deleteMessage() {
    const ok = await confirm();
    if (!ok) return;
    handleDelete();
  }
  return (
    <>
      <ConfirmDialog />
      <div className="absolute top-0 right-5">
        <div className="group-hover:opacity-100 opacity-0 transition-opacity border bg-white rounded-md shadow-sm">
          <EmojiPopover
            hint="React to this message"
            onEmojiSelect={(emoji) => handleReaction(emoji.native)}
          >
            <Button variant="ghost" size="iconSm" disabled={isPending}>
              <SmileIcon className="size-4" />
            </Button>
          </EmojiPopover>

          {!hideThreadButton && (
            <Hint label="Reply in thread">
              <Button variant="ghost" size="iconSm" disabled={isPending} onClick={handleThread}>
                <MessageSquareTextIcon className="size-4" />
              </Button>
            </Hint>
          )}

          {isAuthor && (
            <>
              <Hint label="Edit message">
                <Button variant="ghost" size="iconSm" disabled={isPending} onClick={handleEdit}>
                  <Pencil className="size-4" />
                </Button>
              </Hint>
              <Hint label="Delete message">
                <Button
                  variant="ghost"
                  size="iconSm"
                  disabled={isPending}
                  onClick={deleteMessage}
                >
                  <Trash className="text-destructive size-4" />
                </Button>
              </Hint>
            </>
          )}
        </div>
      </div>
    </>
  );
}
