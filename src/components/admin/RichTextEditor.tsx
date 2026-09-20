"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
const lowlight = createLowlight(common);
export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false, link: false }),
      Link.configure({
        openOnClick: false,
        autolink: false,
        protocols: ["http", "https", "mailto"],
      }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: value,
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
    editorProps: {
      attributes: {
        class: "editor-content",
        role: "textbox",
        "aria-label": "Artikelinhoud",
        "aria-multiline": "true",
      },
    },
  });
  if (!editor) return <div className="editor-loading">Editor laden…</div>;
  const link = () => {
    const current = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("HTTPS-URL", current ?? "https://");
    if (href === null) return;
    if (!href) editor.chain().focus().unsetLink().run();
    else if (/^(https?:|mailto:)/i.test(href))
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    else window.alert("Gebruik een HTTPS-URL of mailto-link.");
  };
  return (
    <div className="editor">
      <div className="editor-toolbar" role="toolbar" aria-label="Tekstopmaak">
        <button
          type="button"
          aria-pressed={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>Vet</strong>
        </button>
        <button
          type="button"
          aria-pressed={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>Cursief</em>
        </button>
        <button
          type="button"
          aria-pressed={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          Kop
        </button>
        <button
          type="button"
          aria-pressed={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Lijst
        </button>
        <button
          type="button"
          aria-pressed={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Citaat
        </button>
        <button
          type="button"
          aria-pressed={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          Code
        </button>
        <button
          type="button"
          aria-pressed={editor.isActive("link")}
          onClick={link}
        >
          Link
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
