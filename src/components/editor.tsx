import useMediaUpload from "@/hooks/use-media-upload";
import { cn } from "@/lib/utils";
import hljs from "highlight.js";
import { ImageIcon, Smile, XIcon } from "lucide-react";
import Image from "next/image";
import Quill, { QuillOptions } from "quill";
import { Delta, Op } from "quill/core";
import "quill/dist/quill.snow.css";
import "highlight.js/styles/monokai-sublime.css";

import {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { MdSend } from "react-icons/md";
import { PiTextAa } from "react-icons/pi";
import { EmojiPopover } from "./emoji-popover";
import Hint from "./hint";
import { Button } from "./ui/button";

type EditorValue = {
  attachments?: string[];
  body: string;
};
type EditorProps = {
  variant?: "create" | "update";
  onSubmit: ({ attachments, body }: EditorValue) => void;
  onCancel?: () => void;
  placeholder?: string;
  defaultValue?: Delta | Op[];
  disabled?: boolean;
  innerRef?: MutableRefObject<Quill | null>;
};
const Editor = ({
  variant = "create",
  onSubmit,
  defaultValue = [],
  disabled = false,
  innerRef,
  onCancel,
  placeholder = "Write something",
}: EditorProps) => {
  const [text, setText] = useState<string>("");

  const [isToolbarVisible, setIsToolbarVisible] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef(onSubmit);
  const placeHolderRef = useRef(placeholder);
  const quillRef = useRef<Quill | null>(null);
  const defaultValueRef = useRef(defaultValue);
  const disabledRef = useRef(disabled);
  const imageElementRef = useRef<HTMLInputElement>(null);
  const {
    attachments,
    isUploading,
    startUpload,

    removeAttachment,
  } = useMediaUpload();
  useLayoutEffect(() => {
    submitRef.current = onSubmit;
    placeHolderRef.current = placeholder;
    defaultValueRef.current = defaultValue;
    disabledRef.current = disabled;
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const editorContainer = container.appendChild(
      container.ownerDocument.createElement("div")
    );
    const options: QuillOptions = {
      theme: "snow",
      placeholder: placeHolderRef.current,
      modules: {
        toolbar: [
          ["bold", "italic", "strike"],
          [{ direction: "rtl" }],

          [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
          ["code-block", "blockquote"],
          [{ header: "1"},{header:'2'},{header:3}],
          [
            {
              color: [
                "white",
                "black",
                "#b91c1c",
                "#c2410c",
                "#a16207",
                "#4d7c0f",
                "#15803d",
                "#047857",
                "#0e7490",
                "#0369a1",
                '#1d4ed8',
                '#4338ca',
                '#6d28d9',
                '#a21caf',
                '#be185d',
                '#be123c'
              ],
            },
            {
              background: [
                "#fb7185",
                "#f472b6",
                "#e879f9",
                "#c084fc",
                "#a78bfa",
                "#818cf8",
                "#60a5fa",
                "#38bdf8",
                "#22d3ee",
                "#34d399",
                "#facc15",
                "#fb923c",
                '#fecaca',
                '#e5e5e5',
                '#64748b',
                "black",
              ],
            },
          ],
        ],
        syntax: {
          highlight: (text: any) => hljs.highlightAuto(text).value,
        },
        keyboard: {
          bindings: {
            enter: {
              key: "Enter",
              handler: () => {
                const text = quill.getText();
                const addedImage = imageElementRef.current?.files?.[0] || null;
                const isEmpty =
                  !addedImage &&
                  text.replace(/<(.|\n)*?>/g, "").trim().length === 0;
                if (isEmpty) return;
                const body = JSON.stringify(quill.getContents());
                submitRef.current?.({ body });
              },
            },
            shift_enter: {
              key: "Enter",
              shiftKey: true,
              handler: () => {
                quill.insertText(quill.getSelection()?.index || 0, "\n");
              },
            },
          },
        },
      },
    };
    const quill = new Quill(editorContainer, options);
    quillRef.current = quill;
    quillRef.current.focus();
    if (innerRef) {
      innerRef.current = quill;
    }
    quill.setContents(defaultValueRef.current);
    setText(quill.getText());

    quill.on(Quill.events.TEXT_CHANGE, () => {
      setText(quill.getText());
    });

    return () => {
      quill.off(Quill.events.TEXT_CHANGE);
      if (container) {
        container.innerHTML = "";
      }
      if (quillRef.current) {
        quillRef.current = null;
      }
      if (innerRef) {
        innerRef.current = null;
      }
    };
  }, [innerRef]);

  function toggleToolbar() {
    setIsToolbarVisible((prev) => !prev);
    const toolbarElement = containerRef.current?.querySelector(".ql-toolbar");
    if (toolbarElement) {
      toolbarElement.classList.toggle("hidden");
    }
  }

  function onEmojiSelect(emoji: any) {
    const quill = quillRef.current;

    quill?.insertText(quill?.getSelection()?.index || 0, emoji.native);
  }
  const isEmpty =
    !attachments.length && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

  return (
    <div className="flex flex-col">
      <input
        type="file"
        accept="image/*"
        ref={imageElementRef}
        onChange={(e) => startUpload([e.target.files![0]])}
        className="hidden"
      />
      <div className="flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white">
        <div ref={containerRef} className="h-full ql-custom" />
        <div className="flex">
          {!!attachments &&
            attachments.map((item) => {
              return (
                <div
                  className={cn(
                    "p-2 relative transition-opacity",
                    item.isUploading && "opacity-50"
                  )}
                >
                  <div className="relative size-[62px] flex items-center justify-center group/image">
                    {!item.isUploading && (
                      <Hint label="remove image">
                        <button
                          onClick={() => {
                            removeAttachment(item.file.name);
                          }}
                          className="hidden group-hover/image:flex rounded-full bg-black/70 hover:bg-black absolute -top-2.5 -right-2.5 text-white size-6 z-[4] border-2 border-white items-center justify-center"
                        >
                          <XIcon className="size-3.5" />
                        </button>
                      </Hint>
                    )}
                    <Image
                      src={URL.createObjectURL(item.file)}
                      alt="uploaded image"
                      fill
                      className="rounded-xl overflow-hidden border object-cover"
                    />
                  </div>
                </div>
              );
            })}
        </div>
        <div className="flex px-2 pb-2 z-[5]">
          <Hint
            label={isToolbarVisible ? "Hide formatting" : "Show formatting"}
          >
            <Button
              disabled={disabled}
              size="iconSm"
              variant="ghost"
              onClick={toggleToolbar}
            >
              <PiTextAa className="size-4" />
            </Button>
          </Hint>
          <EmojiPopover onEmojiSelect={onEmojiSelect}>
            <Button disabled={disabled} size="iconSm" variant="ghost">
              <Smile className="size-4" />
            </Button>
          </EmojiPopover>
          {variant == "create" && (
            <Hint label="Image">
              <Button
                disabled={disabled}
                size="iconSm"
                variant="ghost"
                onClick={() => imageElementRef.current?.click()}
              >
                <ImageIcon className="size-4" />
              </Button>
            </Hint>
          )}
          {variant == "update" && (
            <div className="ml-auto flex items-center gap-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onCancel}
                disabled={disabled}
              >
                Cancel
              </Button>
              <Button
                disabled={disabled || isEmpty}
                size="sm"
                onClick={() => {
                  onSubmit({
                    body: JSON.stringify(quillRef.current?.getContents()),
                    attachments: attachments
                      .map((item) => item.url)
                      .filter((i) => i !== undefined),
                  });
                }}
                className=" bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
              >
                Save
              </Button>
            </div>
          )}
          {variant == "create" && (
            <Button
              onClick={() => {
                onSubmit({
                  body: JSON.stringify(quillRef.current?.getContents()),
                  attachments: attachments
                    .map((item) => item.url)
                    .filter((i) => i !== undefined),
                });
              }}
              disabled={disabled || isEmpty || isUploading}
              size="iconSm"
              className={cn(
                "ml-auto",
                isEmpty
                  ? "bg-white hover:bg-white text-muted-foreground"
                  : "bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
              )}
            >
              <MdSend className="size-4" />
            </Button>
          )}
        </div>
      </div>
      {variant == "create" && (
        <div
          className={cn(
            "p-2 hidden text-[10px] text-muted-foreground md:flex justify-end opacity-0 transition duration-200",
            !isEmpty && "opacity-100"
          )}
        >
          <p>
            <strong>Shift + Return</strong> to add a new line
          </p>
        </div>
      )}
    </div>
  );
};

export default Editor;
