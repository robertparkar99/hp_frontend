"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import { useEditor as useTiptapEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import FontFamily from "@tiptap/extension-font-family";
import { Extension } from "@tiptap/core";
import { PositionControl } from "../editor/settings/PositionControl";
import { ColorPicker } from "../editor/settings/ColorPicker";
import { OverlayWrapper } from "../editor/settings/OverlayWrapper";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        fontSize: {
            setFontSize: (size: string) => ReturnType;
            unsetFontSize: () => ReturnType;
        };
    }
}

const FontSize = Extension.create({
    name: "fontSize",
    addOptions() { return { types: ["textStyle"] }; },
    addGlobalAttributes() {
        return [{
            types: this.options.types,
            attributes: {
                fontSize: {
                    default: null,
                    parseHTML: (element) => element.style.fontSize.replace(/['"]+/g, ""),
                    renderHTML: (attributes) => {
                        if (!attributes.fontSize) return {};
                        return { style: `font-size: ${attributes.fontSize}` };
                    },
                },
            },
        }];
    },
    addCommands() {
        return {
            setFontSize: (fontSize) => ({ chain }) => chain().setMark("textStyle", { fontSize }).run(),
            unsetFontSize: () => ({ chain }) => chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
        };
    },
});

export const TextBlock = ({
    html,
    color,
    backgroundColor,
    isOverlay,
    x,
    y,
    rotation = 0,
    zIndex,
    width,
    height,
    bold,
    italic,
    alignment,
    fontSize = 16,
    textEffect = 'none',
    effectColor = 'rgba(0,0,0,0.5)',
    textShape = 'none'
}: any) => {
    const {
        connectors: { connect },
        actions: { setProp },
    } = useNode(); // Prevent re-rendering component exclusively on text HTML changes

    const getEffectStyles = (): React.CSSProperties => {
        switch (textEffect) {
            case 'shadow': return { textShadow: `2px 2px 4px ${effectColor}` };
            case 'lift': return { textShadow: `0px 10px 20px ${effectColor}` };
            case 'hollow': return { WebkitTextStroke: `1px ${color || '#000'}`, color: 'transparent' };
            case 'splice': return { WebkitTextStroke: `1px ${color || '#000'}`, color: 'transparent', textShadow: `2px 2px 0px ${effectColor}` };
            case 'outline': return { WebkitTextStroke: `2px ${effectColor}` };
            case 'echo': return { textShadow: `2px 2px 0px ${effectColor}, 4px 4px 0px ${effectColor}80, 6px 6px 0px ${effectColor}40` };
            case 'glitch': return { textShadow: `2px 0px 0px rgba(0,255,255,0.7), -2px 0px 0px rgba(255,0,255,0.7)` };
            case 'neon': return { textShadow: `0 0 5px ${color || '#fff'}, 0 0 10px ${color || '#fff'}, 0 0 20px ${effectColor}, 0 0 40px ${effectColor}` };
            case 'background': return { backgroundColor: effectColor, padding: '0.2em 0.4em', borderRadius: '4px' };
            default: return {};
        }
    };

    const [active, setActive] = React.useState(false);

    const editor = useTiptapEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            Underline,
            Strike,
            FontFamily,
            FontSize,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
        ],
        content: html || "<p>Type your text here...</p>",
        immediatelyRender: false,
        onUpdate: ({ editor: ed }) => {
            // Push prop updates externally preventing concurrent render state updates
            setTimeout(() => {
                setProp((props: any) => (props.html = ed.getHTML()));
            }, 0);
        },
        editorProps: {
            attributes: {
                class: "focus:outline-none min-h-[1em] w-full break-words prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-4 [&_blockquote]:italic",
            },
        },
    });

    React.useEffect(() => {
        if (editor && alignment) {
            editor.commands.setTextAlign(alignment);
        }
    }, [editor, alignment]);

    return (
        <OverlayWrapper isOverlay={isOverlay} isText={true} x={x} y={y} width={width} height={height} rotation={rotation} zIndex={zIndex}>
            {editor && (
                <BubbleMenu editor={editor}>
                    <div className="flex flex-nowrap bg-white/95 backdrop-blur-xl border border-sky-100/60 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.03] pointer-events-auto overflow-x-auto overflow-y-hidden divide-x divide-sky-50/50 items-stretch h-14 w-max max-w-[90vw] md:max-w-[700px] px-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sky-200 [&::-webkit-scrollbar-thumb]:rounded-full pb-1">

                        {/* Font Family */}
                        <div className="flex items-center px-2 py-1">
                            <select
                                onMouseDown={(e) => e.stopPropagation()}
                                onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                                value={editor.getAttributes("textStyle").fontFamily || "Inter"}
                                className="h-full px-2 text-[15px] font-medium border-0 outline-none bg-transparent hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer w-36 truncate"
                            >
                                <optgroup label="Sans-Serif">
                                    <option value="Inter">Inter</option>
                                    <option value="Arial">Arial</option>
                                    <option value="Helvetica">Helvetica</option>
                                    <option value="Verdana">Verdana</option>
                                    <option value="Open Sans">Open Sans</option>
                                    <option value="Roboto">Roboto</option>
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
                                    <option value="PT Serif">PT Serif</option>
                                </optgroup>
                                <optgroup label="Monospace">
                                    <option value="Courier New">Courier New</option>
                                    <option value="Consolas">Consolas</option>
                                    <option value="Menlo">Menlo</option>
                                    <option value="Monaco">Monaco</option>
                                    <option value="Fira Code">Fira Code</option>
                                </optgroup>
                                <optgroup label="Display">
                                    <option value="Comic Sans MS">Comic Sans MS</option>
                                    <option value="Impact">Impact</option>
                                    <option value="Oswald">Oswald</option>
                                    <option value="Bebas Neue">Bebas Neue</option>
                                    <option value="Lobster">Lobster</option>
                                </optgroup>
                            </select>
                        </div>

                        {/* Font Size */}
                        <div className="flex items-center px-2 py-1 space-x-1">
                            <button type="button" onMouseDown={(e) => { e.preventDefault(); const currentSize = parseInt(editor.getAttributes("textStyle").fontSize) || 16; editor.chain().focus().setFontSize(`${currentSize - 1}px`).run(); }} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-sky-50 hover:text-sky-600 text-neutral-600 hover:text-neutral-900 font-bold transition-colors">-</button>
                            <input type="number" onMouseDown={(e) => e.stopPropagation()} className="w-12 h-8 text-[15px] text-center font-semibold border-0 outline-none bg-transparent hover:bg-neutral-50 rounded transition-colors" value={editor.getAttributes("textStyle").fontSize ? parseInt(editor.getAttributes("textStyle").fontSize) : 16} onChange={(e) => { if (e.target.value) editor.chain().focus().setFontSize(`${e.target.value}px`).run(); }} />
                            <button type="button" onMouseDown={(e) => { e.preventDefault(); const currentSize = parseInt(editor.getAttributes("textStyle").fontSize) || 16; editor.chain().focus().setFontSize(`${currentSize + 1}px`).run(); }} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-sky-50 hover:text-sky-600 text-neutral-600 hover:text-neutral-900 font-bold transition-colors">+</button>
                        </div>

                        {/* Text Color */}
                        <div className="flex items-center px-3 py-1">
                            <div className="relative flex items-center justify-center w-8 h-8 rounded-md hover:bg-sky-50 hover:text-sky-600 hover:scale-105 cursor-pointer overflow-hidden transition-all group" title="Text Color">
                                <span className="font-bold text-neutral-800 text-[15px] pointer-events-none pb-1 border-b-4 group-hover:border-b-8 transition-all" style={{ borderColor: editor.getAttributes("textStyle").color || "#000000" }}>A</span>
                                <input type="color" onMouseDown={(e) => e.stopPropagation()} onChange={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()} value={editor.getAttributes("textStyle").color || "#000000"} className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 opacity-0 cursor-pointer" />
                            </div>
                        </div>

                        {/* Highlight Color */}
                        <div className="flex items-center px-3 py-1">
                            <div className="relative flex items-center justify-center w-8 h-8 rounded-md hover:bg-sky-50 hover:text-sky-600 hover:scale-105 cursor-pointer overflow-hidden transition-all group" title="Highlight Color">
                                <span className="font-bold text-neutral-800 text-xs pointer-events-none pb-1 border-b-4 group-hover:border-b-8 transition-all" style={{ borderColor: editor.getAttributes("highlight").color || "transparent", backgroundColor: editor.getAttributes("highlight").color || "transparent" }}>H</span>
                                <input type="color" onMouseDown={(e) => e.stopPropagation()} onChange={(e) => editor.chain().focus().setMark('highlight', { color: (e.target as HTMLInputElement).value }).run()} value={editor.getAttributes("highlight").color || "#ffff00"} className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 opacity-0 cursor-pointer" />
                            </div>
                        </div>

                        {/* Formatting B I U S */}
                        <div className="flex items-center px-2 py-1 space-x-1">
                            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }} className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-[15px] transition-all hover:scale-105 ${editor.isActive("bold") ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_2px_10px_rgba(14,165,233,0.3)]" : "text-neutral-700 hover:bg-sky-50 hover:text-sky-600"}`}>B</button>
                            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }} className={`w-8 h-8 rounded-md flex items-center justify-center italic font-serif text-[15px] transition-all hover:scale-105 ${editor.isActive("italic") ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_2px_10px_rgba(14,165,233,0.3)]" : "text-neutral-700 hover:bg-sky-50 hover:text-sky-600"}`}>I</button>
                            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }} className={`w-8 h-8 rounded-md flex items-center justify-center underline font-serif text-[15px] transition-all hover:scale-105 ${editor.isActive("underline") ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_2px_10px_rgba(14,165,233,0.3)]" : "text-neutral-700 hover:bg-sky-50 hover:text-sky-600"}`}>U</button>
                            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }} className={`w-8 h-8 rounded-md flex items-center justify-center line-through font-serif text-[15px] transition-all hover:scale-105 ${editor.isActive("strike") ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_2px_10px_rgba(14,165,233,0.3)]" : "text-neutral-700 hover:bg-sky-50 hover:text-sky-600"}`}>S</button>
                        </div>

                        {/* Alignment */}
                        <div className="flex items-center px-2 py-1 space-x-1 border-r border-neutral-100">
                            {['left', 'center', 'right', 'justify'].map((align) => (
                                <button key={align} type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign(align).run(); }} className={`w-8 h-8 flex items-center justify-center rounded-md transition-all hover:scale-105 ${editor.isActive({ textAlign: align }) ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_2px_10px_rgba(14,165,233,0.3)]' : 'text-neutral-700 hover:bg-sky-50 hover:text-sky-600'}`} title={`Align ${align}`}>
                                    {align === 'left' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="15" y1="12" x2="3" y2="12"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>}
                                    {align === 'center' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="19" y1="12" x2="5" y2="12"></line><line x1="17" y1="18" x2="7" y2="18"></line></svg>}
                                    {align === 'right' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="12" x2="9" y2="12"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>}
                                    {align === 'justify' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="12" x2="3" y2="12"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>}
                                </button>
                            ))}
                        </div>

                        {/* Lists & Blockquote */}
                        <div className="flex items-center px-2 py-1 space-x-1">
                            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }} className={`w-8 h-8 flex items-center justify-center rounded-md transition-all hover:scale-105 ${editor.isActive("bulletList") ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_2px_10px_rgba(14,165,233,0.3)]" : "text-neutral-700 hover:bg-sky-50 hover:text-sky-600"}`} title="Bullet List">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="9" y1="6" x2="20" y2="6"></line><line x1="9" y1="12" x2="20" y2="12"></line><line x1="9" y1="18" x2="20" y2="18"></line><circle cx="4" cy="6" r="1.5"></circle><circle cx="4" cy="12" r="1.5"></circle><circle cx="4" cy="18" r="1.5"></circle></svg>
                            </button>
                            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }} className={`w-8 h-8 flex items-center justify-center rounded-md transition-all hover:scale-105 ${editor.isActive("orderedList") ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_2px_10px_rgba(14,165,233,0.3)]" : "text-neutral-700 hover:bg-sky-50 hover:text-sky-600"}`} title="Numbered List">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>
                            </button>
                            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }} className={`w-8 h-8 flex items-center justify-center rounded-md transition-all hover:scale-105 ${editor.isActive("blockquote") ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_2px_10px_rgba(14,165,233,0.3)]" : "text-neutral-700 hover:bg-sky-50 hover:text-sky-600"}`} title="Quote">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path></svg>
                            </button>
                        </div>

                    </div>
                </BubbleMenu>
            )}
            {textShape === 'curve' && !active ? (
                <div
                    onClick={() => setActive(true)}
                    style={{
                        width: "100%",
                        height: "100%",
                        color: color || "inherit",
                        fontWeight: bold ? "bold" : "normal",
                        fontStyle: italic ? "italic" : "normal",
                        fontSize: `calc(${fontSize}px * var(--scale-multiplier, 1))`
                    }}
                    className="relative flex items-center justify-center p-2 hover:bg-neutral-50 cursor-text"
                >
                    <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
                        <path id={`curve-${x}-${y}`} d="M 10,90 A 90,90 0 0,1 190,90" fill="transparent" />
                        <text className="font-sans font-bold" style={{ fill: "currentColor", fontSize: "20px" }} textAnchor="middle">
                            <textPath href={`#curve-${x}-${y}`} startOffset="50%">
                                {editor?.getText() || "Curved Text"}
                            </textPath>
                        </text>
                    </svg>
                </div>
            ) : (
                <div
                    onClick={() => setActive(true)}
                    onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                            setActive(false);
                        }
                    }}
                    style={{
                        width: "100%",
                        height: "100%",
                        color: color || "inherit",
                        backgroundColor: textEffect === 'background' ? "transparent" : (backgroundColor || "transparent"),
                        fontWeight: bold ? "bold" : "normal",
                        fontStyle: italic ? "italic" : "normal",
                        textAlign: alignment || "left",
                        fontSize: `calc(${fontSize}px * var(--scale-multiplier, 1))`,
                        ...getEffectStyles()
                    }}
                    className={`relative p-2 ${active ? "ring-2 ring-primary ring-offset-1 rounded-sm" : ""} hover:bg-neutral-50 cursor-text [&_p]:m-0`}
                >
                    <EditorContent editor={editor} className="w-full h-full" />
                </div>
            )}
        </OverlayWrapper>
    );
};

