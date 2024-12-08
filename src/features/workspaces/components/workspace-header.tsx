import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Workspaces } from "@prisma/client";
import { ChevronDown, Settings, SquarePen, UserRoundPlus } from "lucide-react";
import Hint from "@/components/hint";
import PreferencesModal from "./preferences-modal";
import InviteModal from "./invite-modal";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type WorkspaceHeaderProps = {
  workspace: Workspaces;
  isAdmin: boolean;
};
function WorkspaceHeader({ workspace, isAdmin }: WorkspaceHeaderProps) {
  const [preferencesOpen, setPreferncesOpen] = useState<boolean>(false);
  const [inviteOpen, setInviteOpen] = useState<boolean>(false);
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  return (
    <>
      <InviteModal
        workspaceId={workspace.id}
        open={inviteOpen}
        setOpen={setInviteOpen}
        workspaceName={workspace.name}
        joinCode={workspace.joinCode}
      />
      <PreferencesModal
        open={preferencesOpen}
        setOpen={setPreferncesOpen}
        initialValue={workspace.name}
      />
      <div
        className={cn(
          "flex items-center justify-between md:px-4 md:h-[49px] gap-0.5 ",
          isMobile && openMobile && "h-[49px] px-4"
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="transparent"
              className={cn(
                "font-semibold text-lg  md:w-auto p-0 md:p-1.5 overflow-hidden",
                isMobile && openMobile && "p-1.5 w-auto"
              )}
              size="sm"
            >
              <span
                className={cn(
                  "capitalize truncate hidden md:inline",
                  isMobile && openMobile && "inline"
                )}
              >
                {workspace.name}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 ml-1 shrink-0 hidden md:inline",
                  isMobile && openMobile && "inline"
                )}
              />
              <div
                className={cn(
                  "md:hidden size-8 md:size-9 relative overflow-hidden bg-[#616061] text-white font-semibold text-xl rounded-md md:rounded-lg flex items-center justify-center",
                  isMobile && openMobile && "hidden"
                )}
              >
                {workspace.name.charAt(0).toUpperCase()}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" className="w-64">
            <DropdownMenuItem className="cursor-pointer capitalize">
              <div className="size-9 relative overflow-hidden bg-[#616061] text-white font-semibold text-xl rounded-lg flex items-center justify-center">
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col items-start">
                <p className="font-bold">{workspace.name}</p>
                <p className="text-xs text-muted-foreground font-medium">
                  Active workspace
                </p>
              </div>
            </DropdownMenuItem>
            {isAdmin && (
              <>
                {" "}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer py-2 font-medium"
                  onClick={() => setInviteOpen(true)}
                >
                  <UserRoundPlus className="text-[#5e2c5f]" /> Invite people to{" "}
                  {workspace.name}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer py-2 font-medium"
                  onClick={() => setPreferncesOpen(true)}
                >
                  <Settings className="text-[#5e2c5f]" /> Prefernces
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* <div
          className={cn(
            "md:flex items-center gap-0.5 hidden",
            isMobile && openMobile && "flex"
          )}
        >
          <Hint label="New message" side="bottom">
            <Button variant="transparent" size="iconSm">
              <SquarePen className="size-4" />
            </Button>
          </Hint>
        </div> */}
      </div>
    </>
  );
}

export default WorkspaceHeader;
