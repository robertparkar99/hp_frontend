"use client";
import React from "react";
import { useNode } from "@craftjs/core";
import { PositionControl } from "../editor/settings/PositionControl";
import { ColorPicker } from "../editor/settings/ColorPicker";
import { OverlayWrapper } from "../editor/settings/OverlayWrapper";

export const ShapeBlock = ({
    shapeType,
    fill,
    stroke,
    strokeWidth,
    isOverlay,
    x,
    y,
    rotation = 0,
    zIndex,
    width,
    height,
}: any) => {
    const { connectors: { connect } } = useNode();

    const renderShape = () => {
        const svgProps = {
            width: "100%",
            height: "100%",
            viewBox: "0 0 100 100",
            preserveAspectRatio: "none",
            fill: fill || "transparent",
            stroke: stroke || "transparent",
            strokeWidth: strokeWidth || 0,
            vectorEffect: "non-scaling-stroke",
        };

        switch (shapeType) {
            case 'square':
                return (
                    <svg {...svgProps}>
                        <rect x="0" y="0" width="100" height="100" />
                    </svg>
                );
            case 'rounded-square':
                return (
                    <svg {...svgProps}>
                        <rect x="0" y="0" width="100" height="100" rx="15" ry="15" />
                    </svg>
                );
            case 'circle':
                return (
                    <svg {...svgProps}>
                        <circle cx="50" cy="50" r="50" />
                    </svg>
                );
            case 'triangle':
                return (
                    <svg {...svgProps}>
                        <polygon points="50,0 100,100 0,100" />
                    </svg>
                );
            case 'star':
                return (
                    <svg {...svgProps}>
                        <polygon points="50,5 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" />
                    </svg>
                );
            case 'hexagon':
                return (
                    <svg {...svgProps}>
                        <polygon points="50,0 95,25 95,75 50,100 5,75 5,25" />
                    </svg>
                );
            case 'diamond':
                return (
                    <svg {...svgProps}>
                        <polygon points="50,0 100,50 50,100 0,50" />
                    </svg>
                );
            case 'pentagon':
                return (
                    <svg {...svgProps}>
                        <polygon points="50,0 100,38 82,100 18,100 0,38" />
                    </svg>
                );
            case 'octagon':
                return (
                    <svg {...svgProps}>
                        <polygon points="30,0 70,0 100,30 100,70 70,100 30,100 0,70 0,30" />
                    </svg>
                );
            case 'cross':
                return (
                    <svg {...svgProps}>
                        <polygon points="35,0 65,0 65,35 100,35 100,65 65,65 65,100 35,100 35,65 0,65 0,35 35,35" />
                    </svg>
                );
            case 'arrow':
                return (
                    <svg {...svgProps}>
                        <polygon points="0,35 60,35 60,15 100,50 60,85 60,65 0,65" />
                    </svg>
                );
            case 'parallelogram': return <svg {...svgProps}><polygon points="25,0 100,0 75,100 0,100" /></svg>;
            case 'trapezoid': return <svg {...svgProps}><polygon points="20,0 80,0 100,100 0,100" /></svg>;
            case 'right-triangle': return <svg {...svgProps}><polygon points="0,0 100,100 0,100" /></svg>;
            case 'chevron': return <svg {...svgProps}><polygon points="75,0 100,50 75,100 0,100 25,50 0,0" /></svg>;
            case 'ribbon': return <svg {...svgProps}><polygon points="0,0 100,0 100,100 50,75 0,100" /></svg>;
            case 'message': return <svg {...svgProps}><polygon points="0,0 100,0 100,75 75,75 75,100 50,75 0,75" /></svg>;
            case 'tag': return <svg {...svgProps}><polygon points="0,0 75,0 100,50 75,100 0,100" /></svg>;
            case 'shield': return <svg {...svgProps}><polygon points="0,0 100,0 100,60 50,100 0,60" /></svg>;
            case 'stairs': return <svg {...svgProps}><polygon points="0,0 50,0 50,50 100,50 100,100 0,100" /></svg>;
            case 'beveled': return <svg {...svgProps}><polygon points="20,0 80,0 100,20 100,80 80,100 20,100 0,80 0,20" /></svg>;
            default:
                return (
                    <svg {...svgProps}>
                        <rect x="0" y="0" width="100" height="100" />
                    </svg>
                );
        }
    };

    return (
        <OverlayWrapper isOverlay={isOverlay} x={x} y={y} width={width} height={height} rotation={rotation} zIndex={zIndex}>
            <div className="w-full h-full drop-shadow-sm">
                {renderShape()}
            </div>
        </OverlayWrapper>
    );
};

