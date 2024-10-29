import React, { useState } from "react";
import { useCreateChannelModalAtom } from "../store/use-create-channel-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateChannel } from "../api/use-create-channel";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { HTTPError } from "ky";
function CreateChannelModal() {
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const [open, setOpen] = useCreateChannelModalAtom();
  const [name, setName] = useState<string>("");
  const { createChannel, isCreatingChannel } = useCreateChannel();
  function handleClose() {
    setName("");
    setOpen(false);
  }
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\s+/g, "-").toLocaleLowerCase();
    setName(value);
  }
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createChannel(
      { name, workspaceId },
      {
        onSuccess: (channel) => {
          router.push(`/workspace/${workspaceId}/channel/${channel.id}`);
          handleClose();
          toast.success("Created new channel");
        },
        onError: async (err) => {
          if(err instanceof HTTPError){
              const errorData = await err.response.json().catch(()=>({}))
              toast.error(errorData.error)
          }
      }
      }
    );
  }
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a channel</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            value={name}
            disabled={isCreatingChannel}
            onChange={handleChange}
            required
            autoFocus
            minLength={3}
            maxLength={80}
            placeholder="# e.g. plan-budget"
          />
          <div className="flex justify-end">
            <Button disabled={isCreatingChannel}>Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateChannelModal;
