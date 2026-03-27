"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import { PositionControl } from "../editor/settings/PositionControl";
import { ColorPicker } from "../editor/settings/ColorPicker";
import { SpacingControl } from "../editor/settings/SpacingControl";
import { OverlayWrapper } from "../editor/settings/OverlayWrapper";

export const DividerBlock = ({
    color,
    thickness,
    margin,
    isOverlay,
    x,
    y,
    rotation = 0,
    zIndex,
    width,
}: any) => {
    const { connectors: { connect } } = useNode();

    return (
        <OverlayWrapper isOverlay={isOverlay} x={x} y={y} width={width} rotation={rotation} zIndex={zIndex}>
            <div
                style={{
                    width: "100%",
                    margin,
                    padding: "8px 0", // Hitbox padding for easy grabbing
                }}
            >
                <div
                    style={{
                        width: "100%",
                        height: `${thickness || 1}px`,
                        backgroundColor: color || "#e5e5e5"
                    }}
                />
            </div>
        </OverlayWrapper>
    );
};

export const DividerBlockSettings = ({ isDesignTab }: { isDesignTab?: boolean }) => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));

    if (!isDesignTab) {
        return (
            <div className="flex flex-col space-y-4">
                <p className="text-sm text-muted-foreground">A visual divider to separate content sections.</p>
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
                label="Line Color"
                color={props.color}
                onChange={(color) => setProp((p: any) => p.color = color)}
            />

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                    <label className="text-xs text-muted-foreground">Thickness</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            value={props.thickness || 1}
                            onChange={(e) => setProp((p: any) => p.thickness = Number(e.target.value))}
                            className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                        />
                        <span className="text-xs text-muted-foreground">px</span>
                    </div>
                </div>
                <SpacingControl label="Margin" value={props.margin} onChange={(val) => setProp((p: any) => p.margin = val)} />
            </div>
        </div>
    );
};

DividerBlock.craft = {
    displayName: "Divider",
    props: {
        color: "#e5e5e5",
        thickness: 1,
        margin: "16px 0px",
        isOverlay: true,
        x: -9999,
        y: -9999,
        zIndex: 10,
        width: "100%",
        // height not explicitly tracked for divider, relying on thickness
    },
    related: {
        settings: DividerBlockSettings,
    }
};
