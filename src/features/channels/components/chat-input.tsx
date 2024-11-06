import hljs from "highlight.js";
import dynamic from "next/dynamic";
import Quill from "quill";
const Editor = dynamic(
  () => {
    hljs.configure({ languages: ["javascript", "css", "html"] });
    //@ts-ignore
    window.hljs = hljs;
    return import("@/components/editor");
  },
  {
    ssr: false,
    loading: () => <p>lodaing..</p>,
  }
);
type EditorValue = {
  attachments?: string[];
  body: string;
};
import React, { useRef } from "react";
type ChatInputProps = {
  placeholder: string;
  editorKey: number;
  onSubmit: ({ attachments, body }: EditorValue) => void;
};
function ChatInput({ placeholder, onSubmit, editorKey }: ChatInputProps) {
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
