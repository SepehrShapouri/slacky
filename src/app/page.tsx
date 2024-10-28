"use client";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useCreateWorkspaceModalAtom } from "@/features/workspaces/store/use-create-workspace-modal";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function Home() {
  const [open, setOpen] = useCreateWorkspaceModalAtom();
  const { isLoading, workspaces } = useGetWorkspaces();
  
  const router = useRouter();
  const firstWorkspaceId = useMemo(() => workspaces?.[0]?.id, [workspaces]);
  
  useEffect(() => {
    if (isLoading) return;
    if (firstWorkspaceId) {
      router.replace(`/workspace/${firstWorkspaceId}`);
    } else if (!open) {
      setOpen(true);
    }
  }, [workspaces, open, setOpen, isLoading, router]);
  return <></>;
}
