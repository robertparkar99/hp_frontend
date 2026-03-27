"use client";
import React, { useState, useRef, useEffect } from "react";
import { useNode, Element } from "@craftjs/core";
import { PositionControl } from "../editor/settings/PositionControl";
import { ColorPicker } from "../editor/settings/ColorPicker";
import { OverlayWrapper } from "../editor/settings/OverlayWrapper";
import { ContainerBlock } from "./ContainerBlock";
import { TextBlock } from "./TextBlock";

export const TableBlock = ({
    isOverlay,
    x,
    y,
    rotation = 0,
    zIndex,
    width,
    height,
    rows = 3,
    cols = 3,
    fill = "#ffffff",
    stroke = "#e5e7eb",
    strokeWidth = 1,
    initialColWidths,
    initialRowHeights,
}: any) => {
    const { connectors: { connect }, actions: { setProp } } = useNode();
    const tableRef = useRef<HTMLDivElement>(null);
    const [editingCell, setEditingCell] = useState<string | null>(null);
    const [cellText, setCellText] = useState<Record<string, string>>({});

    // Provide default sizes if none exist
    const [colWidths, setColWidths] = useState<number[]>(initialColWidths || Array(cols).fill(120));
    const [rowHeights, setRowHeights] = useState<number[]>(initialRowHeights || Array(rows).fill(40));

    // Persist changes to craft props when they stabilize
    useEffect(() => {
        setProp((p: any) => p.initialColWidths = colWidths);
    }, [colWidths, setProp]);

    useEffect(() => {
        setProp((p: any) => p.initialRowHeights = rowHeights);
    }, [rowHeights, setProp]);

    // Resizing state
    const [resizingCol, setResizingCol] = useState<{ index: number, startX: number, startWidth: number } | null>(null);
    const [resizingRow, setResizingRow] = useState<{ index: number, startY: number, startHeight: number } | null>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (resizingCol !== null) {
                const diff = e.clientX - resizingCol.startX;
                setColWidths(prev => {
                    const next = [...prev];
                    next[resizingCol.index] = Math.max(40, resizingCol.startWidth + diff);
                    return next;
                });
            } else if (resizingRow !== null) {
                const diff = e.clientY - resizingRow.startY;
                setRowHeights(prev => {
                    const next = [...prev];
                    next[resizingRow.index] = Math.max(30, resizingRow.startHeight + diff);
                    return next;
                });
            }
        };

        const handleMouseUp = () => {
            setResizingCol(null);
            setResizingRow(null);
        };

        if (resizingCol !== null || resizingRow !== null) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizingCol, resizingRow]);

    const totalWidth = colWidths.reduce((a, b) => a + b, 0);
    const totalHeight = rowHeights.reduce((a, b) => a + b, 0);

    return (
        <OverlayWrapper isOverlay={isOverlay} x={x} y={y} width={totalWidth} height={totalHeight} rotation={rotation} zIndex={zIndex}>
            <div
                ref={tableRef}
                className="relative bg-white shadow-sm font-sans text-sm"
                style={{
                    backgroundColor: fill,
                    borderTop: `${strokeWidth}px solid ${stroke}`,
                    borderLeft: `${strokeWidth}px solid ${stroke}`,
                    width: totalWidth,
                    height: totalHeight,
                }}
            >
                {/* Cells Render */}
                {rowHeights.map((rH, rId) => (
                    <div key={`row-${rId}`} className="flex" style={{ height: rH }}>
                        {colWidths.map((cW, cId) => {
                            const cellId = `cell-${rId}-${cId}`;
                            const isEditing = editingCell === cellId;
                            const currentText = cellText[cellId] || '';

                            return (
                            <div
                                    key={cellId}
                                className="relative flex items-center justify-center p-2"
                                style={{
                                    width: cW,
                                    borderRight: `${strokeWidth}px solid ${stroke}`,
                                    borderBottom: `${strokeWidth}px solid ${stroke}`,
                                }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isEditing) {
                                            setEditingCell(cellId);
                                        }
                                    }}
                            >
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={currentText}
                                            onChange={(e) => setCellText({ ...cellText, [cellId]: e.target.value })}
                                            onBlur={() => {
                                                setEditingCell(null);
                                                // Save text to props
                                                setProp((p: any) => {
                                                    if (!p.cellText) p.cellText = {};
                                                    p.cellText[cellId] = currentText;
                                                });
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    setEditingCell(null);
                                                    setProp((p: any) => {
                                                        if (!p.cellText) p.cellText = {};
                                                        p.cellText[cellId] = currentText;
                                                    });
                                                }
                                                if (e.key === 'Escape') {
                                                    setEditingCell(null);
                                                }
                                            }}
                                            autoFocus
                                            className="w-full h-full px-1 py-0.5 text-sm border border-sky-500 rounded outline-none bg-white"
                                            placeholder="Type..."
                                        />
                                    ) : (
                                        <>
                                            <span className={`text-sm text-neutral-700 ${currentText ? '' : 'text-neutral-400 italic'}`}>
                                                {currentText || 'Click to edit'}
                                            </span>
                                            <Element id={cellId} is={ContainerBlock} canvas width="100%" height="100%" />
                                        </>
                                    )}

                                {/* Column Resize Handle (Right edge) */}
                                {cId < cols - 1 && (
                                    <div
                                        className="absolute right-0 top-0 bottom-0 w-2 translate-x-1/2 cursor-col-resize z-10 hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            setResizingCol({ index: cId, startX: e.clientX, startWidth: cW });
                                        }}
                                    />
                                )}

                                {/* Row Resize Handle (Bottom edge) */}
                                {rId < rows - 1 && (
                                    <div
                                        className="absolute left-0 right-0 bottom-0 h-2 translate-y-1/2 cursor-row-resize z-10 hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            setResizingRow({ index: rId, startY: e.clientY, startHeight: rH });
                                        }}
                                    />
                                )}
                            </div>
                            )
                        })}
                    </div>
                ))}
            </div>
        </OverlayWrapper>
    );
};

