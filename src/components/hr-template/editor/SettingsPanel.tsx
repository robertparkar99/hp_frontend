"use client";
import React from "react";
import { useEditor } from "@craftjs/core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { LayersPanel } from "./LayersPanel";

export const SettingsPanel = ({ onClose }: { onClose?: () => void }) => {
    const { selected, isEnabled } = useEditor((state, query) => {
        const currentNodeId = query.getEvent("selected").first();
        let selected;

        if (currentNodeId) {
            const node = state.nodes[currentNodeId];
            const nodeName = node?.data?.name as string;
            const props = node?.data?.props || {};
            
            // Map of component names to their displayName functions
            const displayNameMap: Record<string, (p: any) => string> = {
                'ShapeBlock': (p: any) => {
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
                    // Check for instanceNumber prop
                    const instanceNum = p?.instanceNumber;
                    return instanceNum ? `${baseName} ${instanceNum}` : baseName;
                },
                'TextBlock': (p: any) => p?.html ? `Text: ${p.html.substring(0, 20)}...` : 'Text',
                'ImageBlock': (p: any) => p?.src ? `Image: ${p.src.substring(0, 15)}...` : 'Image',
                'ContainerBlock': (p: any) => {
                    // Check for instanceNumber prop
                    const instanceNum = p?.instanceNumber;
                    return instanceNum ? `Container ${instanceNum}` : 'Container';
                },
                'ButtonBlock': (p: any) => {
                    // Check for instanceNumber prop
                    const instanceNum = p?.instanceNumber;
                    return instanceNum ? `Button ${instanceNum}` : 'Button';
                },
                'DividerBlock': () => 'Divider',
                'GridBlock': () => 'Grid',
                'TableBlock': () => 'Table',
                'DrawingBlock': () => 'Drawing',
                'LineBlock': (p: any) => `Line: ${p?.lineType || 'default'}`,
            };
            
            // Get display name - check custom map first, then fallback
            let displayName: string;
            if (nodeName && displayNameMap[nodeName]) {
                displayName = displayNameMap[nodeName](props);
            } else {
                displayName = nodeName || `Block ${currentNodeId.slice(0, 8)}`;
            }

            selected = {
                id: currentNodeId,
                name: displayName,
                settings:
                    node?.related &&
                    node?.related?.settings,
                props: node?.data?.props,
                isDeletable: query.node(currentNodeId).isDeletable(),
            };
        }

        return {
            selected,
            isEnabled: state.options.enabled,
        };
    });

    return (
        <div className="w-full flex flex-col h-full relative z-20">
            <div className="p-4 border-b border-sky-100/60 bg-white/50 flex flex-row items-center justify-between shrink-0">
                <h3 className="font-bold text-sm text-neutral-800 uppercase tracking-tight">
                    Settings
                </h3>
                {onClose && (
                    <button onClick={onClose} className="p-1 rounded-md hover:bg-neutral-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto w-full">
                {selected ? (
                    <Tabs defaultValue="design" className="w-full">
                        <TabsList className="w-full grid justify-start grid-flow-col auto-cols-auto rounded-none border-b border-sky-100 h-10 px-0 bg-sky-50/50 overflow-x-auto shadow-inner">
                            <TabsTrigger value="content" className="rounded-none px-4 data-[state=active]:bg-white/80 data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:text-sky-600 pb-2 pt-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-sky-500 transition-colors">Content</TabsTrigger>
                            <TabsTrigger value="design" className="rounded-none px-4 data-[state=active]:bg-white/80 data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:text-sky-600 pb-2 pt-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-sky-500 transition-colors">Design</TabsTrigger>
                            <TabsTrigger value="layers" className="rounded-none px-4 data-[state=active]:bg-white/80 data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:text-sky-600 pb-2 pt-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-sky-500 transition-colors">Layers</TabsTrigger>
                        </TabsList>

                        <TabsContent value="content" className="p-4 m-0">
                            <div className="text-xs text-muted-foreground pb-2 border-b mb-4">
                                Selected Component: <span className="font-mono text-foreground">{selected.name}</span>
                            </div>
                            {selected.settings ? (
                                React.createElement(selected.settings)
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No content settings for this block.
                                </p>
                            )}
                        </TabsContent>

                        <TabsContent value="design" className="p-4 m-0 flex flex-col space-y-6">
                            <p className="text-xs text-muted-foreground">Global design settings are available in the block's specific settings if supported.</p>
                            {selected.settings && React.createElement(selected.settings, { isDesignTab: true })}
                        </TabsContent>

                        <TabsContent value="layers" className="p-0 m-0 w-full h-full min-h-[300px] max-h-[70vh] overflow-y-auto">
                            <LayersPanel />
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="flex items-center justify-center h-40 text-sm text-muted-foreground p-4 text-center">
                        Select a block on the canvas to edit its properties.
                    </div>
                )}
            </div>
        </div>
    );
};
