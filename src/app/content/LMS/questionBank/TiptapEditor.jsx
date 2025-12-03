"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
} from "lucide-react";
import { useEffect } from "react";

export default function TiptapEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange && typeof onChange === 'function') {
        onChange(html);
      }
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border rounded-md p-2 relative">
      {/* Toolbar */}
      <div className="flex gap-2 border-b pb-2 mb-2 flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded ${editor.isActive("bold") ? "bg-gray-300" : ""}`}
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 rounded ${editor.isActive("italic") ? "bg-gray-300" : ""}`}
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1 rounded ${
            editor.isActive("underline") ? "bg-gray-300" : ""
          }`}
        >
          <UnderlineIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`p-1 rounded ${
            editor.isActive("heading", { level: 1 }) ? "bg-gray-300" : ""
          }`}
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-1 rounded ${
            editor.isActive("heading", { level: 2 }) ? "bg-gray-300" : ""
          }`}
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1 rounded ${
            editor.isActive("bulletList") ? "bg-gray-300" : ""
          }`}
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1 rounded ${
            editor.isActive("orderedList") ? "bg-gray-300" : ""
          }`}
        >
          <ListOrdered size={16} />
        </button>
      </div>

      {/* Editor with resize and placeholder */}
      <div className="relative min-h-[100px]">
        <EditorContent 
          editor={editor} 
          className="px-2 min-h-[80px] resize-y overflow-auto" 
          style={{ resize: "vertical" }} 
        />
        
        {/* Placeholder */}
        {(!value || !editor.getText().trim()) && (
          <span className="text-gray-400 text-sm absolute top-2 left-4 pointer-events-none">
            {placeholder}
          </span>
        )}
      </div>
    </div>
  );
}   


