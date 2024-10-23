import React from "react";
import Toolbar from "./toolbar";

function WorkspaceLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="h-full ">
      <Toolbar />
      {children}
    </div>
  );
}

export default WorkspaceLayout;
