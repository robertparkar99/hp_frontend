"use client";
import React, { useEffect } from "react";
import { useNode, useEditor } from "@craftjs/core";
import { useOverlayTransform } from "../hooks/useOverlayTransform";
import { TransformControls } from "./TransformControls";

interface OverlayWrapperProps {
    x?: number;
    y?: number;
    width?: number | string;
    height?: number | string;
    rotation?: number;
    zIndex?: number;
    isOverlay?: boolean;
    isText?: boolean;
    children: React.ReactNode;
}

export const OverlayWrapper = ({
    x = 0,
    y = 0,
    width = "100%",
    height = "100%",
    rotation = 0,
    zIndex = 10,
    isOverlay = false,
    isText = false,
    children,
}: OverlayWrapperProps) => {
    const {
        id,
        connectors: { connect, drag },
        actions: { setProp },
        selected
    } = useNode((node) => ({
        selected: node.events.selected
    }));

    const { query, actions: { delete: deleteNode } } = useEditor();

    const [mounted, setMounted] = React.useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle Keyboard Delete
    useEffect(() => {
        if (!selected) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't delete if we are actively typing in an input or text block
            const target = e.target as HTMLElement;
            if (
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target.isContentEditable
            ) {
                return;
            }

            if (e.key === "Backspace" || e.key === "Delete") {
                e.preventDefault();

                // Check if this is a top-level node before deleting
                const nodeObj = query.node(id).get();
                if (!nodeObj || !nodeObj.data) {
                    console.warn('Node not found or invalid:', id);
                    return;
                }

                const nodeData = nodeObj.data;
                const hasParent = nodeData?.parent != null;

                // Prevent deletion of top-level nodes (nodes without parent)
                if (!hasParent) {
                    console.warn('Cannot delete top-level node');
                    return;
                }

                // Check if node is deletable
                if (query.node(id).isDeletable()) {
                    deleteNode(id);
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [selected, id, deleteNode, query]);

    // 60FPS Hardware Transform Engine
    const { domRef, handlers, controls } = useOverlayTransform({
        initialX: x === -9999 ? 50 : x, // Initial drop fallback
        initialY: y === -9999 ? 50 : y,
        initialWidth: width,
        initialHeight: height,
        initialRotation: rotation,
        initialZIndex: zIndex,
        getMaxZIndex: () => {
            const nodes = query.getNodes();
            let maxZ = 10;
            Object.values(nodes).forEach(n => {
                const z = n.data.props.zIndex;
                if (typeof z === "number" && z > maxZ) maxZ = z;
            });
            return maxZ;
        },
        onTransformEnd: (finalState) => {
            // Commit strictly once on mouseup bypassing concurrent lock
            setProp((props: any) => {
                props.x = finalState.x;
                props.y = finalState.y;
                props.rotation = finalState.rotation;
                props.zIndex = finalState.zIndex;

                // Translate the mathematically projected CSS aspect-ratio multiplier back to font size
                if (finalState.scaleMultiplier && finalState.scaleMultiplier !== 1) {
                    if (props.fontSize !== undefined) {
                        props.fontSize = Math.round(props.fontSize * finalState.scaleMultiplier * 10) / 10;
                    }
                }

                props.width = typeof finalState.width === 'number' ? `${finalState.width}px` : finalState.width;
                if (!isText) {
                    props.height = typeof finalState.height === 'number' ? `${finalState.height}px` : finalState.height;
                }
            });
        }
    });

    if (isOverlay) {
        return (
            <div
                ref={(ref) => {
                    if (ref) {
                        (domRef as React.MutableRefObject<HTMLDivElement | null>).current = ref as HTMLDivElement;
                        connect(ref);
                    }
                }}
                {...handlers}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex,
                    width: typeof width === 'number' ? `${width}px` : width,
                    height: isText ? "auto" : (typeof height === 'number' ? `${height}px` : height),
                    transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                    willChange: "transform",
                    contain: "layout style",
                    touchAction: "none" // Crucial for pointer events on mobile
                }}
            >
                <TransformControls
                    controls={{
                        ...controls, onDelete: () => {
                            // Check if this is a top-level node before deleting
                            const nodeObj = query.node(id).get();
                            if (!nodeObj || !nodeObj.data) {
                                console.warn('Node not found or invalid:', id);
                                return;
                            }

                            const nodeData = nodeObj.data;
                            const hasParent = nodeData?.parent != null;

                            // Prevent deletion of top-level nodes (nodes without parent)
                            if (!hasParent) {
                                console.warn('Cannot delete top-level node');
                                return;
                            }

                            // Check if node is deletable
                            if (query.node(id).isDeletable()) {
                                deleteNode(id);
                            }
                        }
                    }}
                    handlers={handlers}
                    selected={selected}
                >
                    <div className="w-full h-full">
                        {children}
                    </div>
                </TransformControls>
            </div>
        );
    }

    // Standard Document Flow Element
    return (
        <div ref={(ref) => { if (ref) connect(drag(ref)); }} className="relative w-full h-full hover:ring-1 ring-primary transition-all">
            {children}
        </div>
    );
};
