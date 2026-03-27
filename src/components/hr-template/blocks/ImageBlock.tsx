"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import { PositionControl } from "../editor/settings/PositionControl";
import { SpacingControl } from "../editor/settings/SpacingControl";
import { OverlayWrapper } from "../editor/settings/OverlayWrapper";
import { Image as ImageIcon } from "lucide-react";

export const ImageBlock = ({
    src,
    objectFit,
    borderRadius,
    frameShape = "none",
    isOverlay,
    x,
    y,
    rotation = 0,
    zIndex,
    width,
    height,
}: any) => {
    const { connectors: { connect } } = useNode();

    // Map of Canva-style frame shapes using strict CSS clip-paths
    const getClipPath = (shape: string) => {
        switch (shape) {
            case "circle": return "circle(50% at 50% 50%)";
            case "triangle": return "polygon(50% 0%, 0% 100%, 100% 100%)";
            case "diamond": return "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
            case "pentagon": return "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)";
            case "hexagon": return "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";
            case "star": return "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
            case "starburst": return "polygon(50% 0%, 63% 15%, 85% 15%, 85% 37%, 100% 50%, 85% 63%, 85% 85%, 63% 85%, 50% 100%, 37% 85%, 15% 85%, 15% 63%, 0% 50%, 15% 37%, 15% 15%, 37% 15%)";
            case "octagon": return "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)";
            case "cross": return "polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%)";
            case "arrow": return "polygon(0% 35%, 60% 35%, 60% 15%, 100% 50%, 60% 85%, 60% 65%, 0% 65%)";
            case "parallelogram": return "polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)";
            case "trapezoid": return "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)";
            case "right-triangle": return "polygon(0% 0%, 100% 100%, 0% 100%)";
            case "chevron": return "polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%)";
            case "ribbon": return "polygon(0% 0%, 100% 0%, 100% 100%, 50% 75%, 0% 100%)";
            case "message": return "polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)";
            case "tag": return "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)";
            case "shield": return "polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)";
            case "stairs": return "polygon(0% 0%, 50% 0%, 50% 50%, 100% 50%, 100% 100%, 0% 100%)";
            case "beveled": return "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)";
            default: return "none";
        }
    };

    const containerStyle: React.CSSProperties = {
        width: "100%",
        height: "100%",
        minHeight: "40px",
        borderRadius: frameShape === "none" ? (borderRadius || "0px") : "0px",
        clipPath: getClipPath(frameShape),
        overflow: "hidden",
    };

    return (
        <OverlayWrapper isOverlay={isOverlay} x={x} y={y} width={width} height={height} rotation={rotation} zIndex={zIndex}>
            <div className="relative flex items-center justify-center p-0" style={containerStyle}>
                {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={src}
                        alt="Uploaded"
                        className="w-full h-full pointer-events-none"
                        style={{
                            objectFit: objectFit || "contain",
                        }}
                    />
                ) : (
                    <div className="w-full h-full min-h-[100px] bg-gradient-to-br from-[#80d8ff] to-[#00b0ff] border-0 flex flex-col items-center justify-end text-center relative overflow-hidden">
                        {/* Placeholder generic landscape to mimic Canva */}
                        <div className="absolute inset-0 flex items-center justify-center top-[-20%]">
                            <svg viewBox="0 0 24 24" fill="white" className="w-1/3 h-1/3 opacity-70"><path d="M17.5 19c-2.485 0-4.5-2.015-4.5-4.5 0-2.306 1.737-4.202 3.968-4.471C16.591 8.24 14.867 7 12.875 7 10.119 7 7.87 9.176 7.765 11.901A5.002 5.002 0 0 0 8 21.5h9.5c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5z" /></svg>
                        </div>
                        <div className="w-full h-[40%] bg-gradient-to-b from-[#8bc34a] to-[#689f38] absolute bottom-0 rounded-t-[40%] transform scale-150 translate-y-2"></div>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-white/50 text-xs tracking-wider uppercase mix-blend-overlay">Drag Image</div>
                    </div>
                )}
            </div>
        </OverlayWrapper>
    );
};

