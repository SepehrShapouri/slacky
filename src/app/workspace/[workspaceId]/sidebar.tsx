import UserButtonWrapper from "@/features/auth/components/user-button-wrapper";
import { Bell, Home, MessagesSquare, MoreHorizontal } from "lucide-react";
import SidebarButton from "./SidebarButton";
import WorkspaceSwitcher from "./workspace-switcher";

function Sidebar() {
  return (
    <aside className="w-[70px] h-full bg-[#481349] flex flex-col gap-y-4 items-center pt-[9px] pb-4">
      <WorkspaceSwitcher />
      <SidebarButton icon={Home} label="Home" isActive />
      <SidebarButton icon={MessagesSquare} label="DMs" />
      <SidebarButton icon={Bell} label="Home" />
      <SidebarButton icon={MoreHorizontal} label="More" />
      <div className="flex flex-col items-center justify-center gap-y-1 mt-auto">
        <UserButtonWrapper />
      </div>
    </aside>
  );
}

export default Sidebar;
