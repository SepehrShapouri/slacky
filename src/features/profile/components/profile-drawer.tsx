"use client";
import {
    Drawer,
    DrawerContent
} from "@/components/ui/drawer";
import Profile from "./profile";



function ProfileDrawer({onClose,profileMemberId}:{onClose:()=>void,profileMemberId:string}) {
  
  return (
    <Drawer open={true} onOpenChange={onClose}>
      <DrawerContent className="h-[80dvh]">
        <Profile profileMemberId={profileMemberId} onClose={onClose}/>
        
      </DrawerContent>
    </Drawer>
  );
}

export default ProfileDrawer;
