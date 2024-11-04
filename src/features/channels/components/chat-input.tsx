import dynamic from "next/dynamic";
import Quill from "quill";
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });
type EditorValue = {
  attachments?: string[];
  body: string;
};
import React, { useRef } from "react";
type ChatInputProps = {
  placeholder: string;
  editorKey:number;
  onSubmit: ({ attachments, body }: EditorValue) => void;
};
function ChatInput({ placeholder,onSubmit ,editorKey}: ChatInputProps) {
  const editorRef = useRef<Quill | null>(null);
  return (
    <div className="px-5 w-full">
      <Editor
      key={editorKey}
        placeholder={placeholder}
        onSubmit={onSubmit}
        disabled={false}
        innerRef={editorRef}
      />
    </div>
  );
}

export default ChatInput;
