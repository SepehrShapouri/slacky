import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";
import { IconType } from "react-icons/lib";
type SidebarButtonProps = {
  icon: LucideIcon | IconType;
  label: string;
  isActive?: boolean;
};
function SidebarButton({ icon:Icon, label, isActive }: SidebarButtonProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-y-0.5 cursor-pointer group">
      <Button
        variant="transparent"
        className={cn("size-9 p-2 group-hover:bg-accent/20 rounded-lg",isActive && "bg-accent/20")}
      ><Icon className="size-5 text-white group-hover:scale-110 transition-all"/></Button>
      <span className="text-[11px] text-white group-hover:text-accent font-semibold">{label}</span>
    </div>
  );
}

export default SidebarButton;
