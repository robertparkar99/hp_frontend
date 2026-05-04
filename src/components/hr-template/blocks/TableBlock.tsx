"use client";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNode, useEditor } from "@craftjs/core";
import { useEditor as useTiptapEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { ArrowUpToLine, ArrowDownToLine, ArrowLeftToLine, ArrowRightToLine, Trash2, FoldVertical, Combine, Split } from "lucide-react";
import { BubbleMenu } from "@tiptap/react/menus";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import { Extension } from "@tiptap/core";
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    CaseSensitive,
    Italic,
    List,
    ListOrdered,
    Strikethrough,
    Underline as UnderlineIcon,
} from "lucide-react";
import { PositionControl } from "../editor/settings/PositionControl";
import { ColorPicker } from "../editor/settings/ColorPicker";
import { OverlayWrapper } from "../editor/settings/OverlayWrapper";
import {
    createStarterTableContent,
    migrateLegacyTablePropsToContent,
    isLegacyTableProps,
    normalizeTableContent,
} from "./tableUtils";

// ═══════════════════════════════════════════════════════════════════════
// DROPDOWN PRESETS
// ═══════════════════════════════════════════════════════════════════════

const DROPDOWN_PRESETS: Record<string, string[]> = {
    "Status": ["Pending", "In Progress", "Approved", "Rejected"],
    "Yes / No": ["Yes", "No"],
    "Gender": ["Male", "Female", "Other"],
    "Priority": ["Low", "Medium", "High", "Critical"],
    "Rating": ["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"],
};

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

// ═══════════════════════════════════════════════════════════════════════
// SHARED EDITOR REF — lets Settings panel access the Tiptap editor
// ═══════════════════════════════════════════════════════════════════════

// Registry: maps node id -> { editor, cellPos, listeners }
const tableEditorRegistry = new Map<string, {
    editor: any;
    cellPos: { row: number; col: number } | null;
    listeners: Set<() => void>;
}>();

function registrySet(id: string, editor: any) {
    const existing = tableEditorRegistry.get(id);
    if (existing) { existing.editor = editor; }
    else { tableEditorRegistry.set(id, { editor, cellPos: null, listeners: new Set() }); }
}
function registryUpdateCellPos(id: string, pos: { row: number; col: number } | null) {
    const entry = tableEditorRegistry.get(id);
    if (entry) { entry.cellPos = pos; entry.listeners.forEach(fn => fn()); }
}
function registrySubscribe(id: string, fn: () => void) {
    const entry = tableEditorRegistry.get(id);
    if (entry) { entry.listeners.add(fn); return () => { entry.listeners.delete(fn); }; }
    return () => {};
}