export const ImageBlockSettings = ({ isDesignTab }: { isDesignTab?: boolean }) => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProp((p: any) => p.src = reader.result);
            };
            reader.readAsDataURL(file);
        }
    }

    if (!isDesignTab) {
        return (
            <div className="flex flex-col space-y-4">
                <div>
                    <label className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-2 block">Upload Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2.5 file:px-4
              file:rounded-xl file:border-0
              file:text-sm file:font-semibold
              file:bg-gradient-to-r file:from-sky-500 file:to-blue-600 file:text-white
              hover:file:shadow-[0_4px_12px_rgba(14,165,233,0.3)] file:transition-all cursor-pointer"
                    />
                </div>
                {props.src && (
                    <button
                        onClick={() => setProp((p: any) => p.src = undefined)}
                        className="text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all text-left w-max"
                    >
                        Remove Image
                    </button>
                )}
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

            <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-slate-500">Frame Shape</label>
                <select
                    value={props.frameShape || "none"}
                    onChange={(e) => setProp((p: any) => p.frameShape = e.target.value)}
                    className="flex h-9 w-full items-center justify-between rounded-xl border border-sky-100/60 bg-white/60 hover:bg-sky-50/50 hover:border-sky-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none px-3 py-1 text-sm font-medium text-slate-700 shadow-sm transition-all cursor-pointer"
                >
                    <option value="none">Rectangle (None)</option>
                    <option value="circle">Circle</option>
                    <option value="triangle">Triangle</option>
                    <option value="diamond">Diamond</option>
                    <option value="pentagon">Pentagon</option>
                    <option value="hexagon">Hexagon</option>
                    <option value="octagon">Octagon</option>
                    <option value="star">Star</option>
                    <option value="starburst">Starburst</option>
                    <option value="cross">Cross</option>
                    <option value="arrow">Arrow</option>
                    <option value="parallelogram">Parallelogram</option>
                    <option value="trapezoid">Trapezoid</option>
                    <option value="right-triangle">Right Triangle</option>
                    <option value="chevron">Chevron</option>
                    <option value="ribbon">Ribbon</option>
                    <option value="message">Message</option>
                    <option value="tag">Tag</option>
                    <option value="shield">Shield</option>
                    <option value="stairs">Stairs</option>
                    <option value="beveled">Beveled</option>
                </select>
            </div>

            <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-slate-500">Image Fit</label>
                <select
                    value={props.objectFit}
                    onChange={(e) => setProp((p: any) => p.objectFit = e.target.value)}
                    className="flex h-9 w-full items-center justify-between rounded-xl border border-sky-100/60 bg-white/60 hover:bg-sky-50/50 hover:border-sky-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none px-3 py-1 text-sm font-medium text-slate-700 shadow-sm transition-all cursor-pointer"
                >
                    <option value="cover">Cover (Fill Shape)</option>
                    <option value="contain">Contain (Fit In Shape)</option>
                    <option value="fill">Stretch</option>
                </select>
            </div>

            {props.frameShape === "none" && (
                <SpacingControl label="Border Radius" value={props.borderRadius} onChange={(val) => setProp((p: any) => p.borderRadius = val)} />
            )}
        </div>
    );
}

ImageBlock.craft = {
    displayName: "Frame",
    props: {
        src: "",
        objectFit: "cover", // Default to cover so it fills custom clip-paths natively
        borderRadius: "0px",
        frameShape: "none",
        isOverlay: true,
        x: -9999,
        y: -9999,
        zIndex: 10,
        width: "200px",  // Force default aspect ratio footprint for proper drops
        height: "200px",
    },
    related: {
        settings: ImageBlockSettings,
    }
};
