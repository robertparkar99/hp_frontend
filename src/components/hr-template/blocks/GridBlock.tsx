"use client";
import React from "react";
import { useNode, Element } from "@craftjs/core";
import { ContainerBlock } from "./ContainerBlock";
import { PositionControl } from "../editor/settings/PositionControl";
import { SpacingControl } from "../editor/settings/SpacingControl";
import { OverlayWrapper } from "../editor/settings/OverlayWrapper";

export const GridBlock = ({
    columns,
    gap,
    margin,
    isOverlay,
    x,
    y,
    rotation = 0,
    zIndex,
    width,
    height,
}: any) => {
    const { connectors: { connect } } = useNode();

    return (
        <OverlayWrapper isOverlay={isOverlay} x={x} y={y} width={width} height={height} rotation={rotation} zIndex={zIndex}>
            <div
                className="group/grid relative w-full border border-dashed border-neutral-300 p-2 min-h-[120px]"
                style={{
                    width: "100%",
                    height: "100%",
                    margin,
                }}
            >
                <div className="absolute top-[-20px] left-0 hidden group-hover/grid:block text-[10px] text-blue-600 font-mono bg-blue-100 px-1 rounded pointer-events-none whitespace-nowrap z-[60]">
                    Grid ({columns} cols)
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${columns || 2}, minmax(0, 1fr))`,
                        gap: gap || "16px",
                        width: "100%",
                        height: "100%",
                    }}
                >
                    {/* Render predefined droppable areas based on columns */}
                    {Array.from({ length: columns || 2 }).map((_, i) => (
                        <Element key={i} id={`grid-col-${i}`} is={ContainerBlock} canvas />
                    ))}
                </div>
            </div>
        </OverlayWrapper>
    );
};

export const GridBlockSettings = ({ isDesignTab }: { isDesignTab?: boolean }) => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));

    if (!isDesignTab) {
        return (
            <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-1">
                    <label className="text-xs text-muted-foreground">Number of Columns</label>
                    <select
                        value={props.columns}
                        onChange={(e) => setProp((p: any) => p.columns = Number(e.target.value))}
                        className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                    >
                        <option value={2}>2 Columns</option>
                        <option value={3}>3 Columns</option>
                        <option value={4}>4 Columns</option>
                    </select>
                </div>
                <SpacingControl label="Gap (Spacing)" value={props.gap} onChange={(val) => setProp((p: any) => p.gap = val)} />
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
            <SpacingControl label="Margin" value={props.margin} onChange={(val) => setProp((p: any) => p.margin = val)} />
        </div>
    );
};

GridBlock.craft = {
    displayName: "Grid",
    props: {
        columns: 2,
        gap: "16px",
        margin: "16px 0px",
        isOverlay: true,
        x: -9999,
        y: -9999,
        zIndex: 10,
        width: "100%",
    },
    related: {
        settings: GridBlockSettings,
    }
};
