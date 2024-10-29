import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import useDeleteChannel from "../api/use-delete-channel";
import { useUpdateChannel } from "../api/use-update-channel";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useChannelId } from "@/hooks/use-channel-id";
import { useRouter } from "next/navigation";
import { useCurrentMember } from "@/features/members/api/use-current-member";
type HeaderProps = {
  title: string;
};

function Header({ title }: HeaderProps) {
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const router = useRouter();
  const [value, setValue] = useState<string>(title);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const { deleteChannel, isDeletingChannel } = useDeleteChannel();
  const { updateChannel, isUpdatingChannel } = useUpdateChannel();
  const {member}= useCurrentMember({workspaceId})
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "This action is irreversible"
  );
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\s+/g, "-").toLocaleLowerCase();
    setValue(value);
  }
  function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    updateChannel(
      { name: value, workspaceId, channelId },
      {
        onSuccess: () => {
          setEditOpen(false);
          toast.success("channel updated.");
        },
        onError: () =>
          toast.error("Failed to update channel, something went wrong"),
      }
    );
  }

  async function handleRemove() {
    const ok = await confirm();
    if (!ok) return;
    deleteChannel(
      { workspaceId, channelId },
      {
        onSuccess: async (channel) => {
          await router.replace(`/workspace/${workspaceId}`);
          toast.success("Deleted channel", {
            description: `channel ${channel?.name} has been deleted`,
          });
        },
        onError: (err) => {
          toast.error("Failed to remove channel, something went wrong"),
            console.error(err.message);
        },
      }
    );
  }

  function handleEditOpen(value:boolean){
    if(member?.role != 'ADMIN') return
    setEditOpen(value)
  }
  return (
    <>
      <ConfirmDialog />
      <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="text-lg font-semibold px-2 overflow-hidden w-auto"
              size="sm"
            >
              <span className="truncate"># {title}</span>
              <FaChevronDown className="size-2.5 ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 bg-gray-50 overflow-hidden">
            <DialogHeader className="p-4 border-b bg-white">
              <DialogTitle># {title}</DialogTitle>
            </DialogHeader>
            <div className="px-4 pb-4 flex flex-col gap-y-2">
              <Dialog open={editOpen} onOpenChange={handleEditOpen}>
                <DialogTrigger asChild>
                  <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Channel name</p>
                      {member?.role == 'ADMIN' &&                       <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                        Edit
                      </p>}
                    </div>
                    <p className="text-sm"># {title}</p>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rename this channel</DialogTitle>
                  </DialogHeader>
                  <form className="space-y-4" onSubmit={handleEdit}>
                    <Input
                      value={value}
                      disabled={isUpdatingChannel}
                      onChange={handleChange}
                      required
                      autoFocus
                      minLength={3}
                      maxLength={80}
                      placeholder="e.g. plan-budget"
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          variant="secondary"
                          disabled={isUpdatingChannel}
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button disabled={isUpdatingChannel}>Save</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              {member?.role == 'ADMIN' &&               <button
              disabled={isDeletingChannel}
                className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg cursor-pointer border hover:bg-gray-50 text-rose-600"
                onClick={handleRemove}
              >
                {isDeletingChannel ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <p className="text-sm font-semibold">Deleting channel...</p>
                  </>
                ) : (
                  <>
                    <Trash className="size-4" />
                    <p className="text-sm font-semibold">Delete channel</p>
                  </>
                )}
              </button>}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

export default Header;
