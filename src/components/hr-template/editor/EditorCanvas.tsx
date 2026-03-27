"use client";
import React from "react";
import { useEditor } from "@craftjs/core";
import { WhiteboardTool } from "./FloatingToolbar";
import { TextBlock } from "../blocks/TextBlock";
import { ShapeBlock } from "../blocks/ShapeBlock";
import { LineBlock } from "../blocks/LineBlock";
import { DrawingOverlay } from "./DrawingOverlay";

export const EditorCanvas = ({ children, activeTool }: { children: React.ReactNode, activeTool?: WhiteboardTool }) => {
    const { actions, query } = useEditor((state) => ({
        selectedNodeId: state.events.selected,
    }));

    // Get selected node ID from editor state
    const selectedNodeId = useEditor((state) => state.events.selected);

    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!activeTool || activeTool === 'select' || activeTool.startsWith('draw') || activeTool === 'shapes') return;

        // Determine the parent node - if a container is selected, add to it; otherwise add to ROOT
        // Default to ROOT if we can't determine the selected node
        let parentId = "ROOT";
        if (selectedNodeId && selectedNodeId.size > 0) {
            const firstSelectedId = Array.from(selectedNodeId)[0] as string;
            const selectedNode = query.node(firstSelectedId).get();
            if (selectedNode && selectedNode.data) {
                // Check if the selected node can accept children (is a container-like element)
                const nodeData = selectedNode.data;
                const nodeName = nodeData?.name;
                if (nodeName === 'Container' || nodeName === 'Grid' || nodeName === 'Frame') {
                    parentId = firstSelectedId;
                }
            }
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        let nodeToCreate;

        if (activeTool === 'sticky') {
            const size = 200;
            nodeToCreate = query.parseReactElement(<ShapeBlock shapeType="square" x={x} y={y} width={`${size}px`} height={`${size}px`} fill="#fcd34d" stroke="transparent" />).toNodeTree();
        } else if (activeTool === 'text') {
            nodeToCreate = query.parseReactElement(<TextBlock html="<h2>New Text</h2>" fontSize={24} x={x} y={y} />).toNodeTree();
        }

        if (nodeToCreate) {
            // Add to the determined parent (ROOT or selected container)
            actions.addNodeTree(nodeToCreate, parentId);
        }
    };

    return (
        <div
            className="flex-1 overflow-y-auto bg-neutral-100 p-8 h-full flex justify-center"
            onPointerMove={(e) => {
                (window as any).__craft_mouse_x = e.clientX;
                (window as any).__craft_mouse_y = e.clientY;
            }}
        >
            <div
                id="editor-canvas"
                className={`bg-white min-h-[1056px] w-full max-w-[816px] shadow-sm border border-neutral-200 p-6 relative flex flex-col [&>div]:flex-1 ${activeTool && (activeTool !== 'select' && !activeTool.startsWith('draw')) ? 'cursor-crosshair' : ''}`}
                onClick={handleCanvasClick}
            >
                {children}
                {activeTool && <DrawingOverlay activeTool={activeTool} />}

                {/* Dedicated overlay for click-to-place tools like tables and stickies */}
                {activeTool && activeTool !== 'select' && activeTool !== 'shapes' && !activeTool.startsWith('draw') && !activeTool.startsWith('line_') && (
                    <div
                        className="absolute inset-0 z-40 cursor-crosshair"
                        onClick={handleCanvasClick}
                    />
                )}
            </div>
        </div >
    );
};
