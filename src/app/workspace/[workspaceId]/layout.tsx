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
function WorkspaceLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="h-full ">
      <Toolbar />
      <div className="flex h-[calc(100vh-40px)]">
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
          <ResizableHandle withHandle />
          <ResizablePanel minSize={20}>{children}</ResizablePanel>
          

        </ResizablePanelGroup>
      </div>
    </div>
  );
}

export default WorkspaceLayout;
