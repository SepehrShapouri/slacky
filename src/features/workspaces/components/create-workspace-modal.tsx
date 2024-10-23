"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreateWorkspace } from "../api/use-create-workspace";
import { useCreateWorkspaceModalAtom } from "../store/use-create-workspace-modal";
import ErrorAlert from "@/features/auth/components/error-alert";
import { toast } from "sonner";

export const CreateWorkspaceModal = () => {
  const { push } = useRouter();
  const [open, setOpen] = useCreateWorkspaceModalAtom();
  const [workspaceName, setWorkspaceName] = useState<string>("");

  const { createWorkspace, isPending, isError, error } = useCreateWorkspace();
  const handleClose = () => {
    setOpen(false);
    setWorkspaceName("");
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createWorkspace(
      { name: workspaceName },
      {
        onSuccess: (data) => {
          toast.success("Workspace created");
          push(`/workspace/${data.id}`);
          handleClose();
        },
      }
    );
  };
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a workspace</DialogTitle>
        </DialogHeader>
        {isError && error && <ErrorAlert error={"test"} />}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            disabled={isPending}
            required
            autoFocus
            minLength={3}
            placeholder="Workspace name e.g. 'Work', 'Personal'
            ,'Home'"
          />
          <div className="flex justify-end">
            <Button disabled={isPending}>Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
