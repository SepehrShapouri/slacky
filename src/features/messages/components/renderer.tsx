import Quill from "quill";
import { useEffect, useRef, useState } from "react";
import 'highlight.js/styles/monokai-sublime.css';
import hljs from 'highlight.js';

type RendererProps = {
  value: string;
};

const Renderer = ({ value }: RendererProps) => {
  const [isEmpty, setIsEmpty] = useState<boolean>(false);
  const rendererRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rendererRef.current) return;

    const container = rendererRef.current;

    const quill = new Quill(document.createElement("div"), {
      theme: "snow",
    });
    quill.enable(false);

    const contents = JSON.parse(value);
    quill.setContents(contents);

    const isEmpty =
      quill
        .getText()
        .replace(/<(.|\n)*?>/g, "")
        .trim().length === 0;
    setIsEmpty(isEmpty);

    // Set the Quill content into the container
    container.innerHTML = quill.root.innerHTML;

    // Apply syntax highlighting to code blocks
    container.querySelectorAll(".ql-code-block").forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [value]);

  if (isEmpty) return null;

  return <div ref={rendererRef} className="ql-editor ql-renderer prose" />;
};

export default Renderer;
