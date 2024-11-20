import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useChannelId } from "@/hooks/use-channel-id";
import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useRouter } from "next/navigation";
type HeaderProps = {
  avatarUrl?: string;
  fallback: string;
  name: string;
  topic?: string;
};

function Header({ avatarUrl, fallback, name, topic }: HeaderProps) {
  return (
    <>
      <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="text-lg font-semibold px-0 overflow-hidden w-auto hover:bg-transparent"
              size="sm"
            >
              <Avatar className="size-6 rounded-md">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-sky-600 rounded-md text-sm text-white font-bold size-6">
                  {fallback}
                </AvatarFallback>
              </Avatar>
              <p className="font-bold text-lg ml-0.5">{name}</p>
              {!!topic && (
                <p className="text-xs text-muted-foreground">{topic}</p>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 bg-gray-50 overflow-hidden"></DialogContent>
        </Dialog>
      </div>
    </>
  );
}

export default Header;
