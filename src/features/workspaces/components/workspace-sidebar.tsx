"use client";
import { db } from "@/db";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import React from "react";
import { useGetWorkspace } from "../api/use-get-workspace";
import {
  AlertTriangle,
  HashIcon,
  Loader2,
  MessageSquareText,
  SendHorizonal,
} from "lucide-react";
import WorkspaceHeader from "./workspace-header";
import SidebarItem from "./sidebar-item";
import useGetChannels from "@/features/channels/api/use-get-channels";
import WorkspaceSection from "./workspace-section";
import useGetMembers from "@/features/members/api/use-get-members";
import UserItem from "./user-item";

function WorkspaceSidebar() {
  const workspaceId = useWorkspaceId();
  const { error, isLoading, workspace } = useGetWorkspace({ id: workspaceId });
  const { channels, isChannelsLoading } = useGetChannels({ workspaceId });
  const { isMembersLoading, members } = useGetMembers({ workspaceId });
  const { isMemberLoading, member } = useCurrentMember({ workspaceId });
  console.log(members);
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
      <WorkspaceHeader workspace={workspace} isAdmin={member.role == "ADMIN"} />
      <div className="flex flex-col px-2 mt-3">
        <SidebarItem label="Threads" icon={MessageSquareText} id="threads" />
        <SidebarItem label="Drafts & sent" icon={SendHorizonal} id="drafts" />
      </div>
      <WorkspaceSection label="Channels" hint="New channel" onNew={() => {}}>
        {channels?.map((item) => (
          <SidebarItem
            key={item.id}
            icon={HashIcon}
            label={item.name}
            id={item.id}
          />
        ))}
      </WorkspaceSection>
      <WorkspaceSection label="Direct messages" hint="New direct message" onNew={()=>{}}>
        {members?.map((item) => (
          <UserItem
            key={item.id}
            id={item.id}
            label={item.user.fullname}
            image={item.user.avatarUrl || undefined}
          />
        ))}
      </WorkspaceSection>
    </div>
  );
}

export default WorkspaceSidebar;
