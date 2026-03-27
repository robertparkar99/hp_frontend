"use client";
import React from "react";
import { useNode, Element } from "@craftjs/core";
import { ColorPicker } from "../editor/settings/ColorPicker";
import { SpacingControl } from "../editor/settings/SpacingControl";
import { PositionControl } from "../editor/settings/PositionControl";
import { OverlayWrapper } from "../editor/settings/OverlayWrapper";

export const ContainerBlock = ({
    children,
    padding,
    margin,
    backgroundColor,
    borderRadius,
    borderColor,
    borderWidth,
    isOverlay,
    x,
    y,
    rotation = 0,
    zIndex,
    width,
    height,
    display = "flex",
    flexDirection = "column",
    justifyContent = "flex-start",
    alignItems = "stretch",
    gap = "0px",
}: any) => {
    const { connectors: { connect } } = useNode();

    const displayClass = display === "grid" ? "grid" : display === "block" ? "block" : "flex";
    const flexDirClass = flexDirection === "row" ? "flex-row" : "flex-col";
    const justifyClass = justifyContent === "center" ? "justify-center" : justifyContent === "flex-end" ? "justify-end" : justifyContent === "space-between" ? "justify-between" : "justify-start";
    const alignClass = alignItems === "center" ? "items-center" : alignItems === "flex-end" ? "items-end" : alignItems === "stretch" ? "items-stretch" : "items-start";

    return (
        <OverlayWrapper isOverlay={isOverlay} x={x} y={y} width={width} height={height} rotation={rotation} zIndex={zIndex}>
            <div
                ref={(ref) => { if (ref) connect(ref); }}
                className={`group/container relative ${displayClass} ${flexDirClass} ${justifyClass} ${alignClass}`}
                style={{
                    padding,
                    margin,
                    backgroundColor,
                    borderRadius,
                    borderColor,
                    borderWidth: borderWidth ? `${borderWidth}px` : undefined,
                    borderStyle: borderWidth ? "solid" : "none",
                    width: width || "100%",
                    height: height || "100px",
                    minHeight: "100px",
                    gap,
                }}
            >
                <div className="absolute top-[-20px] left-0 hidden group-hover/container:block text-[10px] text-primary font-mono bg-primary/10 px-1 rounded pointer-events-none whitespace-nowrap z-50">
                    Container [{display} {flexDirection}]
                </div>
                {children}
            </div>
        </OverlayWrapper>
    );
};

export const ContainerBlockSettings = ({ isDesignTab }: { isDesignTab?: boolean }) => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));

    if (!isDesignTab) {
        return (
            <div className="flex flex-col space-y-4">
                <p className="text-sm text-muted-foreground">This is a structural container. Drag elements inside!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6">
            {/* Layout Section */}
            <div className="border-b pb-4">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Layout</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                        <label className="text-xs text-muted-foreground">Display</label>
                        <select
                            value={props.display || "flex"}
                            onChange={(e) => setProp((p: any) => p.display = e.target.value)}
                            className="flex h-8 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors"
                        >
                            <option value="flex">Flex</option>
                            <option value="grid">Grid</option>
                            <option value="block">Block</option>
                        </select>
                    </div>
                    <div className="flex flex-col space-y-1">
                        <label className="text-xs text-muted-foreground">Direction</label>
                        <select
                            value={props.flexDirection || "column"}
                            onChange={(e) => setProp((p: any) => p.flexDirection = e.target.value)}
                            className="flex h-8 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors"
                        >
                            <option value="column">Column</option>
                            <option value="row">Row</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-col space-y-1">
                        <label className="text-xs text-muted-foreground">Justify</label>
                        <select
                            value={props.justifyContent || "flex-start"}
                            onChange={(e) => setProp((p: any) => p.justifyContent = e.target.value)}
                            className="flex h-8 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors"
                        >
                            <option value="flex-start">Start</option>
                            <option value="center">Center</option>
                            <option value="flex-end">End</option>
                            <option value="space-between">Between</option>
                        </select>
                    </div>
                    <div className="flex flex-col space-y-1">
                        <label className="text-xs text-muted-foreground">Align</label>
                        <select
                            value={props.alignItems || "stretch"}
                            onChange={(e) => setProp((p: any) => p.alignItems = e.target.value)}
                            className="flex h-8 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors"
                        >
                            <option value="stretch">Stretch</option>
                            <option value="start">Start</option>
                            <option value="center">Center</option>
                            <option value="end">End</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4">
                    <SpacingControl label="Gap" value={props.gap || "0px"} onChange={(val) => setProp((p: any) => p.gap = val)} />
                </div>
            </div>

            <PositionControl
                isOverlay={props.isOverlay}
                x={props.x}
                y={props.y}
                zIndex={props.zIndex}
                onChange={(prop, val) => setProp((p: any) => p[prop] = val)}
            />

            <ColorPicker
                label="Background Color"
                color={props.backgroundColor}
                onChange={(color) => setProp((p: any) => p.backgroundColor = color)}
            />

            <ColorPicker
                label="Border Color"
                color={props.borderColor}
                onChange={(color) => setProp((p: any) => p.borderColor = color)}
            />

            <div className="grid grid-cols-2 gap-4">
                <SpacingControl label="Padding" value={props.padding} onChange={(val) => setProp((p: any) => p.padding = val)} />
                <SpacingControl label="Margin" value={props.margin} onChange={(val) => setProp((p: any) => p.margin = val)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <SpacingControl label="Border Radius" value={props.borderRadius} onChange={(val) => setProp((p: any) => p.borderRadius = val)} />
                <div className="flex flex-col space-y-1">
                    <label className="text-xs text-muted-foreground">Border Width</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            value={props.borderWidth || 0}
                            onChange={(e) => setProp((p: any) => p.borderWidth = Number(e.target.value))}
                            className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors"
                        />
                        <span className="text-xs text-muted-foreground">px</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

ContainerBlock.craft = {
    displayName: "Container",
    props: {
        padding: "16px",
        margin: "0px",
        backgroundColor: "#ffffff",
        borderRadius: "0px",
        borderColor: "#e5e5e5",
        borderWidth: 1,
        isOverlay: true,
        x: -9999,
        y: -9999,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        zIndex: 10,
        width: "100%",
        height: "100px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "stretch",
        gap: "0px",
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: ContainerBlockSettings,
    }
};