// ═══════════════════════════════════════════════════════════════════════
// TABLEBLOCK COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export const TableBlock = ({
    isOverlay, x, y, rotation = 0, zIndex,
    width = "540px", height,
    content, rows = 3, cols = 3, cellText,
    initialColWidths, initialRowHeights,
    fill = "#ffffff", stroke = "#d1d5db", strokeWidth = 1,
    headerRow = false, tableWidth = 540,
    cellMeta = {},
    colWidths,
}: any) => {
    const {
        connectors: { connect },
        actions: { setProp },
        selected, id,
    } = useNode((node) => ({ selected: node.events.selected }));

    const { query } = useEditor();

    const [editMode, setEditMode] = useState(false);
    const [hasTextSelection, setHasTextSelection] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // ── Column / row resize state (local during drag) ─────────────────
    const dragRef = useRef<{
        type: "col" | "row";
        index: number;
        startPos: number;
        startSizes: number[];
    } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // ── Cell meta (per-cell bg, dropdown config, etc.) ────────────────
    const cellMetaRef = useRef<Record<string, any>>(cellMeta || {});
    cellMetaRef.current = cellMeta || {};

    // ── Build initial content ─────────────────────────────────────────
    const initialContent = useMemo(() => {
        if (content) return normalizeTableContent(content, rows, cols);
        if (isLegacyTableProps({ rows, cols, cellText, content }))
            return migrateLegacyTablePropsToContent({ rows, cols, cellText });
        return createStarterTableContent(rows, cols, headerRow);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Tiptap editor ─────────────────────────────────────────────────
    const editor = useTiptapEditor({
        extensions: [
            StarterKit.configure({ heading: false }),
            Table.configure({
                resizable: false,
                allowTableNodeSelection: true,
                HTMLAttributes: { class: "tiptap-table" },
            }),
            TableRow,
            TableCell.configure({
                HTMLAttributes: { class: "tiptap-table-cell" },
            }),
            TableHeader.configure({
                HTMLAttributes: { class: "tiptap-table-header" },
            }),
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            Underline,
            Strike,
            FontFamily,
            FontSize,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
        ],
        content: initialContent,
        immediatelyRender: false,
        editable: editMode,
        onUpdate: ({ editor: ed }) => {
            const json = ed.getJSON();
            setProp((p: any) => { p.content = json; });
        },
        onSelectionUpdate: ({ editor: ed }) => {
            const pos = getCurrentCellPos(ed);
            registryUpdateCellPos(id, pos);
            setHasTextSelection(pos !== null && !ed.state.selection.empty);
        },
        editorProps: {
            attributes: { class: "tiptap-table-editor focus:outline-none" },
            handleKeyDown: (_view, event) => {
                if (event.key === "Escape") { setEditMode(false); return true; }
                return false;
            },
        },
    });

    // Register editor so Settings panel can access it
    useEffect(() => {
        if (editor) registrySet(id, editor);
        return () => { tableEditorRegistry.delete(id); };
    }, [editor, id]);

    // Sync editable
    useEffect(() => {
        if (!editor) return;
        editor.setEditable(editMode);
        if (editMode) setTimeout(() => editor.commands.focus(), 50);
    }, [editMode, editor]);

    // ── Text toolbar helpers ───────────────────────────────────────────
    const getToolbarFontSize = useCallback(() => {
        const activeSize = editor?.getAttributes("textStyle").fontSize;
        return activeSize ? parseFloat(activeSize) : 16;
    }, [editor]);

    const applyFontSize = useCallback((nextSize: number) => {
        if (!editor || Number.isNaN(nextSize)) return;
        const clampedSize = Math.max(4, Math.min(nextSize, 240));
        const roundedSize = Math.round(clampedSize * 10) / 10;
        editor.chain().focus().setFontSize(`${roundedSize}px`).run();
    }, [editor]);

    const setAlignment = useCallback((align: string) => {
        if (!editor) return;
        editor.chain().focus().setTextAlign(align).run();
    }, [editor]);

    const toggleTextCase = useCallback(() => {
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

    // Exit edit mode on deselect
    useEffect(() => { if (!selected && editMode) setEditMode(false); }, [selected, editMode]);

    // Click outside
    useEffect(() => {
        if (!editMode) return;
        const h = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setEditMode(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [editMode]);

    // Legacy migration
    const hasMigrated = useRef(false);
    useEffect(() => {
        if (hasMigrated.current) return;
        if (!content && isLegacyTableProps({ rows, cols, cellText, content })) {
            setProp((p: any) => { p.content = migrateLegacyTablePropsToContent({ rows, cols, cellText }); });
            hasMigrated.current = true;
        }
    }, [content, rows, cols, cellText, setProp]);

    // ── Helpers ───────────────────────────────────────────────────────
    const getZoom = useCallback(() => (window as any).__craft_zoom || 1, []);
    const parsedWidth = typeof width === "number" ? width : (parseInt(String(width)) || tableWidth || 540);

    const getTableEl = useCallback((): HTMLTableElement | null => {
        if (!containerRef.current) return null;
        return containerRef.current.querySelector("table.tiptap-table") as HTMLTableElement | null;
    }, []);

    // ── Apply per-cell meta (backgrounds, dropdown overlays) ──────────
    // Re-run whenever cellMeta prop changes
    useEffect(() => {
        const table = getTableEl();
        if (!table) return;
        const meta = cellMeta || {};
        for (let r = 0; r < table.rows.length; r++) {
            for (let c = 0; c < table.rows[r].cells.length; c++) {
                const key = `r${r}c${c}`;
                const cell = table.rows[r].cells[c];
                const m = meta[key];
                // Background
                if (m?.backgroundColor) {
                    cell.style.backgroundColor = m.backgroundColor;
                }
                // Dropdown indicator
                const old = cell.querySelector(".dd-tag");
                if (old) old.remove();
                if (m?.cellType === "dropdown" && m?.selectedValue) {
                    const tag = document.createElement("span");
                    tag.className = "dd-tag";
                    tag.style.cssText = "position:absolute;top:1px;right:3px;font-size:9px;background:#dbeafe;color:#1e40af;padding:0 5px;border-radius:3px;pointer-events:none;line-height:16px;";
                    tag.textContent = m.selectedValue;
                    cell.style.position = "relative";
                    cell.appendChild(tag);
                }
            }
        }
    }, [cellMeta, getTableEl]);

    // Also re-apply after editor re-renders (e.g. after adding rows/cols)
    useEffect(() => {
        if (!editor) return;
        const handler = () => {
            const table = getTableEl();
            if (!table) return;
            const meta = cellMeta || {};
            for (let r = 0; r < table.rows.length; r++) {
                for (let c = 0; c < table.rows[r].cells.length; c++) {
                    const key = `r${r}c${c}`;
                    const cell = table.rows[r].cells[c];
                    const m = meta[key];
                    if (m?.backgroundColor) { cell.style.backgroundColor = m.backgroundColor; }
                }
            }
        };
        editor.on('update', handler);
        return () => { editor.off('update', handler); };
    }, [editor, cellMeta, getTableEl]);

    // ── Column resize ─────────────────────────────────────────────────
    const handleColResizeDown = useCallback((colIndex: number, e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const table = getTableEl();
        if (!table || !table.rows[0]) return;
        const zoom = getZoom();
        const firstRow = table.rows[0];
        const sizes: number[] = [];
        for (let i = 0; i < firstRow.cells.length; i++) {
            sizes.push(firstRow.cells[i].getBoundingClientRect().width / zoom);
        }
        dragRef.current = { type: "col", index: colIndex, startPos: e.clientX, startSizes: sizes };
        setIsDragging(true);

        const onMove = (ev: PointerEvent) => {
            const d = dragRef.current;
            if (!d || d.type !== "col") return;
            const dx = (ev.clientX - d.startPos) / zoom;
            const newW = [...d.startSizes];
            newW[d.index] = Math.max(30, d.startSizes[d.index] + dx);
            if (d.index + 1 < newW.length) {
                newW[d.index + 1] = Math.max(30, d.startSizes[d.index + 1] - dx);
            }
            // Apply live
            let cg = table.querySelector("colgroup");
            if (!cg) { cg = document.createElement("colgroup"); table.prepend(cg); }
            cg.innerHTML = "";
            newW.forEach(w => { const c = document.createElement("col"); c.style.width = `${w}px`; cg!.appendChild(c); });
            table.style.tableLayout = "fixed";
            table.style.width = `${newW.reduce((a, b) => a + b, 0)}px`;
        };
        const onUp = () => {
            // Commit final widths
            const cg = table.querySelector("colgroup");
            if (cg) {
                const finalWidths: number[] = [];
                cg.querySelectorAll("col").forEach(c => { finalWidths.push(parseFloat(c.style.width) || 100); });
                const total = finalWidths.reduce((a, b) => a + b, 0);
                setProp((p: any) => {
                    p.colWidths = finalWidths;
                    p.width = `${Math.round(total)}px`;
                    p.tableWidth = Math.round(total);
                });
            }
            dragRef.current = null;
            setIsDragging(false);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    }, [getTableEl, getZoom, setProp]);

    // ── Row resize ────────────────────────────────────────────────────
    const handleRowResizeDown = useCallback((rowIndex: number, e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const table = getTableEl();
        if (!table || !table.rows[rowIndex]) return;
        const zoom = getZoom();
        const startH = table.rows[rowIndex].getBoundingClientRect().height / zoom;
        const startY = e.clientY;
        setIsDragging(true);

        const onMove = (ev: PointerEvent) => {
            const dy = (ev.clientY - startY) / zoom;
            const newH = Math.max(24, startH + dy);
            if (table.rows[rowIndex]) {
                table.rows[rowIndex].style.height = `${newH}px`;
                for (let c = 0; c < table.rows[rowIndex].cells.length; c++) {
                    table.rows[rowIndex].cells[c].style.height = `${newH}px`;
                }
            }
        };
        const onUp = () => {
            setIsDragging(false);
            // Trigger content save
            if (editor) {
                const json = editor.getJSON();
                setProp((p: any) => { p.content = json; });
            }
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    }, [getTableEl, getZoom, editor, setProp]);

    // ── Compute resize handle positions ───────────────────────────────
    const [handles, setHandles] = useState<{ cols: number[]; rows: number[] }>({ cols: [], rows: [] });

    const recomputeHandles = useCallback(() => {
        const table = getTableEl();
        if (!table || !editMode) { setHandles({ cols: [], rows: [] }); return; }
        const zoom = getZoom();
        const container = containerRef.current;
        if (!container) return;
        const cRect = container.getBoundingClientRect();

        // Columns: accumulate cell widths
        const colh: number[] = [];
        if (table.rows[0]) {
            let acc = 0;
            for (let i = 0; i < table.rows[0].cells.length - 1; i++) {
                acc += table.rows[0].cells[i].getBoundingClientRect().width / zoom;
                colh.push(acc);
            }
        }
        // Rows: bottom edge of each row except last
        const rowh: number[] = [];
        for (let i = 0; i < table.rows.length - 1; i++) {
            const rr = table.rows[i].getBoundingClientRect();
            rowh.push((rr.bottom - cRect.top) / zoom);
        }
        setHandles({ cols: colh, rows: rowh });
    }, [getTableEl, editMode, getZoom]);

    useEffect(() => { recomputeHandles(); }, [editMode, recomputeHandles]);
    // Also recompute after content changes
    useEffect(() => {
        if (!editMode) return;
        const t = setTimeout(recomputeHandles, 150);
        return () => clearTimeout(t);
    }, [editor?.state?.doc, editMode, recomputeHandles]);

    // Apply saved colWidths on mount
    useEffect(() => {
        if (!colWidths || !Array.isArray(colWidths)) return;
        const table = getTableEl();
        if (!table) return;
        let cg = table.querySelector("colgroup");
        if (!cg) { cg = document.createElement("colgroup"); table.prepend(cg); }
        cg.innerHTML = "";
        colWidths.forEach((w: number) => { const c = document.createElement("col"); c.style.width = `${w}px`; cg!.appendChild(c); });
        table.style.tableLayout = "fixed";
    }, [colWidths, getTableEl, editor?.state?.doc]);

    // ── Handlers ──────────────────────────────────────────────────────
    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setEditMode(true);
    }, []);

    // ── Dynamic CSS ───────────────────────────────────────────────────
    const tableCSS = useMemo(() => `
        .tiptap-table-editor .tiptap-table {
            border-collapse: collapse;
            width: 100%;
            table-layout: fixed;
        }
        .tiptap-table-editor .tiptap-table-cell,
        .tiptap-table-editor .tiptap-table-header {
            border: ${strokeWidth}px solid ${stroke};
            padding: 6px 8px;
            vertical-align: top;
            min-width: 30px;
            position: relative;
        }
        .tiptap-table-editor .tiptap-table-header {
            background-color: ${fill === "#ffffff" ? "#f1f5f9" : fill};
            font-weight: 600;
        }
        .tiptap-table-editor .tiptap-table-cell {
            background-color: ${fill};
        }
        .tiptap-table-editor p { margin: 0; min-height: 1.2em; }
        .tiptap-table-editor .ProseMirror { outline: none; }
        .tiptap-table-editor .ProseMirror-focused .tiptap-table-cell.is-selected,
        .tiptap-table-editor .ProseMirror-focused .tiptap-table-header.is-selected {
            background-color: rgba(14, 165, 233, 0.12);
        }
        /* Selected cells for merge - make it visible */
        .tiptap-table-editor .selectedCell::after {
            content: "";
            position: absolute;
            inset: 0;
            background: rgba(14, 165, 233, 0.12);
            pointer-events: none;
        }
    `, [stroke, strokeWidth, fill]);

    // ══════════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════════
    return (
        <OverlayWrapper
            isOverlay={isOverlay} x={x} y={y}
            width={`${parsedWidth}px`} height="auto"
            rotation={rotation} zIndex={zIndex}
            isText={true} noResize={true}
        >
            <div
                ref={containerRef}
                onDoubleClick={handleDoubleClick}
                className={`relative ${editMode ? "ring-2 ring-sky-400/60 ring-offset-1" : ""}`}
                style={{
                    width: parsedWidth, minHeight: 40,
                    cursor: editMode ? "text" : "default",
                    pointerEvents: editMode ? "auto" : undefined,
                }}
            >
                <style>{tableCSS}</style>
                {editor && <EditorContent editor={editor} />}

                {/* Edit mode indicator */}
                {editMode && (
                    <div className="absolute -top-6 left-0 bg-sky-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-t-md shadow-sm z-50 pointer-events-none select-none">
                        Editing Table • Esc to exit
                    </div>
                )}

                {/* ── Column resize handles ────────────────────── */}
                {editMode && !isDragging && handles.cols.map((leftPx, i) => (
                    <div
                        key={`ch-${i}`}
                        style={{ position: "absolute", left: leftPx - 3, top: 0, bottom: 0, width: 6, cursor: "col-resize", zIndex: 40 }}
                        onPointerDown={(e) => handleColResizeDown(i, e)}
                    >
                        <div style={{ width: 2, height: "100%", margin: "0 auto", background: "transparent", transition: "background .15s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#38bdf8")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        />
                    </div>
                ))}

                {/* ── Row resize handles ────────────────────────── */}
                {editMode && !isDragging && handles.rows.map((topPx, i) => (
                    <div
                        key={`rh-${i}`}
                        style={{ position: "absolute", top: topPx - 3, left: 0, right: 0, height: 6, cursor: "row-resize", zIndex: 40 }}
                        onPointerDown={(e) => handleRowResizeDown(i, e)}
                    >
                        <div style={{ height: 2, width: "100%", margin: "auto 0", background: "transparent", transition: "background .15s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#38bdf8")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        />
                    </div>
                ))}

                {/* ── Compact inline toolbar (structure only) ───── */}
                {editMode && editor && (
                    <div
                        className="absolute -bottom-8 left-0 right-0 flex items-center gap-0.5 bg-white border border-neutral-200 rounded-b-lg shadow-lg px-1 py-0.5 z-50"
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        {[
                            { label: "↑Row", fn: () => editor.chain().focus().addRowBefore().run() },
                            { label: "↓Row", fn: () => editor.chain().focus().addRowAfter().run() },
                            { label: "←Col", fn: () => editor.chain().focus().addColumnBefore().run() },
                            { label: "→Col", fn: () => editor.chain().focus().addColumnAfter().run() },
                        ].map((a) => (
                            <button key={a.label} className="px-1.5 py-0.5 text-[10px] font-medium rounded hover:bg-sky-100 text-neutral-700 whitespace-nowrap" onClick={a.fn}>{a.label}</button>
                        ))}
                        <div className="w-px h-3.5 bg-neutral-200" />
                        <button className="px-1.5 py-0.5 text-[10px] font-medium rounded text-red-600 hover:bg-red-50 whitespace-nowrap" onClick={() => editor.chain().focus().deleteRow().run()}>✕Row</button>
                        <button className="px-1.5 py-0.5 text-[10px] font-medium rounded text-red-600 hover:bg-red-50 whitespace-nowrap" onClick={() => editor.chain().focus().deleteColumn().run()}>✕Col</button>
                        <div className="w-px h-3.5 bg-neutral-200" />
                        <button className="px-1.5 py-0.5 text-[10px] font-medium rounded hover:bg-sky-100 text-neutral-700 whitespace-nowrap" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>Header</button>
                        <button className="px-1.5 py-0.5 text-[10px] font-medium rounded hover:bg-sky-100 text-neutral-700 whitespace-nowrap" onClick={() => editor.chain().focus().mergeCells().run()} title="Select cells first (Shift+Click or drag), then merge">Merge</button>
                        <button className="px-1.5 py-0.5 text-[10px] font-medium rounded hover:bg-sky-100 text-neutral-700 whitespace-nowrap" onClick={() => editor.chain().focus().splitCell().run()}>Split</button>
                    </div>
                )}

                {/* ── Text formatting toolbar ───────────────────────────── */}
                {editMode && hasTextSelection && editor && (
                    <BubbleMenu editor={editor}>
                        <div
                            className="flex flex-nowrap items-center gap-0 bg-white border border-neutral-200 rounded-xl shadow-[0_8px_24px_-14px_rgba(15,23,42,0.45)] ring-1 ring-black/[0.02] pointer-events-auto overflow-x-auto overflow-y-hidden h-14 w-max max-w-[90vw] md:max-w-[700px] px-2 text-neutral-950 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sky-200 [&::-webkit-scrollbar-thumb]:rounded-full"
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <div className="flex h-9 items-center gap-0.5 px-1">
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

                            <div className="flex h-9 items-center gap-0.5 px-1 rounded-lg border border-neutral-200 bg-white">
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); applyFontSize(getToolbarFontSize() - 1); }} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-neutral-100 text-neutral-700 hover:text-neutral-950 font-bold transition-colors">-</button>
                                <input type="number" step="0.1" onMouseDown={(e) => e.stopPropagation()} className="w-11 h-7 text-[14px] text-center font-semibold border-0 outline-none bg-transparent rounded transition-colors" value={getToolbarFontSize()} onChange={(e) => { if (e.target.value) applyFontSize(Number(e.target.value)); }} />
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); applyFontSize(getToolbarFontSize() + 1); }} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-neutral-100 text-neutral-700 hover:text-neutral-950 font-bold transition-colors">+</button>
                            </div>

                            <div className="flex h-9 items-center gap-0.5 px-1">
                                <div className="relative flex items-center justify-center h-9 min-w-9 rounded-lg hover:bg-neutral-100 cursor-pointer overflow-hidden transition-colors group" title="Text Color">
                                    <span className="font-bold text-neutral-800 text-[15px] pointer-events-none pb-1 border-b-4 group-hover:border-b-8 transition-all" style={{ borderColor: editor.getAttributes("textStyle").color || "#000000" }}>A</span>
                                    <input type="color" onMouseDown={(e) => e.stopPropagation()} onChange={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()} value={editor.getAttributes("textStyle").color || "#000000"} className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 opacity-0 cursor-pointer" />
                                </div>
                            </div>

                            <div className="flex h-9 items-center gap-0.5 px-1">
                                <div className="relative flex items-center justify-center h-9 min-w-9 rounded-lg hover:bg-neutral-100 cursor-pointer overflow-hidden transition-colors group" title="Highlight Color">
                                    <span className="font-bold text-neutral-800 text-xs pointer-events-none pb-1 border-b-4 group-hover:border-b-8 transition-all" style={{ borderColor: editor.getAttributes("highlight").color || "transparent", backgroundColor: editor.getAttributes("highlight").color || "transparent" }}>H</span>
                                    <input type="color" onMouseDown={(e) => e.stopPropagation()} onChange={(e) => editor.chain().focus().setMark('highlight', { color: (e.target as HTMLInputElement).value }).run()} value={editor.getAttributes("highlight").color || "#ffff00"} className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 opacity-0 cursor-pointer" />
                                </div>
                            </div>

                            <div className="flex h-9 items-center gap-0.5 px-1">
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }} className={`h-9 min-w-9 inline-flex items-center justify-center rounded-lg px-2 text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition-colors ${editor.isActive("bold") ? "bg-[#111827] hover:scale-105 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_2px_10px_rgba(14,165,233,0.3)" : ""}`} title="Bold"><Bold className="h-5 w-5" /></button>
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }} className={`h-9 min-w-9 inline-flex items-center justify-center rounded-lg px-2 text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition-colors ${editor.isActive("italic") ? "bg-[#111827] hover:scale-105 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_2px_10px_rgba(14,165,233,0.3)" : ""}`} title="Italic"><Italic className="h-5 w-5" /></button>
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }} className={`h-9 min-w-9 inline-flex items-center justify-center rounded-lg px-2 text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition-colors ${editor.isActive("underline") ? "bg-[#111827] hover:scale-105 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_2px_10px_rgba(14,165,233,0.3)" : ""}`} title="Underline"><UnderlineIcon className="h-5 w-5" /></button>
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }} className={`h-9 min-w-9 inline-flex items-center justify-center rounded-lg px-2 text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition-colors ${editor.isActive("strike") ? "bg-[#111827] hover:scale-105 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_2px_10px_rgba(14,165,233,0.3)" : ""}`} title="Strikethrough"><Strikethrough className="h-5 w-5" /></button>
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); toggleTextCase(); }} className="h-9 min-w-9 inline-flex items-center justify-center rounded-lg px-2 text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition-colors" title="Toggle case"><CaseSensitive className="h-5 w-5" /></button>
                            </div>

                            <div className="flex h-9 items-center gap-0.5 px-1">
                                {[
                                    { id: 'left', icon: AlignLeft },
                                    { id: 'center', icon: AlignCenter },
                                    { id: 'right', icon: AlignRight },
                                ].map(({ id: align, icon: Icon }) => (
                                    <button key={align} type="button" onMouseDown={(e) => { e.preventDefault(); setAlignment(align); }} className={`h-9 min-w-9 inline-flex items-center justify-center rounded-lg px-2 text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition-colors ${editor.isActive({ textAlign: align }) ? "bg-[#111827] hover:scale-105 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_2px_10px_rgba(14,165,233,0.3)" : ""}`} title={`Align ${align}`}>
                                        <Icon className="h-5 w-5" />
                                    </button>
                                ))}
                            </div>

                            <div className="flex h-9 items-center gap-0.5 px-1">
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }} className={`h-9 min-w-9 inline-flex items-center justify-center rounded-lg px-2 text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition-colors ${editor.isActive("bulletList") ? "bg-[#111827] hover:scale-105 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_2px_10px_rgba(14,165,233,0.3)" : ""}`} title="Bullet list">
                                    <List className="h-5 w-5" />
                                </button>
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }} className={`h-9 min-w-9 inline-flex items-center justify-center rounded-lg px-2 text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition-colors ${editor.isActive("orderedList") ? "bg-[#111827] hover:scale-105 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_2px_10px_rgba(14,165,233,0.3)" : ""}`} title="Numbered list">
                                    <ListOrdered className="h-5 w-5" />
                                </button>
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }} className={`h-9 min-w-9 inline-flex items-center justify-center rounded-lg px-2 text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 transition-colors ${editor.isActive("blockquote") ? "bg-[#111827] hover:scale-105 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_2px_10px_rgba(14,165,233,0.3)" : ""}`} title="Quote">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path></svg>
                                </button>
                            </div>
                        </div>
                    </BubbleMenu>
                )}
            </div>
        </OverlayWrapper>
    );
};

