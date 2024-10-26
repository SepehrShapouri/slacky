"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useCreateWorkspaceModalAtom } from "@/features/workspaces/store/use-create-workspace-modal";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

function WorkspaceSwitcher() {
  const router = useRouter();
  const [_open, setOpen] = useCreateWorkspaceModalAtom();
console.log(_open)
  const workspaceId = useWorkspaceId();
  const { workspaces, isLoading: isWorkspacesLoading } = useGetWorkspaces();
  const { workspace, isLoading: isWorkspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });

  const filteredWorkspaces = workspaces?.filter(
    (workspace) => workspace.id != workspaceId
  );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="size-9 relative overflow-hidden rounded-lg bg-[#ababab] hover:bg-[#ababab]/80 text-slate-800 font-semibold text-xl">
          {isWorkspaceLoading ? (
            <Loader2 className="size-5 animate-spin shrink-0" />
          ) : (
            workspace?.name.charAt(0).toUpperCase()
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-64 p-0">
        <Command>
          <CommandGroup heading="Active workspace">
            <CommandItem
              className="font-medium gap-0 cursor-pointer capitalize"
              onSelect={() => router.push(`/workspace/${workspace?.id}`)}
            >
              <div className="shrink-0 size-9 relative  bg-[#ae41ae] text-white font-semibold text-lg rounded-lg flex items-center justify-center mr-2">
                {workspace?.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="truncate">{workspace?.name}</p>
                <p className="text-xs text-muted-foreground font-normal">
                  5 channels
                </p>
              </div>
            </CommandItem>
          </CommandGroup>
          {!!filteredWorkspaces?.length && (
            <CommandInput placeholder="Search workspaces" />
          )}
          <CommandList>
            <CommandEmpty>No workspaces found.</CommandEmpty>
            {!!filteredWorkspaces?.length && (
              <CommandGroup heading="Workspaces">
                <ScrollArea className="max-h-[150px] overflow-scroll">
                  {filteredWorkspaces?.map((workspace) => (
                    <CommandItem
                      className="cursor-pointer"
                      onSelect={() => router.push(`/workspace/${workspace.id}`)}
                    >
                      <div className="shrink-0 size-9 relative  bg-[#616061] text-white font-semibold text-lg rounded-lg flex items-center justify-center mr-2">
                        {workspace.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <p className="truncate">{workspace?.name}</p>
                        <p className="text-xs text-muted-foreground font-normal">
                          5 channels
                        </p>
                      </div>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            )}
            <CommandGroup heading="Create new workspace">
              <CommandItem
                className="cursor-pointer"
                onSelect={() => setOpen(true)}
              >
                <div className="size-9 relative overflow-hidden bg-[#f2f2f2] text-slate-800 font-semibold text-lg rounded-lg flex items-center justify-center mr-2">
                  <Plus />
                </div>
                <p className="font-medium">Create a new workspace</p>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default WorkspaceSwitcher;