export const ShapeBlockSettings = ({ isDesignTab }: { isDesignTab?: boolean }) => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));

    if (!isDesignTab) {
        return (
            <div className="flex flex-col space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                    Double click to scale and rotate the shape.
                    Use the Design tab to change the shape type, color, and border.
                </p>
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

            <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-slate-500">Shape Type</label>
                <select
                    value={props.shapeType}
                    onChange={(e) => setProp((p: any) => p.shapeType = e.target.value)}
                    className="flex h-9 w-full items-center justify-between rounded-xl border border-sky-100/60 bg-white/60 hover:bg-sky-50/50 hover:border-sky-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none px-3 py-1 text-sm font-medium text-slate-700 shadow-sm transition-all cursor-pointer"
                >
                    <option value="square">Square</option>
                    <option value="rounded-square">Rounded Square</option>
                    <option value="circle">Circle</option>
                    <option value="triangle">Triangle</option>
                    <option value="diamond">Diamond</option>
                    <option value="pentagon">Pentagon</option>
                    <option value="hexagon">Hexagon</option>
                    <option value="octagon">Octagon</option>
                    <option value="star">Star</option>
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

            <ColorPicker
                label="Fill Color"
                color={props.fill}
                onChange={(color) => setProp((p: any) => p.fill = color)}
            />

            <div className="pt-2 border-t border-border mt-4">
                <h4 className="text-sm font-semibold mb-3">Border</h4>
                <div className="space-y-4">
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
                            min="0"
                            max="20"
                            value={props.strokeWidth || 0}
                            onChange={(e) => setProp((p: any) => p.strokeWidth = parseInt(e.target.value))}
                            className="w-full accent-primary"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

ShapeBlock.craft = {
    displayName: (props?: any) => {
        const shapeNames: Record<string, string> = {
            'square': 'Square',
            'rounded-square': 'Rounded Square',
            'circle': 'Circle',
            'triangle': 'Triangle',
            'diamond': 'Diamond',
            'pentagon': 'Pentagon',
            'hexagon': 'Hexagon',
            'octagon': 'Octagon',
            'star': 'Star',
            'cross': 'Cross',
            'arrow': 'Arrow',
            'parallelogram': 'Parallelogram',
            'trapezoid': 'Trapezoid',
            'right-triangle': 'Right Triangle',
            'chevron': 'Chevron',
            'ribbon': 'Ribbon',
            'message': 'Message',
            'tag': 'Tag',
            'shield': 'Shield',
            'stairs': 'Stairs',
            'beveled': 'Beveled',
        };
        const shapeType = props?.shapeType || 'square';
        const baseName = shapeNames[shapeType] || `Shape ${shapeType}`;
        const instanceNum = props?.instanceNumber || '';
        return instanceNum ? `${baseName} ${instanceNum}` : baseName;
    },
    props: {
        shapeType: "square",
        fill: "#e5e7eb", // default neutral-200
        stroke: "transparent",
        strokeWidth: 0,
        isOverlay: true,
        x: 50,
        y: 50,
        zIndex: 10,
        width: "100px",
        height: "100px",
        instanceNumber: 0,
    },
    related: {
        settings: ShapeBlockSettings,
    },
};