// ═══════════════════════════════════════════════════════════════════════
// GET CURRENT CELL POSITION HELPER
// ═══════════════════════════════════════════════════════════════════════

function getCurrentCellPos(editor: any): { row: number; col: number } | null {
    if (!editor) return null;
    const { state } = editor;
    const { $anchor } = state.selection;
    for (let d = $anchor.depth; d > 0; d--) {
        const node = $anchor.node(d);
        if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
            const rowNode = $anchor.node(d - 1);
            if (rowNode?.type?.name !== "tableRow") continue;
            // Column index
            const cellStart = $anchor.start(d);
            const rowStart = $anchor.start(d - 1);
            let col = 0, pos = rowStart + 1;
            rowNode.forEach((child: any) => { if (pos < cellStart) col++; pos += child.nodeSize; });
            // Row index
            const tableNode = $anchor.node(d - 2);
            if (!tableNode) continue;
            const rowDepthStart = $anchor.start(d - 1);
            const tableStart = $anchor.start(d - 2);
            let row = 0, rPos = tableStart + 1;
            tableNode.forEach((child: any) => { if (rPos < rowDepthStart) row++; rPos += child.nodeSize; });
            return { row, col };
        }
    }
    return null;
}

// ═══════════════════════════════════════════════════════════════════════
// SETTINGS PANEL — all advanced controls live here
// ═══════════════════════════════════════════════════════════════════════

