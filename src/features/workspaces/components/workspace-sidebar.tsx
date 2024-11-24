"use client";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import React, { useEffect, useState } from "react";
import { useGetWorkspace } from "../api/use-get-workspace";
import WorkspaceHeader from "./workspace-header";
import SidebarItem from "./sidebar-item";
import useGetChannels from "@/features/channels/api/use-get-channels";
import WorkspaceSection from "./workspace-section";
import useGetMembers from "@/features/members/api/use-get-members";
import UserItem from "./user-item";
import { useCreateChannelModalAtom } from "@/features/channels/store/use-create-channel-modal";
import {
  AlertTriangle,
  HashIcon,
  Loader2,
  MessageSquareText,
  SendHorizonal,
} from "lucide-react";
import { useChannelId } from "@/hooks/use-channel-id";
import { useSocket } from "@/hooks/use-socket";
import { useCreateOnlineUsersAtom } from "../store/use-create-online-users-atom";

interface OnlineUser {
  memberId: number;
  userId: number;
}

function WorkspaceSidebar() {
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  const { isLoading, workspace } = useGetWorkspace({ id: workspaceId });
  const { channels } = useGetChannels({ workspaceId });
  const { members } = useGetMembers({ workspaceId });
  const { isMemberLoading, member } = useCurrentMember({ workspaceId });
  const [onlineUsers, setOnlineUsers] = useCreateOnlineUsersAtom();
  const [_open, setOpen] = useCreateChannelModalAtom();
  const socket = useSocket("workspaces");

  useEffect(() => {
    if (socket && workspaceId && member) {
      const joinWorkspace = () => {
        socket.emit("join-workspace", workspaceId, member.id, member.userId);
      };

      joinWorkspace();

      socket.on("connect", joinWorkspace);

      socket.on("users-online", (users: OnlineUser[]) => {
        setOnlineUsers(users);
      });

      socket.on("error", (error: string) => {
        console.error("Socket error:", error);
        // You might want to show this error to the user
      });

      const handleBeforeUnload = () => {
        socket.emit("leave-workspace", workspaceId, member.id, member.userId);
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        socket.emit("leave-workspace", workspaceId, member.id, member.userId);
        socket.off("connect", joinWorkspace);
        socket.off("users-online");
        socket.off("error");
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [socket, workspaceId, member]);

  if (isLoading || isMemberLoading) {
    return (
      <div className="flex flex-col bg-[#5e2c5f] h-full items-center justify-center w-full">
        <Loader2 className=" shrink-0 !size-5 animate-spin text-white w-full" />
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
    <div className="flex flex-col bg-[#5e2c5f] h-full w-full ">
      <WorkspaceHeader workspace={workspace} isAdmin={member.role == "ADMIN"} />
      <div className="flex flex-col px-2 mt-3">
        <SidebarItem label="Threads" icon={MessageSquareText} id="threads" />
        <SidebarItem label="Drafts & sent" icon={SendHorizonal} id="drafts" />
      </div>
      <WorkspaceSection
        label="Channels"
        hint="New channel"
        onNew={member.role == "ADMIN" ? () => setOpen(true) : undefined}
      >
        {channels?.map((item) => (
          <SidebarItem
            key={item.id}
            icon={HashIcon}
            label={item.name}
            id={item.id}
            variant={channelId === item.id ? "active" : "default"}
          />
        ))}
      </WorkspaceSection>
      <WorkspaceSection
        label="Direct messages"
        hint="New direct message"
        onNew={() => {}}
      >
        {members?.map((item) => (
          <UserItem
            isOnline={onlineUsers.some((user) => user.memberId === item.id)}
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
