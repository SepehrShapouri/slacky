"use client";
import Hint from "@/components/hint";
import DotsLoader from "@/components/loaders/dots";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import { InfoIcon, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import WorkspaceHeader from "./workspace-header";
import { SearchBarCommand } from "@/features/search/components/search-bar-command";

function Toolbar() {
  const workspaceId = useWorkspaceId();
  const { workspace, isLoading } = useGetWorkspace({ id: workspaceId });
  const { member } = useCurrentMember({ workspaceId });
  const [toolbarOpen, setToolbarOpen] = useState<boolean>(false);
  const [mobileToolbarOpen,setMobileToolbarOpen] = useState<boolean>(false)
  return (
    <>
      <nav className="bg-[#481349]  items-center justify-between h-10  p-1.5 hidden md:flex">
        <div className="flex-1" />
        <div className="min-w-[280px] max-w-[642px] grow-[2] shrink relative">
        <SearchBarCommand open={toolbarOpen} onClose={() => setToolbarOpen(false)} />
            <Hint label={`Search ${workspace?.name}`}>
              <Button
                onClick={() => setToolbarOpen(true)}
                size="sm"
                className="bg-accent/25 hover:bg-accent/25 w-full justify-start h-7 px-2"
              >
                <Search className="size-4 text-white mr-2" />
                <span className="text-white text-xs ">
                  Search{" "}
                  {isLoading ? (
                    <DotsLoader size={4} className="ml-1" />
                  ) : (
                    workspace?.name
                  )}
                </span>
              </Button>
            </Hint>
        </div>
        <div className="ml-auto flex-1 flex items-center justify-end">
          <Button variant="transparent" size="iconSm">
            <Link href="https://github.com/SepehrShapouri">
            <InfoIcon className="size-5 text-white" />
            </Link>
          </Button>
        </div>
      </nav>
      {/* mobile */}
      <nav
        className={cn(
          "bg-[#481349] px-3 items-center transition justify-between min-h-[60px] w-full flex md:hidden"
        )}
      >
        <div className="flex items-center justify-between w-full gap-5">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="h-[30px] bg-accent/25"
            />
            {isLoading || !workspace ? (
              <Skeleton className="size-8 rounded-md" />
            ) : (
              <WorkspaceHeader
                isAdmin={member?.role == "ADMIN"}
                workspace={workspace}
              />
            )}
          </div>
          <div className="flex-1">
          <SearchBarCommand open={mobileToolbarOpen} onClose={() => setMobileToolbarOpen(false)} />
            <Button
            onClick={()=>setMobileToolbarOpen(true)}
              size="sm"
              className="bg-accent/25 hover:bg-accent/25 w-full justify-start h-8 px-2"
            >
              <Search className="size-4 text-white mr-2" />
              <span className="text-white text-xs ">
                Search{" "}
                {isLoading ? (
                  <DotsLoader size={4} className="ml-1" />
                ) : (
                  workspace?.name
                )}
              </span>
            </Button>
          </div>
          <Link href={`/workspace/${workspaceId}/member/${member?.id}`}>
            <div className="relative">
              <Avatar className="size-8 rounded-md mr-1">
                <AvatarImage
                  className="rounded-md"
                  src={member?.user?.avatarUrl || undefined}
                />
                <AvatarFallback className="rounded-md text-xs bg-sky-500 text-white font-semibold">
                  {member?.user?.fullname[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <span className="flex items-center justify-center size-2 rounded-full bg-[#481349] absolute bottom-0 right-0">
                <span className="size-1.5 bg-[#007a5a]  rounded-full shrink-0 " />
              </span>
            </div>
          </Link>
        </div>
      </nav>
    </>
  );
}

export default Toolbar;

