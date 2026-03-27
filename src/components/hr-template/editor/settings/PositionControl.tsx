"use client";
import React from "react";
import { Button } from "../../../ui/button";

interface PositionControlProps {
    isOverlay: boolean;
    x: number;
    y: number;
    zIndex: number;
    onChange: (prop: string, value: any) => void;
}

export const PositionControl = ({ isOverlay, x, y, zIndex, onChange }: PositionControlProps) => {
    return (
        <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
                <Button
                    variant={isOverlay ? "outline" : "default"}
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => onChange("isOverlay", false)}
                >
                    In Flow
                </Button>
                <Button
                    variant={isOverlay ? "default" : "outline"}
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => {
                        onChange("isOverlay", true);
                        if (x === undefined) onChange("x", 0);
                        if (y === undefined) onChange("y", 0);
                        if (zIndex === undefined) onChange("zIndex", 10);
                    }}
                >
                    Overlay
                </Button>
            </div>

            {isOverlay && (
                <div className="flex flex-col space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col space-y-1">
                            <label className="text-xs text-muted-foreground">X Position</label>
                            <div className="flex items-center space-x-1">
                                <input
                                    type="number"
                                    value={x || 0}
                                    onChange={(e) => onChange("x", Number(e.target.value))}
                                    className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                                <span className="text-[10px] text-muted-foreground">px</span>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <label className="text-xs text-muted-foreground">Y Position</label>
                            <div className="flex items-center space-x-1">
                                <input
                                    type="number"
                                    value={y || 0}
                                    onChange={(e) => onChange("y", Number(e.target.value))}
                                    className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                                <span className="text-[10px] text-muted-foreground">px</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Layer Ordering (Z-Index)</label>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => onChange("zIndex", Math.max(0, (zIndex || 0) - 1))} title="Send Backward">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg> Back
                            </Button>
                            <input
                                type="number"
                                value={zIndex || 0}
                                onChange={(e) => onChange("zIndex", Number(e.target.value))}
                                className="flex h-8 w-16 text-center rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm focus-visible:outline-none"
                            />
                            <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => onChange("zIndex", (zIndex || 0) + 1)} title="Bring Forward">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 9-5-5-5 5" /><path d="m17 15-5 5-5-5" /></svg> Front
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
