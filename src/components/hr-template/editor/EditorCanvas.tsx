"use client";
import React, { useEffect } from "react";
import { useEditor } from "@craftjs/core";
import { WhiteboardTool } from "./FloatingToolbar";
import { TextBlock } from "../blocks/TextBlock";
import { ShapeBlock } from "../blocks/ShapeBlock";
import { LineBlock } from "../blocks/LineBlock";
import { DrawingOverlay } from "./DrawingOverlay";
import { ZoomIn, ZoomOut } from "lucide-react";

const A4_PAGE_WIDTH = 794;
const A4_PAGE_HEIGHT = 1123;
const PAGE_CHROME_HEIGHT = 48;
const PAGE_GAP = 32;
const PAGE_EDITOR_HEIGHT = A4_PAGE_HEIGHT + PAGE_CHROME_HEIGHT;

export const EditorCanvas = ({ children, activeTool }: { children: React.ReactNode, activeTool?: WhiteboardTool }) => {
    const { actions, query } = useEditor((state) => ({
        selectedNodeId: state.events.selected,
    }));

    // Get all page nodes (children of DocumentContainer)
    const rootNode = query.node('ROOT').get();
    const pageNodes = rootNode?.data?.nodes?.filter((nodeId: string) => {
        const node = query.node(nodeId).get();
        return node?.data?.name === 'A4PageBlock';
    }) || [];

    const selectedNodeId = useEditor((state) => state.events.selected);
    const [zoom, setZoom] = React.useState(1);
    const [zoomMode, setZoomMode] = React.useState<"fit" | "manual">("fit");
    const containerRef = React.useRef<HTMLDivElement>(null);
    const editorContentHeight = Math.max(1, pageNodes.length) * PAGE_EDITOR_HEIGHT + Math.max(0, pageNodes.length - 1) * PAGE_GAP;

    const fitToScreen = React.useCallback(() => {
        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            // 794x1123 is the A4 size. We leave an 80px buffer (40px padding on each side).
            const widthRatio = (width - 80) / A4_PAGE_WIDTH;
            const heightRatio = (height - 80) / A4_PAGE_HEIGHT;
            // Limit fit to a max of 1.5 zoom to avoid ridiculous scaling on huge screens.
            const newZoom = Math.min(widthRatio, heightRatio, 1.5);
            setZoom(Math.max(0.2, newZoom));
            setZoomMode("fit");
        }
    }, []);

    // Robust fit with ResizeObserver
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver(() => {
            if (zoomMode === "fit") {
                fitToScreen();
            }
        });

        observer.observe(container);

        // Intial explicit fit
        const timeout = setTimeout(() => {
            if (zoomMode === "fit") fitToScreen();
        }, 50);

        return () => {
            observer.disconnect();
            clearTimeout(timeout);
        };
    }, [fitToScreen, zoomMode]);

    useEffect(() => {
        (window as any).__craft_zoom = zoom;
    }, [zoom]);

    // Global keyboard shortcuts (e.g. Select All)
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            // Ignore if user is typing inside an input, textarea, or contenteditable
            if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable) {
                return;
            }

            // Ctrl+A or Cmd+A (Select All)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
                e.preventDefault();
                
                const nodes = query.getNodes();
                const selectableIds = Object.keys(nodes).filter(id => {
                    const node = nodes[id];
                    // Skip ROOT node or nodes without parent
                    if (id === 'ROOT' || !node.data?.parent) return false;
                    // Skip the canvas itself (e.g., A4PageBlock)
                    if (node.data.name === 'A4PageBlock' || node.data.isCanvas) return false;
                    return true;
                });
                
                if (selectableIds.length > 0) {
                    // Update Craft.js selection with array of IDs
                    actions.selectNode(selectableIds);
                }
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [actions, query]);

    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!activeTool || activeTool === 'select' || activeTool.startsWith('draw') || activeTool === 'shapes') return;

        let parentId = "ROOT";
        if (selectedNodeId && selectedNodeId.size > 0) {
            const firstSelectedId = Array.from(selectedNodeId)[0] as string;
            const selectedNode = query.node(firstSelectedId).get();
            if (selectedNode && selectedNode.data?.isCanvas) {
                parentId = firstSelectedId;
            }
        }

        const rect = e.currentTarget.getBoundingClientRect();
        // Scale normalize the coordinates
        const scaleFactor = zoom;
        const x = (e.clientX - rect.left) / scaleFactor;
        const y = (e.clientY - rect.top) / scaleFactor;

        let nodeToCreate;

        if (activeTool === 'sticky') {
            const size = 200;
            nodeToCreate = query.parseReactElement(<ShapeBlock shapeType="square" x={x} y={y} width={`${size}px`} height={`${size}px`} fill="#fcd34d" stroke="transparent" />).toNodeTree();
        } else if (activeTool === 'text') {
            nodeToCreate = query.parseReactElement(<TextBlock html="<h2>New Text</h2>" fontSize={24} x={x} y={y} />).toNodeTree();
        }

        if (nodeToCreate) {
            actions.addNodeTree(nodeToCreate, parentId);
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex-1 overflow-auto bg-neutral-100 flex relative"
            onPointerMove={(e) => {
                (window as any).__craft_mouse_x = e.clientX;
                (window as any).__craft_mouse_y = e.clientY;
            }}
        >
            <div className="absolute bottom-6 right-8 z-50 flex items-center bg-white shadow-lg rounded-full px-2 py-1 space-x-1 border border-neutral-200">
                 <button onClick={() => { setZoomMode("manual"); setZoom(z => Math.max(z - 0.1, 0.25)); }} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-600"><ZoomOut className="w-4 h-4" /></button>
                 <span className="text-xs font-semibold w-12 text-center text-neutral-700">{Math.round(zoom * 100)}%</span>
                 <button onClick={() => { setZoomMode("manual"); setZoom(z => Math.min(z + 0.1, 2.5)); }} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-600"><ZoomIn className="w-4 h-4" /></button>
                 <div className="w-px h-4 bg-neutral-300 mx-1"></div>
                 <button onClick={fitToScreen} className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${zoomMode === 'fit' ? 'bg-sky-100 text-sky-700' : 'hover:bg-neutral-100 text-neutral-600'}`}>Fit</button>
            </div>

            <div className="m-auto pt-15 pb-10 px-10 flex-shrink-0 flex items-center justify-center min-h-full min-w-full overflow-y-auto">
                <div
                    style={{
                        width: A4_PAGE_WIDTH * zoom,
                        minHeight: editorContentHeight * zoom,
                        transition: 'width 0.15s ease-out, minHeight 0.15s ease-out'
                    }}
                    className="relative shrink-0"
                >
                    <div
                        id="editor-canvas"
                        className={`absolute top-0 left-0 w-[794px] flex-shrink-0 origin-top-left ${activeTool && (activeTool !== 'select' && !activeTool.startsWith('draw')) ? 'cursor-crosshair' : ''}`}
                        style={{
                            transform: `scale(${zoom})`,
                            minHeight: editorContentHeight,
                            transition: 'transform 0.15s ease-out'
                        }}
                        onClick={(e) => {
                            // Store last click position in page coordinates (zoom-normalized)
                            const canvasEl = document.getElementById('editor-canvas');
                            if (canvasEl) {
                                const rect = canvasEl.getBoundingClientRect();
                                const pageX = (e.clientX - rect.left) / zoom;
                                const pageY = (e.clientY - rect.top) / zoom;
                                // Clamp to A4 bounds with a small margin
                                (window as any).__craft_last_click = {
                                    x: Math.max(10, Math.min(pageX, 744)),
                                    y: Math.max(10, Math.min(pageY, editorContentHeight - 10)),
                                    timestamp: Date.now(),
                                };
                            }
                            handleCanvasClick(e);
                        }}
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
                </div>
            </div>
        </div>
    );
};
