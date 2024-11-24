import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
const userItemVariants = cva(
  "flex items-center gap-1.5 justify-start font-normal h-7 px-4 text-sm overflow-hidden",
  {
    variants: {
      variant: {
        default: "text-[#f9edffcc]",
        active: "text-[#481349] bg-white/90 hover:bg-white/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
type UserItemProps = {
  id: number;
  label?: string;
  image?: string;
  variant?: VariantProps<typeof userItemVariants>["variant"];
  isOnline?: boolean;
};
export default function UserItem({
  id,
  image,
  label = "Member",
  variant,
  isOnline,
}: UserItemProps) {
  const workspaceId = useWorkspaceId();
  const { member } = useCurrentMember({ workspaceId });
  const avatarFallback = label.charAt(0).toUpperCase();

  return (
    <Button
      variant="transparent"
      className={cn(userItemVariants({ variant }))}
      size="sm"
      asChild
    >
      <Link href={`/workspace/${workspaceId}/member/${id}`}>
        <div className="relative">
          <Avatar className="size-5 rounded-md mr-1">
            <AvatarImage className="rounded-md" src={image} />
            <AvatarFallback className="rounded-md text-xs bg-sky-500 text-white font-semibold">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <span className="flex items-center justify-center size-2 rounded-full bg-[#481349] absolute bottom-0 right-0">
              <span className="size-1.5 bg-[#007a5a]  rounded-full shrink-0 " />
            </span>
          )}
        </div>
        <span className="text-sm truncate">{label}</span>
        {id == member?.id && <span className="text-white/40 text-xs">you</span>}
        {id !== member?.id && (
          <span className="size-4 text-xs tabular-nums bg-rose-600 text-white font-bold flex items-center justify-center rounded-full">
            5
          </span>
        )}
      </Link>
    </Button>
  );
}