export const TextBlockSettings = ({ isDesignTab }: { isDesignTab?: boolean }) => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));

    if (!isDesignTab) {
        return (
            <div className="flex flex-col space-y-4">
                <p className="text-sm text-muted-foreground">
                    Double click the text block on the canvas to edit text.
                    Highlight specific words to reveal the inline formatting toolbar (colors, sizes, bolding)!
                </p>
                <p className="text-sm text-muted-foreground">
                    Use the Design tab to adjust global styles that apply to the entire box.
                </p>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Global Scaling</label>
                    <div className="flex items-center space-x-2 pb-2">
                        <div className="flex items-center border border-input rounded overflow-hidden">
                            <input
                                type="number"
                                value={props.fontSize || 16}
                                onChange={(e) => setProp((p: any) => p.fontSize = Number(e.target.value))}
                                className="w-16 h-8 bg-transparent px-2 text-xs outline-none text-center"
                            />
                            <div className="h-8 flex items-center px-2 bg-neutral-100 text-xs text-muted-foreground border-l border-input">px</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Design Tab
    return (
        <div className="flex flex-col space-y-6">
            <PositionControl
                isOverlay={props.isOverlay}
                x={props.x}
                y={props.y}
                zIndex={props.zIndex}
                onChange={(prop, val) => setProp((p: any) => p[prop] = val)}
            />

            <ColorPicker
                label="Background Fill"
                color={props.backgroundColor}
                onChange={(color) => setProp((p: any) => p.backgroundColor = color)}
            />

            <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="text-sm font-semibold">Effects</h4>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'none', label: 'None' },
                        { id: 'shadow', label: 'Shadow' },
                        { id: 'lift', label: 'Lift' },
                        { id: 'hollow', label: 'Hollow' },
                        { id: 'splice', label: 'Splice' },
                        { id: 'outline', label: 'Outline' },
                        { id: 'echo', label: 'Echo' },
                        { id: 'glitch', label: 'Glitch' },
                        { id: 'neon', label: 'Neon' },
                        { id: 'background', label: 'Background' }
                    ].map(effect => (
                        <button
                            key={effect.id}
                            onClick={() => setProp((p: any) => p.textEffect = effect.id)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${props.textEffect === effect.id ? 'border-sky-400 bg-sky-50/50 ring-1 ring-sky-400 shadow-[0_4px_12px_rgba(14,165,233,0.15)]' : 'border-sky-100/60 hover:border-sky-300 bg-white/60 hover:bg-sky-50/50 shadow-sm hover:shadow'}`}
                        >
                            <span className="text-xl font-bold font-sans text-neutral-800 mb-1 pointer-events-none" style={
                                effect.id === 'shadow' ? { textShadow: '1px 1px 2px rgba(0,0,0,0.5)' } :
                                    effect.id === 'lift' ? { textShadow: '0 4px 8px rgba(0,0,0,0.3)' } :
                                        effect.id === 'hollow' ? { WebkitTextStroke: '1px #000', color: 'transparent' } :
                                            effect.id === 'splice' ? { WebkitTextStroke: '1px #000', color: 'transparent', textShadow: '2px 2px 0px rgba(0,0,0,0.3)' } :
                                                effect.id === 'outline' ? { WebkitTextStroke: '1.5px #666' } :
                                                    effect.id === 'echo' ? { textShadow: '1px 1px 0px rgba(0,0,0,0.5), 2px 2px 0px rgba(0,0,0,0.2)' } :
                                                        effect.id === 'glitch' ? { textShadow: '1px 0 0 cyan, -1px 0 0 magenta' } :
                                                            effect.id === 'neon' ? { textShadow: '0 0 3px #fff, 0 0 6px #ff00ff' } :
                                                                effect.id === 'background' ? { backgroundColor: '#e5e5e5', padding: '0 4px' } :
                                                                    {}
                            }>Ag</span>
                            <span className="text-[10px] text-slate-500 font-medium">{effect.label}</span>
                        </button>
                    ))}
                </div>

                {props.textEffect !== 'none' && props.textEffect !== 'hollow' && props.textEffect !== 'glitch' && (
                    <div className="pt-2">
                        <ColorPicker
                            label="Effect Color"
                            color={props.effectColor || 'rgba(0,0,0,0.5)'}
                            onChange={(color) => setProp((p: any) => p.effectColor = color)}
                        />
                    </div>
                )}
            </div>

            <div className="space-y-3 pt-4 border-t border-border mt-4">
                <h4 className="text-sm font-semibold">Shape</h4>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { id: 'none', label: 'None', preview: 'ABCD' },
                        { id: 'curve', label: 'Curve', preview: 'A B C D' }
                    ].map(shape => (
                        <button
                            key={shape.id}
                            onClick={() => setProp((p: any) => p.textShape = shape.id)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${props.textShape === shape.id ? 'border-sky-400 bg-sky-50/50 ring-1 ring-sky-400 shadow-[0_4px_12px_rgba(14,165,233,0.15)]' : 'border-sky-100/60 hover:border-sky-300 bg-white/60 hover:bg-sky-50/50 shadow-sm hover:shadow'}`}
                        >
                            <span className="text-xl font-bold font-sans text-neutral-800 mb-2 pointer-events-none" style={shape.id === 'curve' ? { transform: 'rotate(-10deg) translateY(5px)' } : {}}>{shape.preview}</span>
                            <span className="text-[12px] text-slate-500 font-medium">{shape.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

TextBlock.craft = {
    displayName: "Text",
    props: {
        html: "<p>Type your text here...</p>",
        isOverlay: true,
        x: 50,
        y: 50,
        zIndex: 20,
        width: "100%",
        height: "auto",
        backgroundColor: "transparent",
        color: "#000000",
        bold: false,
        italic: false,
        alignment: "left",
        fontSize: 16,
        textEffect: "none",
        effectColor: "rgba(0,0,0,0.5)",
        textShape: "none",
    },
    related: {
        settings: TextBlockSettings,
    },
};
