"use client";
import AnimatedLogo from "@/components/animated-logo";
import useGetChannels from "@/features/channels/api/use-get-channels";
import { useCreateChannelModalAtom } from "@/features/channels/store/use-create-channel-modal";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
function page() {
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const [open, setOpen] = useCreateChannelModalAtom();

  const { isLoading: isWorkspaceLoading, workspace } = useGetWorkspace({
    id: workspaceId,
  });
  const { channels, isChannelsLoading } = useGetChannels({ workspaceId });
  const { member, isMemberLoading } = useCurrentMember({ workspaceId });
  const channelId = channels?.[0]?.id;
  const isAdmin = useMemo(() => member?.role == "ADMIN", [member?.role]);
  useEffect(() => {
    if (
      isWorkspaceLoading ||
      isChannelsLoading ||
      !workspace ||
      isMemberLoading ||
      !member
    )
      return;
    if (channelId) {
      router.push(`/workspace/${workspaceId}/channel/${channelId}`);
    } else if (!open && isAdmin) {
      setOpen(true);
    }
  }, [
    channelId,
    member,
    isMemberLoading,
    isAdmin,
    isWorkspaceLoading,
    isChannelsLoading,
    workspace,
    open,
    setOpen,
    router,
    workspaceId,
  ]);
  if (isWorkspaceLoading || isChannelsLoading || isMemberLoading || !channels) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <AnimatedLogo />
        <p className="text-sm text-muted-foreground">Loading workspace...</p>
      </div>
    );
  }
  if (!workspace || !member) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <TriangleAlert className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Workspace not found
        </span>
      </div>
    );
  }

  return (
    <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
      <TriangleAlert className="size-6 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        This workspace has no channels.
      </span>
    </div>
  );
}

export default page;
