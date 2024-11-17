import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import WorkspaceSidebar from "@/features/workspaces/components/workspace-sidebar";
import React from "react";
import Sidebar from "../../../features/workspaces/components/sidebar";
import Toolbar from "../../../features/workspaces/components/toolbar";
import ThreadsPanel from "@/features/threads/components/threads-panel";
import { AppSidebar } from "@/components/app-sidebar";
function WorkspaceLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="h-full w-full">
      <Toolbar />
      <div className=" h-[calc(100vh-40px)] hidden md:flex">
        <Sidebar />
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId="channles-sidebar-size"
        >
          <ResizablePanel
            defaultSize={20}
            minSize={11}
            className="bg-[#5e2c5f]"
          >
            <WorkspaceSidebar />
          </ResizablePanel>
          <ResizableHandle  />
          <ResizablePanel minSize={20}>{children}</ResizablePanel>
          <ThreadsPanel/>
        </ResizablePanelGroup>
      </div>
      <div className=" h-[calc(100vh-60px)] md:hidden">
        <AppSidebar/>
        {children}
      </div>
    </div>
  );
}

export default WorkspaceLayout;