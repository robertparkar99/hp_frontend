"use client";
import React, { useState, useCallback } from "react";
import { useEditor } from "@craftjs/core";
import { Trash2, ChevronRight, ChevronDown, Code, Copy, Check, RotateCcw, CheckCircle } from "lucide-react";
import { Button } from "../../ui/button";

export const LayersPanel = () => {
    const { nodes, actions, query } = useEditor((state) => ({
        nodes: state.nodes,
    }));
    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({ ROOT: true });
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editValue, setEditValue] = React.useState("");

    // JSON editing state
    const [viewMode, setViewMode] = useState<"layers" | "json">("layers");
    const [jsonOutput, setJsonOutput] = useState<string>("");
    const [editedJson, setEditedJson] = useState<string>("");
    const [isEditing, setIsEditing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [applyStatus, setApplyStatus] = useState<"idle" | "success" | "error">("idle");
    const [parseError, setParseError] = useState<string>("");

    // Get serialized JSON from editor
    const getSerializedJson = useCallback(() => {
        try {
            return query.serialize();
        } catch (err) {
            console.error("Failed to serialize:", err);
            return "{}";
        }
    }, [query]);

    // Update JSON when mode changes to json
    React.useEffect(() => {
        if (viewMode === "json") {
            const serialized = getSerializedJson();
            setJsonOutput(serialized);
            setEditedJson(serialized);
        }
    }, [viewMode, getSerializedJson, nodes]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(editedJson);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            setEditedJson(jsonOutput);
            setParseError("");
        } else {
            setEditedJson(jsonOutput);
        }
        setIsEditing(!isEditing);
        setApplyStatus("idle");
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setEditedJson(value);
        try {
            JSON.parse(value);
            setParseError("");
        } catch {
            setParseError("Invalid JSON");
        }
    };

    const handleApply = () => {
        try {
            JSON.parse(editedJson);
            actions.deserialize(editedJson);
            setApplyStatus("success");
            setTimeout(() => setApplyStatus("idle"), 2000);
        } catch (err) {
            console.error("Failed to apply JSON:", err);
            setApplyStatus("error");
            setTimeout(() => setApplyStatus("idle"), 2000);
        }
    };

    const handleReset = () => {
        const currentJson = getSerializedJson();
        setEditedJson(currentJson);
        setJsonOutput(currentJson);
        setParseError("");
        setApplyStatus("idle");
    };

    const formatJson = (json: string) => {
        try {
            const parsed = JSON.parse(json);
            return JSON.stringify(parsed, null, 2);
        } catch {
            return json;
        }
    };

    // Helper function to get display name from node with sibling context
    const getDisplayName = (node: any, siblings: any[] = [], isRootContainer: boolean = false): string => {
        if (!node) return 'Unknown';
        if (!node.data) return `Block ${node.id?.slice(0, 8) || 'unknown'}`;
        
        const nodeName = node.data.name as string;
        const props = node.data.props || {};
        
        // Check for custom name first (user renamed it)
        if (props.customName) {
            return props.customName;
        }
        
        // Special handling for ROOT/Frame - use template name if available
        if (nodeName === 'Frame' || nodeName === 'Container') {
            // Check if this is the root container
            if (!node.data.parent) {
                return 'Template';
            }
        }
        
        // Map of component names to their displayName functions
        const displayNameMap: Record<string, (p: any, sibs: any[], rootContainer?: boolean) => string> = {
            'ShapeBlock': (p: any, sibs: any[]) => {
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
                const shapeType = p?.shapeType || 'square';
                const baseName = shapeNames[shapeType] || `Shape ${shapeType}`;
                // Get index among siblings with same type
                const sameTypeSiblings = sibs.filter((sib: any) => {
                    const sibNode = nodes[sib.id];
                    return sibNode && sibNode.data && sibNode.data.props && sibNode.data.props.shapeType === shapeType;
                });
                const typeIndex = sameTypeSiblings.findIndex((sib: any) => sib.id === node.id) + 1;
                return typeIndex > 1 ? `${baseName} ${typeIndex}` : baseName;
            },
            'TextBlock': (p: any) => p?.html ? `Text: ${p.html.substring(0, 20)}...` : 'Text',
            'ImageBlock': (p: any) => p?.src ? `Image: ${p.src.substring(0, 15)}...` : 'Image',
            'ContainerBlock': (p: any, sibs: any[], rootContainer: boolean = false) => {
                // Count ALL container siblings (not just same type) for numbering
                // At root level, we number all containers
                const allSiblings = sibs.filter((sib: any) => {
                    const sibNode = nodes[sib.id];
                    return sibNode && sibNode.data && (sibNode.data.name === 'Container' || sibNode.data.name === 'ContainerBlock' || sibNode.data.name === 'Container 1' || sibNode.data.name === 'Container 2');
                });
                const containerIndex = allSiblings.findIndex((sib: any) => sib.id === node.id) + 1;
                return containerIndex > 0 ? `Container ${containerIndex}` : 'Container';
            },
            'Container': (p: any, sibs: any[], rootContainer: boolean = false) => {
                // This is for when displayName is "Container"
                const allSiblings = sibs.filter((sib: any) => {
                    const sibNode = nodes[sib.id];
                    return sibNode && sibNode.data && (sibNode.data.name === 'Container' || sibNode.data.name === 'ContainerBlock');
                });
                const containerIndex = allSiblings.findIndex((sib: any) => sib.id === node.id) + 1;
                return containerIndex > 0 ? `Container ${containerIndex}` : 'Container';
            },
            'ButtonBlock': (p: any, sibs: any[]) => {
                const buttonSiblings = sibs.filter((sib: any) => {
                    const sibNode = nodes[sib.id];
                    return sibNode && sibNode.data && sibNode.data.name === 'Button';
                });
                const buttonIndex = buttonSiblings.findIndex((sib: any) => sib.id === node.id) + 1;
                return buttonIndex > 1 ? `Button ${buttonIndex}` : 'Button';
            },
            'DividerBlock': () => 'Divider',
            'GridBlock': () => 'Grid',
            'TableBlock': () => 'Table',
            'DrawingBlock': () => 'Drawing',
            'LineBlock': (p: any) => `Line: ${p?.lineType || 'default'}`,
        };
        
        // Check if we have a custom displayName function for this component
        if (nodeName && displayNameMap[nodeName]) {
            return displayNameMap[nodeName](props, siblings, isRootContainer);
        }
        
        // Fallback to node.data.name
        return nodeName || `Block ${node.id?.slice(0, 8) || 'unknown'}`;
    };

    // Get the node tree
    const nodeTree = React.useMemo(() => {
        const buildTree = (parentId: string | null): any[] => {
            if (!nodes || typeof nodes !== 'object') return [];

            if (!parentId) {
                // Root level nodes - get all nodes without a parent to use as siblings
                const allRootNodes = Object.values(nodes)
                    .filter((node) => node && node.data && !node.data.parent);

                const rootNodes = allRootNodes.map((node) => ({
                    id: node.id,
                    name: getDisplayName(node, allRootNodes),
                    children: buildTree(node.id),
                }));
                return rootNodes;
            }
            
            const parentNode = nodes[parentId];
            const childrenNodes = Object.values(nodes)
                .filter((node) => node && node.data && node.data.parent === parentId);

            return childrenNodes.map((node) => ({
                id: node.id,
                name: getDisplayName(node, childrenNodes),
                children: buildTree(node.id),
            }));
        };

        return buildTree(null);
    }, [nodes]);

    const toggleExpand = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDelete = (id: string) => {
        try {
            // Prevent deletion of ROOT node
            if (id === 'ROOT') {
                console.warn('Cannot delete ROOT node');
                return;
            }

            // First check if node exists
            const nodeObj = query.node(id).get();
            if (!nodeObj || !nodeObj.data) {
                console.warn('Node not found or invalid:', id);
                return;
            }

            // Check if this is a top-level node (no parent)
            const nodeData = nodeObj.data;
            const nodeName = nodeData?.name as string;
            const hasParent = nodeData?.parent != null;

            // Prevent deletion of top-level nodes like Frame, ROOT, or direct children of ROOT that are containers
            if (!hasParent && (nodeName === 'Frame' || nodeName === 'Container' || nodeName === 'ContainerBlock')) {
                console.warn('Cannot delete top-level container node:', nodeName);
                return;
            }

            const isDeletable = query.node(id).isDeletable();
            if (isDeletable) {
                actions.delete(id);
            }
        } catch (err: any) {
            // Check for Slate.js invariant errors
            if (err && err.message && err.message.includes('top-level')) {
                console.error('Cannot delete top-level node:', err.message);
                return;
            }
            console.error('Error deleting node:', err);
        }
    };

    const handleRename = (id: string, newName: string) => {
        // Store custom name in node props using a custom 'customName' prop
        const node = query.node(id).get();
        if (node) {
            actions.setProp(id, (prop: any) => {
                prop.customName = newName;
            });
        }
        setEditingId(null);
    };

    const startEditing = (id: string, currentName: string) => {
        setEditingId(id);
        setEditValue(currentName);
    };

    const renderNode = (node: any, depth: number = 0, siblingIndex: number = 0) => {
        if (!node || !node.id) return null;

        const isExpanded = expanded[node.id] !== false;
        const hasChildren = node.children && node.children.length > 0;
        let isDeletable = false;
        try {
            const nodeObj = query.node(node.id).get();
            isDeletable = nodeObj ? query.node(node.id).isDeletable() : false;
        } catch (err) {
            isDeletable = false;
        }
        const isEditing = editingId === node.id;
        // Use the pre-calculated name from nodeTree
        const displayName = node.name;

        return (
            <div key={node.id}>
                <div
                    className="select-none flex items-center py-1.5 px-2 cursor-pointer transition-colors text-xs hover:bg-neutral-100"
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                    onClick={() => (actions as any).selectNode(node.id)}
                >
                    <button
                        className={`p-0.5 hover:bg-neutral-200 rounded mr-1 transition-colors ${!hasChildren && 'invisible'}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(node.id);
                        }}
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-3 h-3 text-neutral-500" />
                        ) : (
                            <ChevronRight className="w-3 h-3 text-neutral-500" />
                        )}
                    </button>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleRename(node.id, editValue)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename(node.id, editValue);
                                if (e.key === 'Escape') setEditingId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="flex-1 px-1 py-0.5 text-xs border border-sky-500 rounded outline-none"
                        />
                    ) : (
                        <span 
                            className="truncate flex-1 font-medium text-neutral-700 cursor-text"
                            onDoubleClick={(e) => {
                                e.stopPropagation();
                                startEditing(node.id, displayName);
                            }}
                        >
                            {displayName}
                        </span>
                    )}
                    {isDeletable && !isEditing && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(node.id);
                            }}
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 transition-opacity"
                            title="Delete"
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    )}
                </div>
                {isExpanded && hasChildren && node.children.map((child: any) => renderNode(child, depth + 1))}
            </div>
        );
    };

    return (
        <div className="w-full">
            {/* Mode Toggle */}
            <div className="px-2 py-2 flex items-center justify-between bg-neutral-50 border-b">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                    {viewMode === "layers" ? "Layers" : "JSON Editor"}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setViewMode(viewMode === "layers" ? "json" : "layers")}
                        className="p-1 hover:bg-neutral-200 rounded transition-colors"
                        title={viewMode === "layers" ? "Switch to JSON" : "Switch to Layers"}
                    >
                        <Code className="w-3 h-3 text-neutral-500" />
                    </button>
                </div>
            </div>

            {viewMode === "layers" ? (
                <div className="py-1">
                    {nodeTree.map((node) => renderNode(node))}
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    {/* JSON Action Bar */}
                    <div className="px-2 py-2 flex items-center gap-2 border-b bg-neutral-50/50">
                        <Button
                            variant={isEditing ? "default" : "outline"}
                            size="sm"
                            onClick={handleEditToggle}
                            className="h-6 text-[10px]"
                        >
                            {isEditing ? "Cancel" : "Edit"}
                        </Button>
                        {isEditing && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleReset}
                                    className="h-6 w-6 p-0"
                                    title="Reset"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleApply}
                                    disabled={!!parseError}
                                    className="h-6 text-[10px] bg-green-600 hover:bg-green-700"
                                >
                                    {applyStatus === "success" ? (
                                        <CheckCircle className="w-3 h-3" />
                                    ) : applyStatus === "error" ? (
                                        "Error"
                                    ) : (
                                        "Apply"
                                    )}
                                </Button>
                            </>
                        )}
                        {!isEditing && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                className="h-6 w-6 p-0 ml-auto"
                                title="Copy"
                            >
                                {copied ? (
                                    <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                    <Copy className="w-3 h-3 text-neutral-500" />
                                )}
                            </Button>
                        )}
                    </div>

                    {/* Parse Error */}
                    {parseError && isEditing && (
                        <div className="px-2 py-1 bg-red-50 text-red-600 text-[10px] border-b border-red-100">
                            {parseError}
                        </div>
                    )}

                    {/* JSON Content */}
                    <div className="flex-1 overflow-auto p-2">
                        {isEditing ? (
                            <textarea
                                value={editedJson}
                                onChange={handleJsonChange}
                                className="w-full h-full min-h-[200px] text-[9px] font-mono text-neutral-600 bg-neutral-50 border border-neutral-200 rounded p-2 resize-none focus:outline-none focus:border-sky-500"
                                spellCheck={false}
                            />
                        ) : (
                            <pre className="text-[9px] font-mono text-neutral-600 whitespace-pre-wrap break-all">
                                {formatJson(jsonOutput)}
                            </pre>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
