"use client";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import React from "react";
type WorkspacePageProps = {
  params: {
    workspaceId: string;
  };
};
function page() {
  const workspaceId = useWorkspaceId();
  const { isLoading, workspace } = useGetWorkspace({ id: workspaceId });
  return <div>{workspaceId}</div>;
}

export default page;