export const TableBlockSettings = ({ isDesignTab }: { isDesignTab?: boolean }) => {
    const { actions: { setProp }, props, id } = useNode((node) => ({
        props: node.data.props, id: node.id,
    }));

    const [cellMetaLocal, setCellMetaLocal] = useState<Record<string, any>>(props.cellMeta || {});
    const [dropdownPanel, setDropdownPanel] = useState(false);
    const [ddOptions, setDdOptions] = useState<string[]>([]);
    const [ddNewOpt, setDdNewOpt] = useState("");

    // Reactively track which cell the user has selected
    const [currentKey, setCurrentKey] = useState<string | null>(null);
    const [cellPos, setCellPos] = useState<{ row: number; col: number } | null>(null);

    // Get the tiptap editor for this table
    const entry = tableEditorRegistry.get(id);
    const editor = entry?.editor || null;

    // Subscribe to cell position changes from the editor
    useEffect(() => {
        const updatePos = () => {
            const e = tableEditorRegistry.get(id);
            if (e?.cellPos) {
                setCellPos(e.cellPos);
                setCurrentKey(`r${e.cellPos.row}c${e.cellPos.col}`);
            } else {
                setCellPos(null);
                setCurrentKey(null);
            }
        };
        updatePos(); // initial
        const unsub = registrySubscribe(id, updatePos);
        return unsub;
    }, [id]);

    // Sync local cellMeta from props
    useEffect(() => { setCellMetaLocal(props.cellMeta || {}); }, [props.cellMeta]);

    const updateCellMeta = useCallback((key: string, update: Record<string, any>) => {
        setCellMetaLocal((prev: any) => {
            const next = { ...prev, [key]: { ...(prev[key] || {}), ...update } };
            queueMicrotask(() => setProp((p: any) => { p.cellMeta = next; }));
            return next;
        });
    }, [setProp]);

    // ── Content Tab ───────────────────────────────────────────────────
    if (!isDesignTab) {
        return (
            <div className="flex flex-col space-y-4">
                <p className="text-sm text-muted-foreground bg-sky-50 text-sky-700 p-2 rounded">
                    {editor ? "Select a cell to style it or configure dropdowns (scroll down)." : "Double-click the table on the canvas to enter edit mode."}
                </p>

                {/* Table width */}
                <div className="flex flex-col space-y-1">
                    <label className="text-xs font-medium text-neutral-600">Table Width (px)</label>
                    <input type="number" min={100} max={780} step={10}
                        value={parseInt(String(props.width)) || props.tableWidth || 540}
                        onChange={(e) => {
                            const w = Math.max(100, Math.min(780, parseInt(e.target.value) || 540));
                            setProp((p: any) => { p.width = `${w}px`; p.tableWidth = w; });
                        }}
                        className="border rounded px-2 py-1.5 text-sm w-full"
                    />
                </div>

                {/* Header row */}
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="headerRowToggle" checked={props.headerRow || false}
                        onChange={(e) => setProp((p: any) => p.headerRow = e.target.checked)}
                        className="accent-sky-500"
                    />
                    <label htmlFor="headerRowToggle" className="text-xs text-neutral-600">Header Row</label>
                </div>

                {/* ── STRUCTURE PANEL ──────────────────────────── */}
                <div className="border-t pt-3">
                    <div className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-2">Table Structure</div>
                    <div className="grid grid-cols-2 gap-2">
                        {editor ? (
                            <>
                                <SBtn icon={ArrowUpToLine} onClick={() => editor.chain().focus().addRowBefore().run()}>Add Row Above</SBtn>
                                <SBtn icon={ArrowDownToLine} onClick={() => editor.chain().focus().addRowAfter().run()}>Add Row Below</SBtn>
                                <SBtn icon={ArrowLeftToLine} onClick={() => editor.chain().focus().addColumnBefore().run()}>Add Col Left</SBtn>
                                <SBtn icon={ArrowRightToLine} onClick={() => editor.chain().focus().addColumnAfter().run()}>Add Col Right</SBtn>
                                <SBtn icon={Trash2} onClick={() => editor.chain().focus().deleteRow().run()} danger>Delete Row</SBtn>
                                <SBtn icon={Trash2} onClick={() => editor.chain().focus().deleteColumn().run()} danger>Delete Col</SBtn>
                                <SBtn icon={FoldVertical} onClick={() => editor.chain().focus().toggleHeaderRow().run()}>Toggle Header</SBtn>
                            </>
                        ) : (
                            <p className="text-[10px] text-neutral-400 col-span-2">Enter edit mode to use structure controls</p>
                        )}
                    </div>
                </div>

                {/* ── MERGE / SPLIT ────────────────────────────── */}
                <div className="border-t pt-3">
                    <div className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-2">Merge / Split</div>
                    <p className="text-[10px] text-neutral-400 mb-1.5">
                        To merge: click a cell, hold Shift and click another cell to select a range, then click Merge.
                    </p>
                    <div className="flex gap-2">
                        {editor ? (
                            <>
                                <SBtn icon={Combine} onClick={() => editor.chain().focus().mergeCells().run()}>Merge Cells</SBtn>
                                <SBtn icon={Split} onClick={() => editor.chain().focus().splitCell().run()}>Split Cell</SBtn>
                            </>
                        ) : (
                            <p className="text-[10px] text-neutral-400">Enter edit mode first</p>
                        )}
                    </div>
                </div>

                {/* ── PER-CELL BACKGROUND ──────────────────────── */}
                <div className="border-t pt-3">
                    <div className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-2">Cell Background Color</div>
                    {currentKey ? (
                        <div className="space-y-1">
                            <p className="text-[10px] text-neutral-500">Cell: Row {cellPos!.row + 1}, Col {cellPos!.col + 1}</p>
                            <CellColorPicker
                                color={cellMetaLocal[currentKey]?.backgroundColor || "#ffffff"}
                                onChange={(c) => updateCellMeta(currentKey!, { backgroundColor: c })}
                            />
                            <div className="mt-2">
                                <SBtn icon={Trash2} onClick={() => updateCellMeta(currentKey!, { backgroundColor: undefined })} danger>Clear Color</SBtn>
                            </div>
                        </div>
                    ) : (
                        <p className="text-[10px] text-neutral-400">Click a cell in edit mode to select it, then choose a color.</p>
                    )}
                </div>

                {/* ── DROPDOWN / OPTION CELL ───────────────────── */}
                <div className="border-t pt-3">
                    <div className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-2">Dropdown Cell</div>
                    {currentKey ? (
                        <div className="space-y-2">
                            <p className="text-[10px] text-neutral-500">Cell: Row {cellPos!.row + 1}, Col {cellPos!.col + 1}</p>
                            <div className="flex gap-1">
                                <button
                                    className={`flex-1 py-1.5 text-[11px] font-medium rounded border transition-colors ${(!cellMetaLocal[currentKey]?.cellType || cellMetaLocal[currentKey]?.cellType === "text") ? "bg-sky-50 border-sky-300 text-sky-700" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}
                                    onClick={() => updateCellMeta(currentKey!, { cellType: "text", dropdownOptions: undefined, selectedValue: undefined })}
                                >📝 Text</button>
                                <button
                                    className={`flex-1 py-1.5 text-[11px] font-medium rounded border transition-colors ${cellMetaLocal[currentKey]?.cellType === "dropdown" ? "bg-sky-50 border-sky-300 text-sky-700" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}
                                    onClick={() => {
                                        updateCellMeta(currentKey!, { cellType: "dropdown" });
                                        setDdOptions(cellMetaLocal[currentKey]?.dropdownOptions || []);
                                        setDropdownPanel(true);
                                    }}
                                >📋 Dropdown</button>
                            </div>

                            {/* Dropdown config inline */}
                            {cellMetaLocal[currentKey]?.cellType === "dropdown" && (
                                <div className="bg-sky-50/50 border border-sky-100 rounded-lg p-2 space-y-2">
                                    {/* Presets */}
                                    <div>
                                        <span className="text-[10px] text-neutral-400">Presets:</span>
                                        <div className="flex flex-wrap gap-1 mt-0.5">
                                            {Object.entries(DROPDOWN_PRESETS).map(([name, opts]) => (
                                                <button key={name}
                                                    className="px-2 py-0.5 text-[10px] bg-white border border-neutral-200 rounded hover:bg-sky-50 hover:border-sky-300"
                                                    onClick={() => {
                                                        const o = opts as string[];
                                                        setDdOptions(o);
                                                        updateCellMeta(currentKey!, { dropdownOptions: o });
                                                    }}
                                                >{name}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Current options */}
                                    <div>
                                        <span className="text-[10px] text-neutral-400">Options:</span>
                                        {(cellMetaLocal[currentKey]?.dropdownOptions || []).map((opt: string, i: number) => (
                                            <div key={i} className="flex items-center gap-1 mt-0.5">
                                                <span className="flex-1 text-xs bg-white border border-neutral-100 rounded px-2 py-0.5">{opt}</span>
                                                <button className="text-red-400 hover:text-red-600 text-xs" onClick={() => {
                                                    const newOpts = (cellMetaLocal[currentKey]?.dropdownOptions || []).filter((_: any, idx: number) => idx !== i);
                                                    updateCellMeta(currentKey!, { dropdownOptions: newOpts });
                                                    setDdOptions(newOpts);
                                                }}>✕</button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add option */}
                                    <div className="flex gap-1">
                                        <input type="text" value={ddNewOpt} onChange={(e) => setDdNewOpt(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === "Enter" && ddNewOpt.trim()) {
                                                const newOpts = [...(cellMetaLocal[currentKey]?.dropdownOptions || []), ddNewOpt.trim()];
                                                updateCellMeta(currentKey!, { dropdownOptions: newOpts });
                                                setDdOptions(newOpts);
                                                setDdNewOpt("");
                                            }}}
                                            placeholder="Add option..."
                                            className="flex-1 text-xs border border-neutral-200 rounded px-2 py-1 focus:outline-none focus:border-sky-400"
                                        />
                                        <button className="px-2 py-1 text-xs bg-sky-500 text-white rounded hover:bg-sky-600"
                                            onClick={() => {
                                                if (!ddNewOpt.trim()) return;
                                                const newOpts = [...(cellMetaLocal[currentKey]?.dropdownOptions || []), ddNewOpt.trim()];
                                                updateCellMeta(currentKey!, { dropdownOptions: newOpts });
                                                setDdOptions(newOpts);
                                                setDdNewOpt("");
                                            }}
                                        >Add</button>
                                    </div>

                                    {/* Select value */}
                                    {(cellMetaLocal[currentKey]?.dropdownOptions?.length > 0) && (
                                        <div>
                                            <span className="text-[10px] text-neutral-400">Selected value:</span>
                                            <div className="flex flex-wrap gap-1 mt-0.5">
                                                {cellMetaLocal[currentKey]?.dropdownOptions.map((opt: string, i: number) => (
                                                    <button key={i}
                                                        className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${cellMetaLocal[currentKey]?.selectedValue === opt
                                                            ? "bg-sky-500 text-white border-sky-500"
                                                            : "bg-white text-neutral-600 border-neutral-200 hover:border-sky-300"}`}
                                                        onClick={() => updateCellMeta(currentKey!, { selectedValue: opt })}
                                                    >{opt}</button>
                                                ))}
                                                <button className="px-1.5 py-0.5 text-[10px] text-neutral-400 hover:text-red-500" title="Clear"
                                                    onClick={() => updateCellMeta(currentKey!, { selectedValue: undefined })}
                                                >✕</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-[10px] text-neutral-400">Click a cell in edit mode to configure dropdown options.</p>
                    )}
                </div>
            </div>
        );
    }

    // ── Design Tab ─────────────────────────────────────────────────────
    return (
        <div className="flex flex-col space-y-6">
            <PositionControl
                isOverlay={props.isOverlay}
                x={props.x} y={props.y} zIndex={props.zIndex}
                onChange={(prop, val) => setProp((p: any) => p[prop] = val)}
            />
            <ColorPicker label="Default Cell Background" color={props.fill}
                onChange={(color) => setProp((p: any) => p.fill = color)} />
            <ColorPicker label="Border Color" color={props.stroke}
                onChange={(color) => setProp((p: any) => p.stroke = color)} />
            <div className="flex flex-col space-y-1">
                <label className="text-xs text-muted-foreground">Border Width</label>
                <input type="range" min="0" max="4" value={props.strokeWidth || 1}
                    onChange={(e) => setProp((p: any) => p.strokeWidth = parseInt(e.target.value))}
                    className="w-full accent-primary" />
                <span className="text-[10px] text-neutral-400 text-right">{props.strokeWidth || 1}px</span>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════
// CELL COLOR PICKER — dynamic, uses native input type=color + text input
// ═══════════════════════════════════════════════════════════════════════

function CellColorPicker({ color, onChange }: { color: string; onChange: (c: string) => void }) {
    const [localColor, setLocalColor] = useState(color || "#ffffff");

    useEffect(() => { setLocalColor(color || "#ffffff"); }, [color]);

    return (
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={localColor.startsWith("rgba") ? "#ffffff" : localColor}
                onChange={(e) => { setLocalColor(e.target.value); onChange(e.target.value); }}
                className="w-8 h-8 rounded border border-neutral-200 cursor-pointer p-0"
                title="Pick any color"
            />
            <input
                type="text"
                value={localColor}
                onChange={(e) => { setLocalColor(e.target.value); onChange(e.target.value); }}
                className="flex-1 text-xs border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-sky-400"
                placeholder="#ffffff"
            />
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════
// SETTINGS PANEL BUTTON HELPER
// ═══════════════════════════════════════════════════════════════════════

function SBtn({ children, onClick, danger, icon: Icon }: { children: React.ReactNode; onClick: () => void; danger?: boolean; icon?: any }) {
    return (
        <button
            className={`flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium rounded-md border shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${danger
                ? "border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 focus:ring-red-200"
                : "border-neutral-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-sky-300 hover:text-sky-700 focus:ring-sky-100"
            }`}
            onClick={onClick}
        >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {children}
        </button>
    );
}

// ═══════════════════════════════════════════════════════════════════════
// CRAFT.JS REGISTRATION
// ═══════════════════════════════════════════════════════════════════════

TableBlock.craft = {
    displayName: "Table",
    props: {
        isOverlay: true,
        x: 80, y: 80, zIndex: 10,
        width: "540px", rotation: 0,
        content: null,
        rows: 3, cols: 3, cellText: {},
        fill: "#ffffff", stroke: "#d1d5db", strokeWidth: 1,
        headerRow: false, tableWidth: 540,
        cellMeta: {},
        colWidths: null,
    },
    related: {
        settings: TableBlockSettings,
    },
};
