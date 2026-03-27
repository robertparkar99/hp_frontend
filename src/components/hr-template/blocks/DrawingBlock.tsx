"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import { PositionControl } from "../editor/settings/PositionControl";
import { ColorPicker } from "../editor/settings/ColorPicker";
import { OverlayWrapper } from "../editor/settings/OverlayWrapper";

export const DrawingBlock = ({
    path,
    stroke,
    strokeWidth,
    strokeLinecap,
    strokeLinejoin,
    isOverlay,
    x,
    y,
    rotation = 0,
    zIndex,
    width,
    height,
    opacity = 1,
}: any) => {
    const { connectors: { connect } } = useNode();

    return (
        <OverlayWrapper isOverlay={isOverlay} x={x} y={y} width={width} height={height} rotation={rotation} zIndex={zIndex}>
            <div className="w-full h-full relative" style={{ opacity }}>
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 pointer-events-none overflow-visible">
                    <path
                        d={path}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        strokeLinecap={strokeLinecap || 'round'}
                        strokeLinejoin={strokeLinejoin || 'round'}
                        fill="none"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
            </div>
        </OverlayWrapper>
    );
};

export const DrawingBlockSettings = ({ isDesignTab }: { isDesignTab?: boolean }) => {
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

            <ColorPicker
                label="Stroke Color"
                color={props.stroke}
                onChange={(color) => setProp((p: any) => p.stroke = color)}
            />

            <div className="flex flex-col space-y-1">
                <label className="text-xs text-muted-foreground flex justify-between">
                    <span>Stroke Width</span>
                    <span>{props.strokeWidth}px</span>
                </label>
                <input
                    type="range"
                    min="1"
                    max="50"
                    value={props.strokeWidth}
                    onChange={(e) => setProp((p: any) => p.strokeWidth = parseInt(e.target.value))}
                    className="w-full accent-primary"
                />
            </div>

            <div className="flex flex-col space-y-1">
                <label className="text-xs text-muted-foreground flex justify-between">
                    <span>Opacity</span>
                    <span>{Math.round((props.opacity || 1) * 100)}%</span>
                </label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={(props.opacity || 1) * 100}
                    onChange={(e) => setProp((p: any) => p.opacity = parseInt(e.target.value) / 100)}
                    className="w-full accent-primary"
                />
            </div>
        </div>
    );
};

DrawingBlock.craft = {
    displayName: "Drawing",
    props: {
        path: "M 0 0",
        stroke: "#000000",
        strokeWidth: 4,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        isOverlay: true,
        x: -9999,
        y: -9999,
        zIndex: 10,
        width: 100,
        height: 100,
        opacity: 1,
    },
    related: {
        settings: DrawingBlockSettings,
    },
};
