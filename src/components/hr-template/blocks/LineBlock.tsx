"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import { PositionControl } from "../editor/settings/PositionControl";
import { ColorPicker } from "../editor/settings/ColorPicker";
import { OverlayWrapper } from "../editor/settings/OverlayWrapper";

export const LineBlock = ({
    lineType = 'straight',
    stroke,
    strokeWidth,
    strokeDasharray,
    startArrow,
    endArrow,
    isOverlay,
    x,
    y,
    rotation = 0,
    zIndex,
    width,
    height,
}: any) => {
    const { connectors: { connect }, id } = useNode();

    const getPath = () => {
        if (lineType === 'straight') {
            return `M 0 50 L 100 50`;
        }
        if (lineType === 'curved') {
            return `M 0 50 Q 50 -20 100 50`;
        }
        if (lineType === 'elbow') {
            return `M 0 20 L 50 20 L 50 80 L 100 80`;
        }
        return `M 0 50 L 100 50`;
    };

    return (
        <OverlayWrapper isOverlay={isOverlay} x={x} y={y} width={width} height={height} rotation={rotation} zIndex={zIndex}>
            <div className="w-full h-full relative flex items-center justify-center">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 pointer-events-none overflow-visible w-full h-full">
                    {/* Define arrow markers if needed */}
                    <defs>
                        <marker id="arrow-start" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                            <path d="M9,0 L9,6 L0,3 z" fill={stroke} />
                        </marker>
                        <marker id="arrow-end" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                            <path d="M0,0 L0,6 L9,3 z" fill={stroke} />
                        </marker>
                    </defs>

                    <path
                        d={getPath()}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        strokeDasharray={strokeDasharray === 'dashed' ? '5,5' : strokeDasharray === 'dotted' ? '2,2' : 'none'}
                        fill="none"
                        vectorEffect="non-scaling-stroke"
                        markerStart={startArrow ? "url(#arrow-start)" : "none"}
                        markerEnd={endArrow ? "url(#arrow-end)" : "none"}
                        className="transition-all"
                    />
                </svg>
            </div>
        </OverlayWrapper>
    );
};

export const LineBlockSettings = ({ isDesignTab }: { isDesignTab?: boolean }) => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));

    if (!isDesignTab) return null;

    return (
        <div className="flex flex-col space-y-6">
            <PositionControl
                isOverlay={props.isOverlay}
                x={props.x}
                y={props.y}
                zIndex={props.zIndex}
                onChange={(prop, val) => setProp((p: any) => p[prop] = val)}
            />

            <div className="flex flex-col space-y-1">
                <label className="text-xs text-muted-foreground">Line Type</label>
                <select
                    value={props.lineType}
                    onChange={(e) => setProp((p: any) => p.lineType = e.target.value)}
                    className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                >
                    <option value="straight">Straight</option>
                    <option value="curved">Curved</option>
                    <option value="elbow">Elbow</option>
                </select>
            </div>

            <ColorPicker
                label="Stroke Color"
                color={props.stroke}
                onChange={(color) => setProp((p: any) => p.stroke = color)}
            />

            <div className="flex flex-col space-y-1">
                <label className="text-xs text-muted-foreground">Stroke Style</label>
                <select
                    value={props.strokeDasharray}
                    onChange={(e) => setProp((p: any) => p.strokeDasharray = e.target.value)}
                    className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                >
                    <option value="none">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                </select>
            </div>

            <div className="flex flex-col space-y-1">
                <label className="text-xs text-muted-foreground flex justify-between">
                    <span>Stroke Width</span>
                    <span>{props.strokeWidth}px</span>
                </label>
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={props.strokeWidth}
                    onChange={(e) => setProp((p: any) => p.strokeWidth = parseInt(e.target.value))}
                    className="w-full accent-primary"
                />
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-border">
                <label className="flex items-center space-x-2 text-sm">
                    <input
                        type="checkbox"
                        checked={props.startArrow || false}
                        onChange={(e) => setProp((p: any) => p.startArrow = e.target.checked)}
                        className="rounded border-input text-primary"
                    />
                    <span>Start Arrow</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                    <input
                        type="checkbox"
                        checked={props.endArrow || false}
                        onChange={(e) => setProp((p: any) => p.endArrow = e.target.checked)}
                        className="rounded border-input text-primary"
                    />
                    <span>End Arrow</span>
                </label>
            </div>
        </div>
    );
};

LineBlock.craft = {
    displayName: "Line",
    props: {
        lineType: "straight",
        stroke: "#1e293b",
        strokeWidth: 4,
        strokeDasharray: "none",
        startArrow: false,
        endArrow: false,
        isOverlay: true,
        x: -9999,
        y: -9999,
        zIndex: 10,
        width: 200,
        height: 60, // Minimum height to allow grab selection easing
    },
    related: {
        settings: LineBlockSettings,
    },
};
