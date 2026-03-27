"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import { PositionControl } from "../editor/settings/PositionControl";
import { ColorPicker } from "../editor/settings/ColorPicker";
import { SpacingControl } from "../editor/settings/SpacingControl";
import { OverlayWrapper } from "../editor/settings/OverlayWrapper";

export const ButtonBlock = ({
    text,
    link,
    backgroundColor,
    color,
    borderRadius,
    padding,
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
                style={{
                    width: "100%",
                    height: "100%",
                    margin,
                }}
                className="inline-block"
            >
                <a
                    href={link || "#"}
                    onClick={(e) => e.preventDefault()} // Prevent nav in editorr ok
                    style={{
                        backgroundColor: backgroundColor || "#0f172a",
                        color: color || "#ffffff",
                        borderRadius: borderRadius || "6px",
                        padding: padding || "8px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        textDecoration: "none",
                        fontWeight: 500,
                        fontSize: "14px"
                    }}
                >
                    {text}
                </a>
            </div>
        </OverlayWrapper>
    );
};

export const ButtonBlockSettings = ({ isDesignTab }: { isDesignTab?: boolean }) => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));

    if (!isDesignTab) {
        return (
            <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-1">
                    <label className="text-xs text-muted-foreground">Button Text</label>
                    <input
                        type="text"
                        value={props.text}
                        onChange={(e) => setProp((p: any) => p.text = e.target.value)}
                        className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                </div>
                <div className="flex flex-col space-y-1">
                    <label className="text-xs text-muted-foreground">Link URL</label>
                    <input
                        type="text"
                        value={props.link}
                        onChange={(e) => setProp((p: any) => p.link = e.target.value)}
                        placeholder="https://"
                        className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
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
                label="Background Color"
                color={props.backgroundColor}
                onChange={(color) => setProp((p: any) => p.backgroundColor = color)}
            />
            <ColorPicker
                label="Text Color"
                color={props.color}
                onChange={(color) => setProp((p: any) => p.color = color)}
            />

            <div className="grid grid-cols-2 gap-4">
                <SpacingControl label="Padding" value={props.padding} onChange={(val) => setProp((p: any) => p.padding = val)} />
                <SpacingControl label="Border Radius" value={props.borderRadius} onChange={(val) => setProp((p: any) => p.borderRadius = val)} />
            </div>
        </div>
    );
};

ButtonBlock.craft = {
    displayName: "Button",
    props: {
        text: "Click Me",
        link: "",
        backgroundColor: "#0f172a",
        color: "#ffffff",
        borderRadius: "6px",
        padding: "8px 16px",
        margin: "0px",
        isOverlay: true,
        x: -9999,
        y: -9999,
        zIndex: 10,
        width: "auto",
        height: "auto",
    },
    related: {
        settings: ButtonBlockSettings,
    }
};
