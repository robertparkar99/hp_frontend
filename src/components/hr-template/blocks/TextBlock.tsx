"use client";
import React from "react";
import { createPortal } from "react-dom";
import { useEditor as useCraftEditor, useNode } from "@craftjs/core";
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
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    BringToFront,
    CaseSensitive,
    Italic,
    List,
    ListOrdered,
    PaintRoller,
    Palette,
    Sparkles,
    Strikethrough,
    Underline as UnderlineIcon,
} from "lucide-react";

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
        selected,
    } = useNode((node) => ({
        selected: node.events.selected,
    }));
    const { query } = useCraftEditor();

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

    // ── Two-phase interaction: object-selected vs text-edit-mode ──
    const [editMode, setEditMode] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const toolbarRef = React.useRef<HTMLDivElement>(null);

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
        editable: false,
        onUpdate: ({ editor: ed }) => {
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

    const getToolbarFontSize = React.useCallback(() => {
        const activeSize = editor?.getAttributes("textStyle").fontSize;
        return activeSize ? parseFloat(activeSize) : Number(fontSize || 16);
    }, [editor, fontSize]);

    const applyFontSize = React.useCallback((nextSize: number) => {
        if (!editor || Number.isNaN(nextSize)) return;
        const clampedSize = Math.max(4, Math.min(nextSize, 240));
        const roundedSize = Math.round(clampedSize * 10) / 10;
        editor.chain().focus().setFontSize(`${roundedSize}px`).run();
        setProp((props: any) => {
            props.fontSize = roundedSize;
        });
    }, [editor, setProp]);

    const setAlignment = React.useCallback((align: string) => {
        if (!editor) return;
        editor.chain().focus().setTextAlign(align).run();
        setProp((props: any) => {
            props.alignment = align;
        });
    }, [editor, setProp]);

    const toggleTextCase = React.useCallback(() => {
        if (!editor) return;
        const { from, to, empty } = editor.state.selection;
        const currentText = empty ? editor.getText() : editor.state.doc.textBetween(from, to, "\n");
        if (!currentText) return;
        const nextText = currentText === currentText.toUpperCase() ? currentText.toLowerCase() : currentText.toUpperCase();

        if (empty) {
            editor.commands.setContent(`<p>${nextText}</p>`);
        } else {
            editor.chain().focus().insertContentAt({ from, to }, nextText).run();
        }
    }, [editor]);

    const cycleTextEffect = React.useCallback(() => {
        const effects = ["none", "shadow", "lift", "outline", "neon", "background"];
        const currentIndex = Math.max(0, effects.indexOf(textEffect));
        const nextEffect = effects[(currentIndex + 1) % effects.length];
        setProp((props: any) => {
            props.textEffect = nextEffect;
        });
    }, [setProp, textEffect]);

    const bringToFront = React.useCallback(() => {
        const nodes = query.getNodes();
        let maxZ = 20;
        Object.values(nodes).forEach((node: any) => {
            const nodeZ = node.data?.props?.zIndex;
            if (typeof nodeZ === "number" && nodeZ > maxZ) maxZ = nodeZ;
        });

        setProp((props: any) => {
            props.zIndex = maxZ + 1;
        });
    }, [query, setProp]);

    const copyStyleToClipboard = React.useCallback(async () => {
        const stylePayload = JSON.stringify({
            fontFamily: editor?.getAttributes("textStyle").fontFamily || "Inter",
            fontSize: getToolbarFontSize(),
            color: editor?.getAttributes("textStyle").color || color || "#000000",
            backgroundColor,
            alignment,
            textEffect,
            effectColor,
        });

        try {
            await navigator.clipboard.writeText(stylePayload);
        } catch {
            // Clipboard access can be blocked in some browser contexts.
        }
    }, [alignment, backgroundColor, color, effectColor, editor, getToolbarFontSize, textEffect]);

    const toolbarButtonClass = "h-9 min-w-9 inline-flex items-center justify-center rounded-lg px-2 text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition-colors";
    const activeToolbarButtonClass = "bg-[#111827] hover:scale-105 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_2px_10px_rgba(14,165,233,0.3)";
    const toolbarGroupClass = "flex h-9 items-center gap-0.5 px-1";
    const toolbarDivider = <div className="mx-1 h-7 w-px bg-neutral-200" />;

    const enterEditMode = React.useCallback((focusPosition: "end" | "all" | number = "end") => {
        if (!editor) return;
        setEditMode(true);
        editor.setEditable(true);
        requestAnimationFrame(() => {
            editor.commands.focus(focusPosition);
        });
    }, [editor]);

    // Open the text toolbar as soon as a text block is selected.
    React.useEffect(() => {
        if (!editor) return;

        if (selected) {
            enterEditMode("end");
        } else {
            setEditMode(false);
            editor.setEditable(false);
        }
    }, [editor, enterEditMode, selected]);

    // ── Exit edit mode when clicking outside the text block ──
    React.useEffect(() => {
        if (!editMode) return;
        const handlePointerDown = (e: PointerEvent) => {
            const target = e.target as Node;
            const clickedText = containerRef.current?.contains(target);
            const clickedToolbar = toolbarRef.current?.contains(target);

            if (!clickedText && !clickedToolbar) {
                setEditMode(false);
                if (editor) {
                    editor.setEditable(false);
                }
            }
        };
        // Use a microtask delay so the double-click that entered edit mode doesn't immediately exit
        const timer = setTimeout(() => {
            document.addEventListener('pointerdown', handlePointerDown, true);
        }, 100);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('pointerdown', handlePointerDown, true);
        };
    }, [editMode, editor]);

    // ── Also exit edit mode on Escape key ──
    React.useEffect(() => {
        if (!editMode) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setEditMode(false);
                if (editor) editor.setEditable(false);
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [editMode, editor]);

    // ── Normalize state on drag ──
    React.useEffect(() => {
        const handleDragStart = () => {
            setEditMode(false);
            if (editor) {
                editor.setEditable(false);
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('craft-drag-start', handleDragStart);
        }
        return () => {
            if (container) {
                container.removeEventListener('craft-drag-start', handleDragStart);
            }
        };
    }, [editor, containerRef]);

    return (
        <OverlayWrapper isOverlay={isOverlay} isText={true} x={x} y={y} width={width} height={height} rotation={rotation} zIndex={zIndex}>
            {/* Toolbar outside of canvas */}
            {editor && editMode && typeof document !== "undefined" && createPortal(
                <div
                    ref={toolbarRef}
                    className="flex flex-nowrap items-center gap-0 bg-white border border-neutral-200 rounded-xl shadow-[0_8px_24px_-14px_rgba(15,23,42,0.45)] ring-1 ring-black/[0.02] pointer-events-auto overflow-x-auto overflow-y-hidden h-14 w-max max-w-[90vw] md:max-w-[700px] px-2 text-neutral-950 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sky-200 [&::-webkit-scrollbar-thumb]:rounded-full "
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                >

                        {/* Font Family */}
                    <div className={toolbarGroupClass}>
                            <select
                                onMouseDown={(e) => e.stopPropagation()}
                                onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                                value={editor.getAttributes("textStyle").fontFamily || "Inter"}
                            className="h-9 px-3 text-[14px] font-semibold border border-neutral-200 outline-none bg-white hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer w-32 truncate"
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
                    <div className={`${toolbarGroupClass} rounded-lg border border-neutral-200 bg-white`}>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); applyFontSize(getToolbarFontSize() - 1); }} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-neutral-100 text-neutral-700 hover:text-neutral-950 font-bold transition-colors">-</button>
                        <input type="number" step="0.1" onMouseDown={(e) => e.stopPropagation()} className="w-11 h-7 text-[14px] text-center font-semibold border-0 outline-none bg-transparent rounded transition-colors" value={getToolbarFontSize()} onChange={(e) => { if (e.target.value) applyFontSize(Number(e.target.value)); }} />
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); applyFontSize(getToolbarFontSize() + 1); }} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-neutral-100 text-neutral-700 hover:text-neutral-950 font-bold transition-colors">+</button>
                        </div>

                        {/* Text Color */}
                    <div className={toolbarGroupClass}>
                        <div className="relative flex items-center justify-center h-9 min-w-9 rounded-lg hover:bg-neutral-100 cursor-pointer overflow-hidden transition-colors group" title="Text Color">
                                <span className="font-bold text-neutral-800 text-[15px] pointer-events-none pb-1 border-b-4 group-hover:border-b-8 transition-all" style={{ borderColor: editor.getAttributes("textStyle").color || "#000000" }}>A</span>
                                <input type="color" onMouseDown={(e) => e.stopPropagation()} onChange={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()} value={editor.getAttributes("textStyle").color || "#000000"} className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 opacity-0 cursor-pointer" />
                            </div>
                        </div>

                        {/* Highlight Color */}
                    <div className={toolbarGroupClass}>
                        <div className="relative flex items-center justify-center h-9 min-w-9 rounded-lg hover:bg-neutral-100 cursor-pointer overflow-hidden transition-colors group" title="Highlight Color">
                                <span className="font-bold text-neutral-800 text-xs pointer-events-none pb-1 border-b-4 group-hover:border-b-8 transition-all" style={{ borderColor: editor.getAttributes("highlight").color || "transparent", backgroundColor: editor.getAttributes("highlight").color || "transparent" }}>H</span>
                                <input type="color" onMouseDown={(e) => e.stopPropagation()} onChange={(e) => editor.chain().focus().setMark('highlight', { color: (e.target as HTMLInputElement).value }).run()} value={editor.getAttributes("highlight").color || "#ffff00"} className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 opacity-0 cursor-pointer" />
                            </div>
                        </div>

                        {/* Formatting B I U S */}
                    <div className={toolbarGroupClass}>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }} className={`${toolbarButtonClass} ${editor.isActive("bold") ? activeToolbarButtonClass : ""}`} title="Bold"><Bold className="h-5 w-5" /></button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }} className={`${toolbarButtonClass} ${editor.isActive("italic") ? activeToolbarButtonClass : ""}`} title="Italic"><Italic className="h-5 w-5" /></button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }} className={`${toolbarButtonClass} ${editor.isActive("underline") ? activeToolbarButtonClass : ""}`} title="Underline"><UnderlineIcon className="h-5 w-5" /></button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }} className={`${toolbarButtonClass} ${editor.isActive("strike") ? activeToolbarButtonClass : ""}`} title="Strikethrough"><Strikethrough className="h-5 w-5" /></button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); toggleTextCase(); }} className={toolbarButtonClass} title="Toggle case"><CaseSensitive className="h-5 w-5" /></button>
                        </div>

                        {/* Alignment */}
                    <div className={toolbarGroupClass}>
                        {[
                            { id: 'left', icon: AlignLeft },
                            { id: 'center', icon: AlignCenter },
                            { id: 'right', icon: AlignRight },
                        ].map(({ id: align, icon: Icon }) => (
                            <button key={align} type="button" onMouseDown={(e) => { e.preventDefault(); setAlignment(align); }} className={`${toolbarButtonClass} ${editor.isActive({ textAlign: align }) || alignment === align ? activeToolbarButtonClass : ""}`} title={`Align ${align}`}>
                                <Icon className="h-5 w-5" />
                                </button>
                            ))}
                        </div>

                        {/* Lists & Blockquote */}
                    <div className={toolbarGroupClass}>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }} className={`${toolbarButtonClass} ${editor.isActive("bulletList") ? activeToolbarButtonClass : ""}`} title="Bullet list">
                            <List className="h-5 w-5" />
                            </button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }} className={`${toolbarButtonClass} ${editor.isActive("orderedList") ? activeToolbarButtonClass : ""}`} title="Numbered list">
                            <ListOrdered className="h-5 w-5" />
                            </button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }} className={`${toolbarButtonClass} ${editor.isActive("blockquote") ? activeToolbarButtonClass : ""}`} title="Quote">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path></svg>
                            </button>
                        </div>

                    {toolbarDivider}

                    <button type="button" onMouseDown={(e) => { e.preventDefault(); cycleTextEffect(); }} className={`${toolbarButtonClass} ${textEffect !== "none" ? "bg-neutral-100 text-neutral-950" : ""}`} title="Effects">
                        <Sparkles className="h-5 w-5" />
                    </button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); setProp((props: any) => { props.textEffect = props.textEffect === "lift" ? "none" : "lift"; }); }} className={toolbarButtonClass} title="Animate">
                        <Palette className="h-5 w-5" />
                    </button>
                    {toolbarDivider}
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); bringToFront(); }} className={`${toolbarButtonClass} bg-neutral-100 text-neutral-950 hover:bg-neutral-200`} title="Position">
                        <BringToFront className="h-5 w-5" />
                    </button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); copyStyleToClipboard(); }} className={toolbarButtonClass} title="Copy text style">
                        <PaintRoller className="h-5 w-5" />
                    </button>

                </div>,
                document.getElementById('text-toolbar-portal') || document.body
            )}
            {textShape === 'curve' && !editMode ? (
                <div
                    ref={containerRef}
                    onClick={() => enterEditMode("end")}
                    onDoubleClick={() => enterEditMode("all")}
                    style={{
                        width: "100%",
                        height: "100%",
                        color: color || "inherit",
                        fontWeight: bold ? "bold" : "normal",
                        fontStyle: italic ? "italic" : "normal",
                        fontSize: `calc(${fontSize}px * var(--scale-multiplier, 1))`
                    }}
                    className="relative flex items-center justify-center p-2 cursor-text"
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
                    ref={containerRef}
                        onClick={() => enterEditMode("end")}
                        onDoubleClick={() => enterEditMode("all")}
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
                    className={`relative p-2 ${editMode ? "ring-2 ring-sky-400 ring-offset-1 rounded-sm" : ""} cursor-text [&_p]:m-0`}
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