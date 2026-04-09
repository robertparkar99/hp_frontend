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
    } = useNode();

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
        editable: false, // Start non-editable; only enabled on double-click
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

    // ── Enter edit mode on double-click ──
    const handleDoubleClick = React.useCallback(() => {
        if (!editor) return;
        setEditMode(true);
        editor.setEditable(true);
        // Small delay to let editable state propagate before focusing
        requestAnimationFrame(() => {
            editor.commands.focus('end');
        });
    }, [editor]);

    // ── Register editor with Top Contextual Bar ──
    React.useEffect(() => {
        if (editMode && editor) {
            window.dispatchEvent(new CustomEvent("set-active-editor", { detail: { editor } }));
        } else {
            window.dispatchEvent(new CustomEvent("clear-active-editor"));
        }
        return () => {
            window.dispatchEvent(new CustomEvent("clear-active-editor"));
        };
    }, [editMode, editor]);

    // ── Exit edit mode via custom event (e.g., from the top toolbar) ──
    React.useEffect(() => {
        const handleExit = () => {
            setEditMode(false);
            if (editor) editor.setEditable(false);
        };
        window.addEventListener('exit-text-edit-mode', handleExit);
        return () => window.removeEventListener('exit-text-edit-mode', handleExit);
    }, [editor]);

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

            {textShape === 'curve' && !editMode ? (
                <div
                    ref={containerRef}
                    onDoubleClick={handleDoubleClick}
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
                    onDoubleClick={handleDoubleClick}
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
