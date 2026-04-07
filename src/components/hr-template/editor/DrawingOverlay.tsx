"use client";
import React, { useState, useRef } from "react";
import { useEditor } from "@craftjs/core";
import { DrawingBlock } from "../blocks/DrawingBlock";
import { LineBlock } from "../blocks/LineBlock";
import { WhiteboardTool } from "./FloatingToolbar";

interface Point {
    x: number;
    y: number;
}

export const DrawingOverlay = React.memo(({ activeTool }: { activeTool: WhiteboardTool }) => {
    const { actions, query } = useEditor();
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPath, setCurrentPath] = useState<Point[]>([]);

    const selectedNodeId = useEditor((state) => state.events.selected);

    const addNodeToRoot = (nodeToCreate: any) => {
        let parentId = "ROOT";
        if (selectedNodeId && selectedNodeId.size > 0) {
            const firstSelectedId = Array.from(selectedNodeId)[0] as string;
            const selectedNode = query.node(firstSelectedId).get();
            if (selectedNode && selectedNode.data?.isCanvas) {
                parentId = firstSelectedId;
            }
        }
        actions.addNodeTree(nodeToCreate, parentId);
        return true;
    };

    const getToolStyles = () => {
        if (activeTool === 'draw_marker') return { stroke: '#ef4444', strokeWidth: 8, opacity: 0.8 };
        if (activeTool === 'draw_highlighter') return { stroke: '#facc15', strokeWidth: 24, opacity: 0.5 };
        if (activeTool === 'draw_eraser') return { stroke: '#ffffff', strokeWidth: 20, opacity: 1 }; // Soft eraser simulation
        return { stroke: '#1e293b', strokeWidth: 4, opacity: 1 }; // Default Pen
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        if (!activeTool.startsWith('draw') && !activeTool.startsWith('line_')) return;
        setIsDrawing(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const zoom = (window as any).__craft_zoom || 1;
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;
        setCurrentPath([{ x, y }]);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDrawing) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const zoom = (window as any).__craft_zoom || 1;
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;
        setCurrentPath(prev => [...prev, { x, y }]);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDrawing) return;
        setIsDrawing(false);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);

        if (currentPath.length < 2) {
            setCurrentPath([]);
            return;
        }

        if (activeTool.startsWith('line_')) {
            // Line Mode
            const startNode = currentPath[0];
            const endNode = currentPath[currentPath.length - 1];

            // Calculate distance for width
            const dx = endNode.x - startNode.x;
            const dy = endNode.y - startNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Calculate rotation angle in degrees
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

            // Spawn scalable LineBlock
            const lineType = activeTool.replace('line_', '');
            // We use a fixed height of 60 to give the SVG box enough breathing room for selection grabs
            // Ensure coordinates are not negative to prevent elements being hidden
            const safeX = Math.max(0, startNode.x);
            const safeY = Math.max(0, startNode.y - 30);
            const nodeWidth = Math.max(20, distance); // Prevent 0-width collapse
            const nodeToCreate = query.parseReactElement(
                <LineBlock
                    lineType={lineType}
                    x={safeX}
                    y={safeY}
                    width={nodeWidth}
                    height={60}
                    rotation={angle}
                />
            ).toNodeTree();

            // Add the node without resetting tool to allow continuous drawing
            addNodeToRoot(nodeToCreate);
        } else {
            // Drawing Mode
            // Calculate bounding box
            const xs = currentPath.map(p => p.x);
            const ys = currentPath.map(p => p.y);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);

            // Add padding for stroke width
            const styles = getToolStyles();
            const padding = styles.strokeWidth;

            const finalX = minX - padding;
            const finalY = minY - padding;
            const width = (maxX - minX) + (padding * 2);
            const height = (maxY - minY) + (padding * 2);

            // Normalize path relative to bounding box
            const normalizedPathStr = currentPath.map((p, i) => {
                const relX = p.x - finalX;
                const relY = p.y - finalY;
                return `${i === 0 ? 'M' : 'L'} ${relX} ${relY}`;
            }).join(' ');

            // Ensure coordinates are not negative
            const safeX = Math.max(0, finalX);
            const safeY = Math.max(0, finalY);

            // Spawn block
            const nodeToCreate = query.parseReactElement(
                <DrawingBlock
                    x={safeX}
                    y={safeY}
                    width={width}
                    height={height}
                    path={normalizedPathStr}
                    stroke={styles.stroke}
                    strokeWidth={styles.strokeWidth}
                    opacity={styles.opacity}
                />
            ).toNodeTree();

            addNodeToRoot(nodeToCreate);
        }

        setCurrentPath([]);
    };

    if (!activeTool.startsWith('draw') && !activeTool.startsWith('line_')) return null;

    const styles = getToolStyles();

    // Render active stroke
    const activePathStr = currentPath.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
        <svg
            className="absolute inset-0 w-full h-full z-40 touch-none cursor-crosshair"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            {currentPath.length > 0 && activeTool.startsWith('line_') && (
                <line
                    x1={currentPath[0].x}
                    y1={currentPath[0].y}
                    x2={currentPath[currentPath.length - 1].x}
                    y2={currentPath[currentPath.length - 1].y}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                />
            )}

            {currentPath.length > 0 && activeTool.startsWith('draw') && (
                <path
                    d={activePathStr}
                    stroke={styles.stroke}
                    strokeWidth={styles.strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={styles.opacity}
                    fill="none"
                />
            )}
        </svg>
    );
});
