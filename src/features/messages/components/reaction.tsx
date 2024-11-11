import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
type ReactionProps = {
  reaction: {
    value: string;
    count: number;
    users: string[];
    members: number[];
  };
  onReact: (reaction: string, messageId: string) => void;
  messageId:string
};
function Reaction({ reaction,onReact,messageId}: ReactionProps) {
    const workspaceId= useWorkspaceId()
    const {member} = useCurrentMember({workspaceId})
  return (
    <TooltipProvider key={reaction.value}>
      <Tooltip delayDuration={50}>
        <TooltipTrigger>
          <button
          onClick={()=>onReact(reaction.value,messageId)}
            className={cn(
              "flex h-6 items-center text-xs justify-center gap-1 bg-slate-200/70 border-transparent text-slate-800 border transition-all hover:scale-95  px-2  rounded-full",
              reaction.members.includes(member?.id!) &&
                "border-blue-500 bg-blue-100/70"
            )}
            aria-label={`${reaction.value} reaction, ${reaction.count} ${
              reaction.count === 1 ? "person" : "people"
            }`}
          >
            {reaction.value}
            <span className={cn("text-xs text-muted-foreground font-semibold transition-colors",reaction.members.includes(member?.id!) && 'text-blue-500')}>
              {reaction.count}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="flex flex-col items-start gap-1">
            <p className="text-sm text-muted-foreground flex gap-1">
              <p className="text-zinc-900">
                {reaction.users.slice(0, 2).join(", ")}
                {reaction.users.length > 2 &&
                  ` and ${reaction.users.length - 2} more`}
              </p>
              {" reacted with "}
              {reaction.value}
            </p>
            {reaction.members.includes(member?.id!) && (
              <p className="text-xs text-muted-foreground">(click to remove)</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default Reaction;
