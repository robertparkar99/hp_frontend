"use client";
import React, { useEffect, useState } from "react";
import { Editor } from "@tiptap/react";
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, ChevronDown, 
  Type, Minus, Plus, Palette, Highlighter, Check
} from "lucide-react";

export const ContextualTopBar = () => {
    const [activeEditor, setActiveEditor] = useState<Editor | null>(null);

    useEffect(() => {
        const handleSetActive = (e: any) => {
            setActiveEditor(e.detail.editor);
        };
        const handleClearActive = () => {
            setActiveEditor(null);
        };

        window.addEventListener("set-active-editor", handleSetActive);
        window.addEventListener("clear-active-editor", handleClearActive);
        
        // Also clear if a drag starts on the canvas (handled elsewhere but good for safety)
        window.addEventListener("craft-drag-start", handleClearActive);

        return () => {
            window.removeEventListener("set-active-editor", handleSetActive);
            window.removeEventListener("clear-active-editor", handleClearActive);
            window.removeEventListener("craft-drag-start", handleClearActive);
        };
    }, []);

    if (!activeEditor) return null;

    const editor = activeEditor;

    return (
        <div className="h-[52px] bg-white border-b border-sky-100/40 flex items-center px-4 gap-1 z-[45] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] animate-in slide-in-from-top fade-in duration-300 ease-out flex-shrink-0">
            {/* Font Family */}
            <div className="flex items-center gap-1.5 bg-neutral-50/50 hover:bg-neutral-100/80 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer group border border-neutral-100 hover:border-sky-100 overflow-hidden">
                <Type className="w-4 h-4 text-sky-500/80 group-hover:text-sky-600 mr-0.5" />
                <select
                    value={editor.getAttributes("textStyle").fontFamily || "Inter"}
                    onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                    className="bg-transparent border-0 outline-none text-[13px] font-bold text-neutral-700 cursor-pointer w-[140px] truncate"
                >
                    <optgroup label="Sans-Serif">
                        <option value="Inter">Inter</option>
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Poppins">Poppins</option>
                    </optgroup>
                    <optgroup label="Serif">
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Merriweather">Merriweather</option>
                        <option value="Lora">Lora</option>
                    </optgroup>
                    <optgroup label="Monospace">
                        <option value="Courier New">Courier New</option>
                        <option value="Consolas">Consolas</option>
                        <option value="Fira Code">Fira Code</option>
                    </optgroup>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-sky-500 transition-colors" />
            </div>

            <div className="w-px h-6 bg-neutral-200/60 mx-1" />

            {/* Font Size */}
            <div className="flex items-center bg-neutral-50/50 rounded-lg p-0.5 border border-neutral-100 hover:border-sky-100 transition-all">
                <button
                    onClick={() => {
                        const currentSize = parseInt(editor.getAttributes("textStyle").fontSize) || 16;
                        editor.chain().focus().setFontSize(`${currentSize - 1}px`).run();
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:text-sky-600 hover:shadow-sm transition-all text-neutral-500 active:scale-90"
                >
                    <Minus className="w-3.5 h-3.5" strokeWidth={3} />
                </button>
                <input 
                    type="number"
                    value={parseInt(editor.getAttributes("textStyle").fontSize) || 16}
                    onChange={(e) => editor.chain().focus().setFontSize(`${e.target.value}px`).run()}
                    className="w-10 h-8 bg-transparent text-center font-bold text-sm text-neutral-700 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    onMouseDown={(e) => e.stopPropagation()}
                />
                <button
                    onClick={() => {
                        const currentSize = parseInt(editor.getAttributes("textStyle").fontSize) || 16;
                        editor.chain().focus().setFontSize(`${currentSize + 1}px`).run();
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:text-sky-600 hover:shadow-sm transition-all text-neutral-500 active:scale-90"
                >
                    <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                </button>
            </div>

            <div className="w-px h-6 bg-neutral-200/60 mx-1" />

            {/* Basic Formatting */}
            <div className="flex items-center gap-0.5 bg-neutral-50/50 rounded-lg p-0.5 border border-neutral-100 transition-all">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded-md transition-all active:scale-95 ${editor.isActive("bold") ? "bg-sky-500 text-white shadow-sm shadow-sky-500/20" : "hover:bg-white text-neutral-600"}`}
                    title="Bold"
                >
                    <Bold className="w-4 h-4" strokeWidth={3} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded-md transition-all active:scale-95 ${editor.isActive("italic") ? "bg-sky-500 text-white shadow-sm shadow-sky-500/20" : "hover:bg-white text-neutral-600"}`}
                    title="Italic"
                >
                    <Italic className="w-4 h-4" strokeWidth={3} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-2 rounded-md transition-all active:scale-95 ${editor.isActive("underline") ? "bg-sky-500 text-white shadow-sm shadow-sky-500/20" : "hover:bg-white text-neutral-600"}`}
                    title="Underline"
                >
                    <Underline className="w-4 h-4" strokeWidth={3} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-2 rounded-md transition-all active:scale-95 ${editor.isActive("strike") ? "bg-sky-500 text-white shadow-sm shadow-sky-500/20" : "hover:bg-white text-neutral-600"}`}
                    title="Strike"
                >
                    <Strikethrough className="w-4 h-4" strokeWidth={3} />
                </button>
            </div>

            {/* Colors */}
            <div className="flex items-center gap-0.5 bg-neutral-50/50 rounded-lg p-0.5 border border-neutral-100 transition-all">
                <div className="relative group p-2 rounded-md hover:bg-white cursor-pointer transition-all flex flex-col items-center justify-center min-w-[36px] min-h-[36px]" title="Text Color">
                    <Palette className="w-4 h-4 text-neutral-600 group-hover:text-sky-600 transition-colors" />
                    <input 
                        type="color" 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        value={editor.getAttributes("textStyle").color || "#000000"}
                        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                        onMouseDown={(e) => e.stopPropagation()}
                    />
                    <div className="w-4 h-[3px] mt-0.5 rounded-full" style={{ backgroundColor: editor.getAttributes("textStyle").color || "#000" }} />
                </div>
                <div className="relative group p-2 rounded-md hover:bg-white cursor-pointer transition-all flex flex-col items-center justify-center min-w-[36px] min-h-[36px]" title="Highlight">
                    <Highlighter className="w-4 h-4 text-neutral-600 group-hover:text-sky-600 transition-colors" />
                    <input 
                        type="color" 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        value={editor.getAttributes("highlight").color || "#ffff00"}
                        onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
                        onMouseDown={(e) => e.stopPropagation()}
                    />
                    <div className="w-4 h-[3px] mt-0.5 rounded-full" style={{ backgroundColor: editor.getAttributes("highlight").color || "#ff0" }} />
                </div>
            </div>

            <div className="w-px h-6 bg-neutral-200/60 mx-1" />

            {/* Alignment */}
            <div className="flex items-center gap-0.5 bg-neutral-50/50 rounded-lg p-0.5 border border-neutral-100 transition-all">
                <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-2 rounded-md transition-all active:scale-95 ${editor.isActive({ textAlign: 'left' }) ? "bg-white shadow-sm text-sky-600" : "hover:bg-white text-neutral-600"}`} title="Align Left"><AlignLeft className="w-4 h-4" /></button>
                <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-2 rounded-md transition-all active:scale-95 ${editor.isActive({ textAlign: 'center' }) ? "bg-white shadow-sm text-sky-600" : "hover:bg-white text-neutral-600"}`} title="Align Center"><AlignCenter className="w-4 h-4" /></button>
                <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-2 rounded-md transition-all active:scale-95 ${editor.isActive({ textAlign: 'right' }) ? "bg-white shadow-sm text-sky-600" : "hover:bg-white text-neutral-600"}`} title="Align Right"><AlignRight className="w-4 h-4" /></button>
                <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`p-2 rounded-md transition-all active:scale-95 ${editor.isActive({ textAlign: 'justify' }) ? "bg-white shadow-sm text-sky-600" : "hover:bg-white text-neutral-600"}`} title="Align Justify"><AlignJustify className="w-4 h-4" /></button>
            </div>

            {/* Lists */}
            <div className="flex items-center gap-0.5 bg-neutral-50/50 rounded-lg p-0.5 border border-neutral-100 transition-all ml-1">
                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-md transition-all active:scale-95 ${editor.isActive('bulletList') ? "bg-white shadow-sm text-sky-600" : "hover:bg-white text-neutral-600"}`} title="Bullet List"><List className="w-4 h-4" /></button>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded-md transition-all active:scale-95 ${editor.isActive('orderedList') ? "bg-white shadow-sm text-sky-600" : "hover:bg-white text-neutral-600"}`} title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
            </div>
            
            <div className="ml-auto flex items-center pr-2 gap-4">
                <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-r border-neutral-200 pr-4">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    Text Mode
                </div>
                
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('exit-text-edit-mode'))}
                    className="flex items-center gap-2 px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold shadow-sm shadow-sky-500/20 transition-all active:scale-95 group"
                    title="Finish Editing"
                >
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    Done
                </button>
            </div>
        </div>
    );
};