export const TableBlockSettings = ({ isDesignTab }: { isDesignTab?: boolean }) => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));

    if (!isDesignTab) {
        return (
            <div className="flex flex-col space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                    Settings for the Table grid. You can drag the borders to resize rows and columns.
                </p>
                <div className="flex flex-col space-y-1">
                    <label className="text-xs text-muted-foreground">Rows</label>
                    <input type="number" value={props.rows} onChange={e => setProp((p: any) => p.rows = parseInt(e.target.value) || 1)} className="border rounded p-1 text-sm" />
                </div>
                <div className="flex flex-col space-y-1">
                    <label className="text-xs text-muted-foreground">Columns</label>
                    <input type="number" value={props.cols} onChange={e => setProp((p: any) => p.cols = parseInt(e.target.value) || 1)} className="border rounded p-1 text-sm" />
                </div>
            </div>
        );
    }

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
                label="Background (Fill)"
                color={props.fill}
                onChange={(color) => setProp((p: any) => p.fill = color)}
            />

            <ColorPicker
                label="Border Color"
                color={props.stroke}
                onChange={(color) => setProp((p: any) => p.stroke = color)}
            />

            <div className="flex flex-col space-y-1">
                <label className="text-xs text-muted-foreground">Border Width</label>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={props.strokeWidth || 0}
                    onChange={(e) => setProp((p: any) => p.strokeWidth = parseInt(e.target.value))}
                    className="w-full accent-primary"
                />
            </div>
        </div>
    );
};

TableBlock.craft = {
    displayName: "Table",
    props: {
        isOverlay: true,
        x: -9999,
        y: -9999,
        zIndex: 10,
        rows: 3,
        cols: 3,
        fill: "#ffffff",
        stroke: "#e5e7eb",
        strokeWidth: 1,
        cellText: {},
    },
    related: {
        settings: TableBlockSettings,
    },
};
