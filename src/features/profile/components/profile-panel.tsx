"use client";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { usePanel } from "@/hooks/use-panel";
import { Loader2 } from "lucide-react";
import React from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import ProfileDrawer from "./profile-drawer";
import Profile from "./profile";


function ProfilePanel() {
  const { profileMemberId, onClose } = usePanel();
  const showPanel = !!profileMemberId;
  const isMobile = useIsMobile()
  return (
    <>
      {showPanel && !isMobile ? (
        <>
          <ResizableHandle />
          <ResizablePanel minSize={20} defaultSize={29} className="shadow-md shadow-[#5e2c5f]/50">
            {profileMemberId ? (
              <Profile profileMemberId={profileMemberId} onClose={onClose} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </ResizablePanel>
        </>
      ) : null}
      {showPanel && isMobile ? <ProfileDrawer profileMemberId={profileMemberId} onClose={onClose}/> : null}
    </>
  );
}

export default ProfilePanel;
