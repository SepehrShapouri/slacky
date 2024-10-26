import React from "react";
import Toolbar from "../../../features/workspaces/components/toolbar";
import Sidebar from "../../../features/workspaces/components/sidebar";
function WorkspaceLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="h-full ">
      <Toolbar />
      <div className="flex h-[calc(100vh-40px)]">
        <Sidebar />

        {children}
      </div>
    </div>
  );
}

export default WorkspaceLayout;
