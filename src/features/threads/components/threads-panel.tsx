"use client";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { usePanel } from "@/hooks/use-panel";
import { Loader2 } from "lucide-react";
import React from "react";
import Thread from "./thread";

function ThreadsPanel() {
  const { parentMessageId, onClose } = usePanel();
  const showPanel = !!parentMessageId;
  return (
    <>
      {showPanel ? (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={20} defaultSize={29} className="shadow-md shadow-[#5e2c5f]/50">
            {parentMessageId ? (
              <Thread messageId={parentMessageId} onClose={onClose} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </ResizablePanel>
        </>
      ) : null}
    </>
  );
}

export default ThreadsPanel;
