"use client";
import { db } from "@/db";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import React from "react";
import { useGetWorkspace } from "../api/use-get-workspace";
import { AlertTriangle, Loader2 } from "lucide-react";
import WorkspaceHeader from "./workspace-header";

function WorkspaceSidebar() {
  const workspaceId = useWorkspaceId();
  const {
    error: memberFetchError,
    isError,
    isLoading: isMemberLoading,
    member,
  } = useCurrentMember({ workspaceId });
  const { error, isLoading, workspace } = useGetWorkspace({ id: workspaceId });
  console.log(member);
  if (isLoading || isMemberLoading) {
    return (
      <div className="flex flex-col bg-[#5e2c5f] h-full items-center justify-center">
        <Loader2 className=" shrink-0 !size-5 animate-spin text-white" />
      </div>
    );
  }
  if (!workspace || !member) {
    return (
      <div className="flex gap-y-2 flex-col bg-[#5e2c5f] h-full items-center justify-center">
        <AlertTriangle className="size-5  text-white" />
        <p className="text-white text-sm">Workspace not found</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col bg-[#5e2c5f] h-full">
      <WorkspaceHeader workspace={workspace} isAdmin={member.role == 'ADMIN'} />
    </div>
  );
}

export default WorkspaceSidebar;
