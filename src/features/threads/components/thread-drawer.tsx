"use client";
import {
    Drawer,
    DrawerContent
} from "@/components/ui/drawer";
import Thread from "./thread";


function ThreadDrawer({onClose,parentMessageId}:{onClose:()=>void,parentMessageId:string}) {
  
  return (
    <Drawer open={true} onOpenChange={onClose}>
      <DrawerContent className="h-[80dvh]">
        <Thread messageId={parentMessageId} onClose={onClose} />
        
      </DrawerContent>
    </Drawer>
  );
}

export default ThreadDrawer;
