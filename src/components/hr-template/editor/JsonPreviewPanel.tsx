"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useEditor } from "@craftjs/core";
import { Copy, Check, Code, X, RotateCcw, CheckCircle } from "lucide-react";
import { Button } from "../../ui/button";
import { normalizeTemplateDocument } from "./utils/documentModel";

export const JsonPreviewPanel = ({ onClose }: { onClose?: () => void }) => {
    // Use useEditor without selector - this gives stable query/actions references
    // without subscribing to any state changes that could cause re-renders
    const { query, actions } = useEditor();
    
    const [jsonOutput, setJsonOutput] = useState<string>("");
    const [editedJson, setEditedJson] = useState<string>("");
    const [isEditing, setIsEditing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [applyStatus, setApplyStatus] = useState<"idle" | "success" | "error">("idle");
    const [parseError, setParseError] = useState<string>("");
    const [viewMode, setViewMode] = useState<"json" | "tree">("tree");
    const [isReady, setIsReady] = useState(false);

    // Store query in ref for use in callbacks
    const queryRef = useRef(query);
    queryRef.current = query;

    // Get serialized JSON from editor
    const getSerializedJson = useCallback(() => {
        try {
            return queryRef.current?.serialize() || "{}";
        } catch (err) {
            console.error("Failed to serialize:", err);
            return "{}";
        }
    }, []);

    // Update JSON periodically (only when not editing)
    useEffect(() => {
        if (isEditing) return;

        let intervalId: NodeJS.Timeout | null = null;
        
        const updateJson = () => {
            // Use setTimeout to defer state updates to avoid render-time updates
            setTimeout(() => {
                try {
                    const serialized = getSerializedJson();
                    if (serialized && serialized.length > 2) {
                        // Use functional update to avoid dependency on jsonOutput
                        setJsonOutput((prev) => {
                            if (prev !== serialized) {
                                return serialized;
                            }
                            return prev;
                        });
                        setEditedJson((prev) => {
                            if (prev !== serialized) {
                                return serialized;
                            }
                            return prev;
                        });
                    }
                } catch (err) {
                    // Ignore errors during serialization
                }
            }, 100);
        };

        // Initial update after mount - defer to after render cycle
        const timeoutId = setTimeout(() => {
            setIsReady(true);
            updateJson();
        }, 2000);
        
        // Set up interval with longer delay to reduce updates
        intervalId = setInterval(updateJson, 5000);
        
        return () => {
            clearTimeout(timeoutId);
            if (intervalId) clearInterval(intervalId);
        };
    }, [isEditing, getSerializedJson]);

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
            // Cancel editing - reset to current state
            setEditedJson(jsonOutput);
            setParseError("");
        } else {
            // Start editing
            setEditedJson(jsonOutput);
        }
        setIsEditing(!isEditing);
        setApplyStatus("idle");
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setEditedJson(value);

        // Validate JSON on change
        try {
            JSON.parse(value);
            setParseError("");
        } catch (err) {
            setParseError("Invalid JSON");
        }
    };

    const handleApply = () => {
        try {
            const parsed = JSON.parse(editedJson);
            // Validate that we're not trying to delete ROOT or top-level nodes
            if (parsed && parsed.nodes) {
                const nodeIds = Object.keys(parsed.nodes);
                for (const nodeId of nodeIds) {
                    const node = parsed.nodes[nodeId];
                    // Safely check for protected nodes - handle cases where data might be undefined
                    const nodeData = node && node.data;
                    const nodeName = nodeData && nodeData.name;
                    const parentId = nodeData && nodeData.parent;
                    
                    if (nodeId === 'ROOT' || (!parentId && (nodeName === 'Frame' || nodeName === 'Container' || nodeName === 'ContainerBlock'))) {
                        console.warn('Cannot apply JSON that deletes top-level nodes');
                        setApplyStatus('error');
                        setTimeout(() => setApplyStatus('idle'), 2000);
                        return;
                    }
                }
            }
            const normalizedJson = normalizeTemplateDocument(editedJson);
            actions.deserialize(normalizedJson);
            setApplyStatus("success");
            setTimeout(() => setApplyStatus("idle"), 2000);
        } catch (err: any) {
            // Check for Slate.js invariant errors
            if (err && err.message && err.message.includes('top-level')) {
                console.error('Cannot apply changes that delete top-level nodes:', err.message);
                setApplyStatus('error');
                setTimeout(() => setApplyStatus('idle'), 2000);
                return;
            }
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

    // Format JSON for display
    const formatJson = (json: string) => {
        try {
            const parsed = JSON.parse(json);
            return JSON.stringify(parsed, null, 2);
        } catch {
            return json;
        }
    };

    // Build tree structure from JSON for visual display
    const buildTree = (json: string): any[] => {
        try {
            // Validate JSON string before parsing - must be a non-empty string
            if (!json || typeof json !== 'string') {
                return [];
            }
            
            const trimmedJson = json.trim();
            if (trimmedJson === '' || trimmedJson === '{}') {
                return [];
            }
            
            const parsed = JSON.parse(trimmedJson);
            
            // Check if parsed has the expected structure
            if (!parsed || typeof parsed !== 'object') {
                return [];
            }
            
            if (!parsed.nodes) {
                return [];
            }
            
            const tree: { name: string; type: string; props: any; children: any[] }[] = [];

            // Find all root-level nodes (nodes without parents)
            const nodesMap = parsed.nodes || {};
            const childParentMap: Record<string, string> = {};
            
            // Build parent-child relationship map
            Object.entries(nodesMap).forEach(([nodeId, nodeData]: [string, any]) => {
                if (nodeData.data?.parent) {
                    childParentMap[nodeId] = nodeData.data.parent;
                }
            });

            // Find root nodes (nodes that are not children of other nodes)
            const rootNodeIds = Object.keys(nodesMap).filter(nodeId => !childParentMap[nodeId]);

            const traverse = (nodeId: string, result: any[]) => {
                const nodeData = nodesMap[nodeId];
                if (!nodeData) return;

                const data = nodeData.data || {};
                const type = data.type?.resolvedName || data.type || 'unknown';
                const props = data.props || {};
                const name = type.replace('Block', '').replace('Block', '');

                // Build display label with key properties
                let label = name;
                if (props.backgroundColor && props.backgroundColor !== 'transparent') {
                    label += ` (${props.backgroundColor})`;
                }
                if (props.flexDirection === 'row') {
                    label += ' [row]';
                } else if (props.flexDirection === 'column') {
                    label += ' [column]';
                }
                if (props.display === 'flex') label += ' flex';
                if (props.display === 'grid') label += ' grid';
                if (props.justifyContent && props.justifyContent !== 'flex-start') {
                    label += ` ${props.justifyContent}`;
                }

                // Get children from the node's data.nodes
                const childNodes: any[] = [];
                const childrenObj = data.nodes || {};
                Object.keys(childrenObj).forEach(childId => {
                    traverse(childId, childNodes);
                });

                result.push({ name: label, type, props, children: childNodes });
            };

            // Process all root nodes
            rootNodeIds.forEach(rootId => {
                traverse(rootId, tree);
            });

            return tree;
        } catch (e) {
            // Any error in parsing or processing - return empty tree
            console.error('Error building tree:', e);
            return [];
        }
    };

    // Render tree view
    const renderTree = (nodes: any[], indent: number = 0, isLast: boolean = true) => {
        return nodes.map((node, idx) => {
            const isLastItem = idx === nodes.length - 1;
            const connector = isLastItem ? '└── ' : '├── ';
            const childConnector = isLastItem ? '    ' : '│   ';
            
            return (
                <div key={idx}>
                    <div className="text-[10px] font-mono text-neutral-700 py-0.5">
                        <span className="text-neutral-400">{connector}</span>
                        <span className="font-semibold text-sky-600">{node.name}</span>
                        {node.props.width && <span className="text-neutral-400"> w:{node.props.width}</span>}
                        {node.props.height && <span className="text-neutral-400"> h:{node.props.height}</span>}
                        {node.props.padding && <span className="text-neutral-400"> p:{node.props.padding}</span>}
                    </div>
                    {node.children.length > 0 && (
                        <div style={{ paddingLeft: indent * 16 }}>
                            {renderTree(node.children, indent + 1, isLastItem)}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="w-full h-full bg-white flex flex-col relative z-20 shrink-0">
            {/* Header */}
            <div className="px-3 py-2 flex items-center justify-between bg-neutral-50 border-b">
                <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-neutral-500" />
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                        JSON Preview
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {!isEditing && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            className="h-6 w-6 p-0"
                            title="Copy to clipboard"
                        >
                            {copied ? (
                                <Check className="w-3 h-3 text-green-500" />
                            ) : (
                                <Copy className="w-3 h-3 text-neutral-500" />
                            )}
                        </Button>
                    )}
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-6 w-6 p-0"
                            title="Close"
                        >
                            <X className="w-4 h-4 text-neutral-500" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Action Bar */}
            <div className="px-3 py-2 flex items-center gap-2 border-b bg-neutral-50/50">
                <div className="flex items-center bg-neutral-100 rounded-md p-0.5">
                    <button
                        onClick={() => setViewMode("tree")}
                        className={`px-2 py-1 text-[10px] rounded ${viewMode === "tree" ? "bg-white shadow-sm text-sky-600 font-medium" : "text-neutral-500"}`}
                    >
                        Tree
                    </button>
                    <button
                        onClick={() => setViewMode("json")}
                        className={`px-2 py-1 text-[10px] rounded ${viewMode === "json" ? "bg-white shadow-sm text-sky-600 font-medium" : "text-neutral-500"}`}
                    >
                        JSON
                    </button>
                </div>
                {!isEditing && viewMode === "json" && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="h-6 w-6 p-0 ml-auto"
                        title="Copy to clipboard"
                    >
                        {copied ? (
                            <Check className="w-3 h-3 text-green-500" />
                        ) : (
                            <Copy className="w-3 h-3 text-neutral-500" />
                        )}
                    </Button>
                )}
                <Button
                    variant={isEditing ? "default" : "outline"}
                    size="sm"
                    onClick={handleEditToggle}
                    className="h-7 text-xs"
                >
                    {isEditing ? "Cancel" : "Edit"}
                </Button>
                {isEditing && (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="h-7 w-7 p-0"
                            title="Reset to current"
                        >
                            <RotateCcw className="w-3 h-3" />
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleApply}
                            disabled={!!parseError}
                            className="h-7 text-xs bg-green-600 hover:bg-green-700"
                        >
                            {applyStatus === "success" ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                            ) : applyStatus === "error" ? (
                                "Error"
                            ) : (
                                "Apply"
                            )}
                        </Button>
                    </>
                )}
            </div>

            {/* Parse Error Warning */}
            {parseError && isEditing && (
                <div className="px-3 py-1 bg-red-50 text-red-600 text-xs border-b border-red-100">
                    {parseError}
                </div>
            )}

            {/* JSON Content */}
            <div className="flex-1 overflow-auto p-3">
                {viewMode === "tree" ? (
                    <div className="font-mono">
                        <div className="text-[10px] font-bold text-neutral-800 mb-2">ROOT</div>
                        {jsonOutput && jsonOutput.trim() !== '' && jsonOutput.trim() !== '{}' ? (
                            renderTree(buildTree(jsonOutput))
                        ) : (
                            <div className="text-[10px] text-neutral-400 italic">No content in editor</div>
                        )}
                    </div>
                ) : isEditing ? (
                    <textarea
                        value={editedJson}
                        onChange={handleJsonChange}
                        className="w-full h-full min-h-[400px] text-[10px] font-mono text-neutral-600 bg-neutral-50 border border-neutral-200 rounded p-2 resize-none focus:outline-none focus:border-sky-500"
                        spellCheck={false}
                    />
                ) : (
                    <pre className="text-[10px] font-mono text-neutral-600 whitespace-pre-wrap break-all">
                        {formatJson(jsonOutput)}
                    </pre>
                )}
            </div>
        </div>
    );
};