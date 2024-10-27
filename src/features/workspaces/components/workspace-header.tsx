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

type WorkspaceHeaderProps = {
  workspace: Workspaces;
  isAdmin: boolean;
};
function WorkspaceHeader({ workspace, isAdmin }: WorkspaceHeaderProps) {
  const [preferencesOpen, setPreferncesOpen] = useState<boolean>(false);
  return (
    <>
      <PreferencesModal
        open={preferencesOpen}
        setOpen={() => setPreferncesOpen(false)}
        initialValue={workspace.name}
      />
      <div className="flex items-center justify-between px-4 h-[49px] gap-0.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="transparent"
              className="font-semibold text-lg w-auto p-1.5 overflow-hidden"
              size="sm"
            >
              <span className="capitalize truncate">{workspace.name}</span>
              <ChevronDown className="size-4 ml-1 shrink-0" />
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
                  onClick={() => {}}
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
        <div className="flex items-center gap-0.5">
          <Hint label="New message" side="bottom">
            <Button variant="transparent" size="iconSm">
              <SquarePen className="size-4" />
            </Button>
          </Hint>
        </div>
      </div>
    </>
  );
}

export default WorkspaceHeader;
