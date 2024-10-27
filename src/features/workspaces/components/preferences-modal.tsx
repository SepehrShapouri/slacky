import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash, TrashIcon } from "lucide-react";
import { useUpdateWorkspace } from "../api/use-update-workspace";
import useDeleteWorkspace from "../api/use-delete-workspace";
import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { useGetWorkspaces } from "../api/use-get-workspaces";
type PreferencesModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialValue: string;
};
function PreferencesModal({
  initialValue,
  open,
  setOpen,
}: PreferencesModalProps) {
  const [value, setValue] = useState<string>(initialValue);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const router = useRouter();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "This action is ireversable"
  );
  const workspaceId = useWorkspaceId();
  const {
    isPending: isUpdatingWorkspace,
    updateWorkspace,
  } = useUpdateWorkspace();
  const { deleteWorkspace, deleteWorkspaceError, isDeletingWorkspace } =
    useDeleteWorkspace();

  function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    updateWorkspace(
      { name: value, workspaceId },
      {
        onSuccess: () => {
          setEditOpen(false);
          toast.success("Workspace updated.");
        },
        onError: () =>
          toast.error("Failed to update workspace, something went wrong"),
      }
    );
  }

  async function handleRemove() {
    const ok = await confirm();
    if (!ok) return;
    deleteWorkspace(
      { workspaceId },
      {
        onSuccess: (workspace) => {
          toast.success("Deleted workspace", {
            description: `Workspace ${workspace?.name} and its corresponding members have been deleted.`,
          });
          router.push("/");
        },
        onError: (err) => {
          toast.error("Failed to remove workspace, something went wrong", {
            description: err.message,
          }),
            console.error(err.message);
        },
      }
    );
  }
  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 bg-gray-50 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle>
              <DialogTitle>{value}</DialogTitle>
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4 flex flex-col gap-y-2">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 transition-all">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Workspace name</p>
                    <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                      Edit
                    </p>
                  </div>
                  <p className="text-sm">{value}</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename this workspace</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleEdit}>
                  <Input
                    value={value}
                    disabled={isUpdatingWorkspace}
                    onChange={(e) => setValue(e.target.value)}
                    required
                    autoFocus
                    minLength={3}
                    maxLength={80}
                    placeholder="Workspace name e.g. 'Work', 'Personal', 'Home'"
                  />
                  <DialogFooter className="flex flex-col gap-2 md:flex-row">
                    <DialogClose asChild>
                      <Button
                        variant="secondary"
                        disabled={isUpdatingWorkspace}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button disabled={isUpdatingWorkspace}>Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <button
              disabled={isDeletingWorkspace}
              onClick={() => handleRemove()}
              className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg border cursor-pointer transition-all hover:bg-gray-50 text-rose-600"
            >
              {isDeletingWorkspace ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <p className="text-sm font-semibold">Deleting workspace...</p>
                </>
              ) : (
                <>
                  <TrashIcon className="size-4" />
                  <p className="text-sm font-semibold">Delete workspace</p>
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PreferencesModal;
