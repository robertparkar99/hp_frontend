"use client";
import React, { useState } from "react";
import { useEditor } from "@craftjs/core";
import { Type, UploadCloud, Shapes, Square, X, Circle, Triangle, Star, Hexagon, Frame, Wrench, LayoutGrid, Table } from "lucide-react";

import { TextBlock } from "../blocks/TextBlock";
import { ImageBlock } from "../blocks/ImageBlock";
import { ContainerBlock } from "../blocks/ContainerBlock";
import { ShapeBlock } from "../blocks/ShapeBlock";
import { TableBlock } from "../blocks/TableBlock";

export const Toolbox = ({ activeTab, setActiveTab, isFloatingToolbarVisible, toggleFloatingToolbar }: { activeTab: string | null, setActiveTab: (tab: string | null) => void, isFloatingToolbarVisible?: boolean, toggleFloatingToolbar?: () => void }) => {
    const { connectors, actions, query } = useEditor();
    const selectedNodeId = useEditor((state) => state.events.selected);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Track instance numbers for each shape type using ref to persist across re-renders
    const shapeCountersRef = React.useRef<Record<string, number>>({});

    // Helper function to get and increment shape instance counter
    const getShapeInstanceNumber = (shapeType: string): number => {
        const currentCount = shapeCountersRef.current[shapeType] || 0;
        const newCount = currentCount + 1;
        shapeCountersRef.current = { ...shapeCountersRef.current, [shapeType]: newCount };
        return newCount;
    };

    // Helper function to determine parent ID based on selection
    const getParentId = (): string => {
        if (selectedNodeId && selectedNodeId.size > 0) {
            const firstSelectedId = Array.from(selectedNodeId)[0] as string;
            const selectedNode = query.node(firstSelectedId).get();
            if (selectedNode) {
                const nodeData = selectedNode.data;
                if (nodeData) {
                    const nodeName = nodeData.name;
                    // Check if it's a container-like element that can accept children
                    if (nodeName === 'Container' || nodeName === 'Grid' || nodeName === 'Frame') {
                        return firstSelectedId;
                    }
                }
            }
        }
        return "ROOT";
    };

    const toggleTab = (tab: string) => {
        setActiveTab(activeTab === tab ? null : tab);
    };

    return (
        <div className="relative flex h-full">
            {/* Main Thin Sidebar Strip */}
            <div className="bg-white/95 backdrop-blur-xl border-r border-sky-100/60 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.05)] w-20 z-20 flex flex-col items-center py-4 space-y-2 shrink-0 h-full overflow-y-auto relative">

                <div
                    onClick={() => toggleTab('text')}
                    className={`flex flex-col items-center justify-center w-16 h-16 cursor-pointer rounded-2xl transition-all duration-200 group ${activeTab === 'text' ? 'bg-sky-50 shadow-inner border border-sky-200/50' : 'hover:bg-sky-50/50 border border-transparent'}`}
                >
                    <Type className={`w-6 h-6 mb-1 transition-transform duration-200 ${activeTab === 'text' ? 'scale-110 text-sky-600 drop-shadow-md' : 'text-slate-500 group-hover:scale-110 group-hover:text-sky-500'}`} strokeWidth={1.5} />
                    <span className={`text-[10px] font-bold tracking-wide transition-colors ${activeTab === 'text' ? 'text-sky-600' : 'text-slate-500 group-hover:text-sky-500'}`}>Text</span>
                </div>

                <div
                    onClick={() => toggleTab('uploads')}
                    className={`flex flex-col items-center justify-center w-16 h-16 cursor-pointer rounded-2xl transition-all duration-200 group ${activeTab === 'uploads' ? 'bg-sky-50 shadow-inner border border-sky-200/50' : 'hover:bg-sky-50/50 border border-transparent'}`}
                >
                    <UploadCloud className={`w-6 h-6 mb-1 transition-transform duration-200 ${activeTab === 'uploads' ? 'scale-110 text-sky-600 drop-shadow-md' : 'text-slate-500 group-hover:scale-110 group-hover:text-sky-500'}`} strokeWidth={1.5} />
                    <span className={`text-[10px] font-bold tracking-wide transition-colors ${activeTab === 'uploads' ? 'text-sky-600' : 'text-slate-500 group-hover:text-sky-500'}`}>Uploads</span>
                </div>

                <div
                    onClick={() => toggleTab('shapes')}
                    className={`flex flex-col items-center justify-center w-16 h-16 cursor-pointer rounded-2xl transition-all duration-200 group ${activeTab === 'shapes' ? 'bg-sky-50 shadow-inner border border-sky-200/50' : 'hover:bg-sky-50/50 border border-transparent'}`}
                >
                    <Shapes className={`w-6 h-6 mb-1 transition-transform duration-200 ${activeTab === 'shapes' ? 'scale-110 text-sky-600 drop-shadow-md' : 'text-slate-500 group-hover:scale-110 group-hover:text-sky-500'}`} strokeWidth={1.5} />
                    <span className={`text-[10px] font-bold tracking-wide transition-colors ${activeTab === 'shapes' ? 'text-sky-600' : 'text-slate-500 group-hover:text-sky-500'}`}>Shapes</span>
                </div>

                <div
                    onClick={() => toggleTab('tables')}
                    className={`flex flex-col items-center justify-center w-16 h-16 cursor-pointer rounded-2xl transition-all duration-200 group ${activeTab === 'tables' ? 'bg-sky-50 shadow-inner border border-sky-200/50' : 'hover:bg-sky-50/50 border border-transparent'}`}
                >
                    <Table className={`w-6 h-6 mb-1 transition-transform duration-200 ${activeTab === 'tables' ? 'scale-110 text-sky-600 drop-shadow-md' : 'text-slate-500 group-hover:scale-110 group-hover:text-sky-500'}`} strokeWidth={1.5} />
                    <span className={`text-[10px] font-bold tracking-wide transition-colors ${activeTab === 'tables' ? 'text-sky-600' : 'text-slate-500 group-hover:text-sky-500'}`}>Tables</span>
                </div>

                <div
                    onClick={() => toggleTab('frames')}
                    className={`flex flex-col items-center justify-center w-16 h-16 cursor-pointer rounded-2xl transition-all duration-200 group ${activeTab === 'frames' ? 'bg-sky-50 shadow-inner border border-sky-200/50' : 'hover:bg-sky-50/50 border border-transparent'}`}
                >
                    <Frame className={`w-6 h-6 mb-1 transition-transform duration-200 ${activeTab === 'frames' ? 'scale-110 text-sky-600 drop-shadow-md' : 'text-slate-500 group-hover:scale-110 group-hover:text-sky-500'}`} strokeWidth={1.5} />
                    <span className={`text-[10px] font-bold tracking-wide transition-colors ${activeTab === 'frames' ? 'text-sky-600' : 'text-slate-500 group-hover:text-sky-500'}`}>Frames</span>
                </div>

                <div
                    onClick={() => toggleFloatingToolbar && toggleFloatingToolbar()}
                    className={`flex flex-col items-center justify-center w-16 h-16 cursor-pointer rounded-2xl transition-all duration-200 group ${isFloatingToolbarVisible ? 'bg-sky-50 shadow-inner border border-sky-200/50' : 'hover:bg-sky-50/50 border border-transparent'}`}
                >
                    <Wrench className={`w-6 h-6 mb-1 transition-transform duration-200 ${isFloatingToolbarVisible ? 'scale-110 text-sky-600 drop-shadow-md' : 'text-slate-500 group-hover:scale-110 group-hover:text-sky-500'}`} strokeWidth={1.5} />
                    <span className={`text-[10px] font-bold tracking-wide transition-colors ${isFloatingToolbarVisible ? 'text-sky-600' : 'text-slate-500 group-hover:text-sky-500'}`}>Tools</span>
                </div>

            </div>

            {/* Slide Out Panel */}
            <div className={`absolute top-0 left-20 h-full bg-white/95 backdrop-blur-3xl border-r border-sky-100/60 shadow-[30px_0_60px_-15px_rgba(0,0,0,0.1)] z-10 w-72 transition-transform duration-300 ease-in-out flex flex-col ${activeTab ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Panel Header */}
                <div className="flex items-center justify-between p-4 border-b border-sky-100/60 bg-white/50">
                    <h3 className="font-bold text-neutral-800 capitalize tracking-tight">{activeTab || ''}</h3>
                    <button onClick={() => setActiveTab(null)} className="p-1.5 rounded-xl text-neutral-400 hover:text-sky-600 hover:bg-sky-50 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Panel Content Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

                    {/* TEXT TAB CONTENT */}
                    {activeTab === 'text' && (
                        <>
                            <div
                                ref={(ref) => {
                                    if (ref) connectors.create(ref, <TextBlock />);
                                }}
                                onClick={() => {
                                    const nodeTree = query.parseReactElement(<TextBlock html="<p>Type your text here</p>" fontSize={16} width={300} />).toNodeTree();
                                    actions.addNodeTree(nodeTree, getParentId());
                                }}
                                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl p-3 flex items-center justify-center text-sm font-semibold cursor-pointer shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] hover:-translate-y-[1px] transition-all mb-4"
                            >
                                <Type className="w-4 h-4 mr-2" /> Add a text box
                            </div>

                            <div className="text-sm font-semibold text-neutral-800 mb-2 mt-2">Default text styles</div>

                            <div className="flex flex-col gap-2">
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <TextBlock html="<h1>Add a heading</h1>" fontSize={36} bold={true} width={400} />);
                                    }}
                                    className="border border-sky-100/50 rounded-xl p-4 cursor-move hover:border-sky-300 hover:bg-sky-50 transition-all bg-white/80 shadow-sm flex items-center"
                                >
                                    <span className="text-3xl font-bold font-sans text-neutral-800 leading-none tracking-tight">Add a heading</span>
                                </div>

                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <TextBlock html="<h2>Add a subheading</h2>" fontSize={24} bold={true} width={300} />);
                                    }}
                                    className="border border-sky-100/50 rounded-xl p-4 cursor-move hover:border-sky-300 hover:bg-sky-50 transition-all bg-white/80 shadow-sm flex items-center"
                                >
                                    <span className="text-xl font-bold font-sans text-neutral-700 leading-tight">Add a subheading</span>
                                </div>

                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <TextBlock html="<p>Add a little bit of body text</p>" fontSize={16} width={250} />);
                                    }}
                                    className="border border-sky-100/50 rounded-xl p-3 cursor-move hover:border-sky-300 hover:bg-sky-50 transition-all bg-white/80 shadow-sm flex items-center"
                                >
                                    <span className="text-sm font-normal font-sans text-neutral-600">Add a little bit of body text</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* UPLOADS TAB CONTENT */}
                    {activeTab === 'uploads' && (
                        <>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                ref={fileInputRef}
                                className="hidden"
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    files.forEach(file => {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            if (typeof reader.result === 'string') {
                                                setUploadedImages(prev => [reader.result as string, ...prev]);
                                            }
                                        };
                                        reader.readAsDataURL(file);
                                    });
                                }}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white w-full py-2.5 rounded-xl text-sm font-medium shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] hover:-translate-y-[1px] transition-all mb-4"
                            >
                                Upload files
                            </button>

                            <div className="text-[10px] font-bold text-sky-600 uppercase tracking-widest mb-2">Images</div>

                            {uploadedImages.length === 0 ? (
                                <div className="text-center p-6 border-2 border-dashed border-neutral-200 rounded-lg text-neutral-400">
                                    <UploadCloud className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-xs">No images uploaded yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {uploadedImages.map((src, i) => (
                                        <div
                                            key={i}
                                            ref={(ref) => {
                                                if (ref) connectors.create(ref, <ImageBlock src={src} objectFit="contain" frameShape="none" />);
                                            }}
                                            className="aspect-square bg-neutral-100 rounded-lg cursor-move overflow-hidden group relative flex items-center justify-center border border-neutral-200 hover:border-primary transition-colors"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={src} alt={`Uploaded ${i}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-[10px] font-medium px-2 py-1 rounded bg-black/50">Drag to add</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* SHAPES TAB CONTENT */}
                    {activeTab === 'shapes' && (
                        <>
                            <div className="text-[10px] font-bold text-sky-600 uppercase tracking-widest mb-2">Shapes</div>
                            <div className="grid grid-cols-3 gap-2 mb-6">
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="square" instanceNumber={getShapeInstanceNumber('square')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('square');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="square" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-center p-2"
                                    title="Square"
                                >
                                    <Square className="w-full h-full text-sky-500 fill-sky-400/20 drop-shadow-sm" />
                                </div>
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="rounded-square" instanceNumber={getShapeInstanceNumber('rounded-square')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('rounded-square');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="rounded-square" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-[1] bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-2xl flex items-center justify-center p-2 cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all group"
                                    title="Rounded Square"
                                >
                                    <div className="w-full h-full rounded-xl bg-sky-200/50 border border-sky-400 group-hover:bg-sky-300/60 transition-colors"></div>
                                </div>
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="circle" instanceNumber={getShapeInstanceNumber('circle')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('circle');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="circle" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-[1] bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-full flex items-center justify-center p-2 cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all group"
                                    title="Circle"
                                >
                                    <div className="w-full h-full rounded-full bg-sky-200/50 border border-sky-400 group-hover:bg-sky-300/60 transition-colors"></div>
                                </div>
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="triangle" instanceNumber={getShapeInstanceNumber('triangle')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('triangle');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="triangle" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-center"
                                    title="Triangle"
                                >
                                    <Triangle className="w-8 h-8 text-sky-500 fill-sky-400/20 drop-shadow-sm" />
                                </div>
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="star" instanceNumber={getShapeInstanceNumber('star')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('star');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="star" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-center"
                                    title="Star"
                                >
                                    <Star className="w-8 h-8 text-sky-500 fill-sky-400/20 drop-shadow-sm" />
                                </div>
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="hexagon" instanceNumber={getShapeInstanceNumber('hexagon')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('hexagon');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="hexagon" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-center"
                                    title="Hexagon"
                                >
                                    <Hexagon className="w-8 h-8 text-sky-500 fill-sky-400/20 drop-shadow-sm" />
                                </div>
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="diamond" instanceNumber={getShapeInstanceNumber('diamond')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('diamond');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="diamond" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-center"
                                    title="Diamond"
                                >
                                    <svg width="28" height="28" viewBox="0 0 100 100" className="text-sky-500 fill-sky-400/20 drop-shadow-sm"><polygon points="50,0 100,50 50,100 0,50" /></svg>
                                </div>
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="pentagon" instanceNumber={getShapeInstanceNumber('pentagon')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('pentagon');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="pentagon" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-center"
                                    title="Pentagon"
                                >
                                    <svg width="28" height="28" viewBox="0 0 100 100" className="text-sky-500 fill-sky-400/20 drop-shadow-sm"><polygon points="50,0 100,38 82,100 18,100 0,38" /></svg>
                                </div>
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="octagon" instanceNumber={getShapeInstanceNumber('octagon')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('octagon');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="octagon" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-center"
                                    title="Octagon"
                                >
                                    <svg width="28" height="28" viewBox="0 0 100 100" className="text-sky-500 fill-sky-400/20 drop-shadow-sm"><polygon points="30,0 70,0 100,30 100,70 70,100 30,100 0,70 0,30" /></svg>
                                </div>
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="cross" instanceNumber={getShapeInstanceNumber('cross')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('cross');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="cross" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-center"
                                    title="Cross"
                                >
                                    <svg width="32" height="32" viewBox="0 0 100 100" className="text-sky-500 fill-sky-400/20 drop-shadow-sm"><polygon points="35,0 65,0 65,35 100,35 100,65 65,65 65,100 35,100 35,65 0,65 0,35 35,35" /></svg>
                                </div>
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="arrow" instanceNumber={getShapeInstanceNumber('arrow')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('arrow');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="arrow" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-center"
                                    title="Arrow"
                                >
                                    <svg width="32" height="32" viewBox="0 0 100 100" className="text-sky-500 fill-sky-400/20 drop-shadow-sm"><polygon points="0,35 60,35 60,15 100,50 60,85 60,65 0,65" /></svg>
                                </div>
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="parallelogram" instanceNumber={getShapeInstanceNumber('parallelogram')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('parallelogram');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="parallelogram" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-center"
                                    title="Parallelogram"
                                >
                                    <svg width="28" height="28" viewBox="0 0 100 100" className="text-sky-500 fill-sky-400/20 drop-shadow-sm"><polygon points="25,0 100,0 75,100 0,100" /></svg>
                                </div>
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="trapezoid" instanceNumber={getShapeInstanceNumber('trapezoid')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('trapezoid');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="trapezoid" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-center"
                                    title="Trapezoid"
                                >
                                    <svg width="28" height="28" viewBox="0 0 100 100" className="text-sky-500 fill-sky-400/20 drop-shadow-sm"><polygon points="20,0 80,0 100,100 0,100" /></svg>
                                </div>
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="right-triangle" instanceNumber={getShapeInstanceNumber('right-triangle')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('right-triangle');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="right-triangle" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-center"
                                    title="Right Triangle"
                                >
                                    <svg width="28" height="28" viewBox="0 0 100 100" className="text-sky-500 fill-sky-400/20 drop-shadow-sm"><polygon points="0,0 100,100 0,100" /></svg>
                                </div>
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="chevron" instanceNumber={getShapeInstanceNumber('chevron')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('chevron');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="chevron" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-center"
                                    title="Chevron"
                                >
                                    <svg width="28" height="28" viewBox="0 0 100 100" className="text-sky-500 fill-sky-400/20 drop-shadow-sm"><polygon points="75,0 100,50 75,100 0,100 25,50 0,0" /></svg>
                                </div>
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="ribbon" instanceNumber={getShapeInstanceNumber('ribbon')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('ribbon');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="ribbon" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-center"
                                    title="Ribbon"
                                >
                                    <svg width="28" height="28" viewBox="0 0 100 100" className="text-sky-500 fill-sky-400/20 drop-shadow-sm"><polygon points="0,0 100,0 100,100 50,75 0,100" /></svg>
                                </div>
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="message" instanceNumber={getShapeInstanceNumber('message')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('message');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="message" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-center"
                                    title="Message"
                                >
                                    <svg width="28" height="28" viewBox="0 0 100 100" className="text-sky-500 fill-sky-400/20 drop-shadow-sm"><polygon points="0,0 100,0 100,75 75,75 75,100 50,75 0,75" /></svg>
                                </div>
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="tag" instanceNumber={getShapeInstanceNumber('tag')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('tag');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="tag" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-center"
                                    title="Tag"
                                >
                                    <svg width="28" height="28" viewBox="0 0 100 100" className="text-sky-500 fill-sky-400/20 drop-shadow-sm"><polygon points="0,0 75,0 100,50 75,100 0,100" /></svg>
                                </div>
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="shield" instanceNumber={getShapeInstanceNumber('shield')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('shield');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="shield" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-center"
                                    title="Shield"
                                >
                                    <svg width="28" height="28" viewBox="0 0 100 100" className="text-sky-500 fill-sky-400/20 drop-shadow-sm"><polygon points="0,0 100,0 100,60 50,100 0,60" /></svg>
                                </div>
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="stairs" instanceNumber={getShapeInstanceNumber('stairs')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('stairs');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="stairs" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-center"
                                    title="Stairs"
                                >
                                    <svg width="28" height="28" viewBox="0 0 100 100" className="text-sky-500 fill-sky-400/20 drop-shadow-sm"><polygon points="0,0 50,0 50,50 100,50 100,100 0,100" /></svg>
                                </div>
                                <div
                                    ref={(ref) => {
                                        if (ref) connectors.create(ref, <ShapeBlock shapeType="beveled" instanceNumber={getShapeInstanceNumber('beveled')} />);
                                    }}
                                    onClick={() => {
                                        const instanceNum = getShapeInstanceNumber('beveled');
                                        const nodeTree = query.parseReactElement(<ShapeBlock shapeType="beveled" instanceNumber={instanceNum} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-move hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex items-center justify-center"
                                    title="Beveled"
                                >
                                    <svg width="28" height="28" viewBox="0 0 100 100" className="text-sky-500 fill-sky-400/20 drop-shadow-sm"><polygon points="20,0 80,0 100,20 100,80 80,100 20,100 0,80 0,20" /></svg>
                                </div>
                            </div>
                        </>
                    )}

                    {/* TABLES TAB CONTENT */}
                    {activeTab === 'tables' && (
                        <>
                            <div className="text-[10px] font-bold text-sky-600 uppercase tracking-widest mb-2">Tables</div>
                            
                            <div
                                onClick={() => {
                                    const nodeTree = query.parseReactElement(<TableBlock rows={3} cols={3} />).toNodeTree();
                                    actions.addNodeTree(nodeTree, getParentId());
                                }}
                                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl p-3 flex items-center justify-center text-sm font-semibold cursor-pointer shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] hover:-translate-y-[1px] transition-all mb-4"
                            >
                                <Table className="w-4 h-4 mr-2" /> Add a Table
                            </div>

                            <div className="text-[10px] font-bold text-sky-600 uppercase tracking-widest mb-2 mt-4">Quick Add</div>
                            
                            <div className="grid grid-cols-3 gap-2">
                                <div
                                    onClick={() => {
                                        const nodeTree = query.parseReactElement(<TableBlock rows={2} cols={2} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-pointer hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex flex-col items-center justify-center p-2"
                                    title="2x2 Table"
                                >
                                    <Table className="w-8 h-8 text-sky-500" />
                                    <span className="text-[10px] text-sky-600 mt-1">2×2</span>
                                </div>
                                <div
                                    onClick={() => {
                                        const nodeTree = query.parseReactElement(<TableBlock rows={3} cols={3} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-pointer hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex flex-col items-center justify-center p-2"
                                    title="3x3 Table"
                                >
                                    <Table className="w-8 h-8 text-sky-500" />
                                    <span className="text-[10px] text-sky-600 mt-1">3×3</span>
                                </div>
                                <div
                                    onClick={() => {
                                        const nodeTree = query.parseReactElement(<TableBlock rows={4} cols={4} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-pointer hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex flex-col items-center justify-center p-2"
                                    title="4x4 Table"
                                >
                                    <Table className="w-8 h-8 text-sky-500" />
                                    <span className="text-[10px] text-sky-600 mt-1">4×4</span>
                                </div>
                                <div
                                    onClick={() => {
                                        const nodeTree = query.parseReactElement(<TableBlock rows={2} cols={3} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-pointer hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex flex-col items-center justify-center p-2"
                                    title="2x3 Table"
                                >
                                    <Table className="w-8 h-8 text-sky-500" />
                                    <span className="text-[10px] text-sky-600 mt-1">2×3</span>
                                </div>
                                <div
                                    onClick={() => {
                                        const nodeTree = query.parseReactElement(<TableBlock rows={3} cols={4} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-pointer hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex flex-col items-center justify-center p-2"
                                    title="3x4 Table"
                                >
                                    <Table className="w-8 h-8 text-sky-500" />
                                    <span className="text-[10px] text-sky-600 mt-1">3×4</span>
                                </div>
                                <div
                                    onClick={() => {
                                        const nodeTree = query.parseReactElement(<TableBlock rows={5} cols={5} />).toNodeTree();
                                        actions.addNodeTree(nodeTree, getParentId());
                                    }}
                                    className="aspect-square bg-gradient-to-br from-slate-50 to-sky-50/30 border border-sky-100/50 rounded-xl cursor-pointer hover:bg-sky-50 hover:border-sky-300 hover:shadow-md transition-all flex flex-col items-center justify-center p-2"
                                    title="5x5 Table"
                                >
                                    <Table className="w-8 h-8 text-sky-500" />
                                    <span className="text-[10px] text-sky-600 mt-1">5×5</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* FRAMES TAB CONTENT */}
                    {activeTab === 'frames' && (
                        <>
                            <div className="text-[10px] font-bold text-sky-600 uppercase tracking-widest mb-2">Frames</div>
                            <div className="grid grid-cols-3 gap-2 mb-6">
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="none" />); }}
                                    className="aspect-square bg-gradient-to-br from-sky-300 to-blue-400 shadow-inner cursor-move hover:opacity-80 transition-opacity flex items-center justify-center rounded"
                                    title="Square Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white" />
                                </div>
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="circle" />); }}
                                    className="aspect-square bg-gradient-to-br from-sky-300 to-blue-400 shadow-inner cursor-move hover:opacity-80 transition-opacity flex items-center justify-center"
                                    style={{ clipPath: "circle(50% at 50% 50%)" }}
                                    title="Circle Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white" />
                                </div>
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="triangle" />); }}
                                    className="aspect-square bg-gradient-to-br from-sky-300 to-blue-400 shadow-inner cursor-move hover:opacity-80 transition-opacity flex items-center justify-center"
                                    style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
                                    title="Triangle Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white mt-4" />
                                </div>
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="diamond" />); }}
                                    className="aspect-square bg-gradient-to-br from-sky-300 to-blue-400 shadow-inner cursor-move hover:opacity-80 transition-opacity flex items-center justify-center"
                                    style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
                                    title="Diamond Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white" />
                                </div>
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="hexagon" />); }}
                                    className="aspect-square bg-gradient-to-br from-sky-300 to-blue-400 shadow-inner cursor-move hover:opacity-80 transition-opacity flex items-center justify-center"
                                    style={{ clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" }}
                                    title="Hexagon Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white" />
                                </div>
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="star" />); }}
                                    className="aspect-square bg-gradient-to-br from-sky-300 to-blue-400 shadow-inner cursor-move hover:opacity-80 transition-opacity flex items-center justify-center"
                                    style={{ clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" }}
                                    title="Star Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white mt-2" />
                                </div>
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="starburst" />); }}
                                    className="aspect-square bg-gradient-to-br from-sky-300 to-blue-400 shadow-inner cursor-move hover:opacity-80 transition-opacity flex items-center justify-center"
                                    style={{ clipPath: "polygon(50% 0%, 63% 15%, 85% 15%, 85% 37%, 100% 50%, 85% 63%, 85% 85%, 63% 85%, 50% 100%, 37% 85%, 15% 85%, 15% 63%, 0% 50%, 15% 37%, 15% 15%, 37% 15%)" }}
                                    title="Starburst Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white" />
                                </div>
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="pentagon" />); }}
                                    className="aspect-square bg-gradient-to-br from-sky-300 to-blue-400 shadow-inner cursor-move hover:opacity-80 transition-opacity flex items-center justify-center"
                                    style={{ clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" }}
                                    title="Pentagon Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white mt-2" />
                                </div>
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="octagon" />); }}
                                    className="aspect-square bg-gradient-to-br from-sky-300 to-blue-400 shadow-inner cursor-move hover:opacity-80 transition-opacity flex items-center justify-center"
                                    style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}
                                    title="Octagon Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white" />
                                </div>
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="cross" />); }}
                                    className="aspect-square bg-gradient-to-br from-sky-300 to-blue-400 shadow-inner cursor-move hover:opacity-80 transition-opacity flex items-center justify-center"
                                    style={{ clipPath: "polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%)" }}
                                    title="Cross Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white" />
                                </div>
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="arrow" />); }}
                                    className="aspect-square bg-gradient-to-br from-sky-300 to-blue-400 shadow-inner cursor-move hover:opacity-80 transition-opacity flex items-center justify-center"
                                    style={{ clipPath: "polygon(0% 35%, 60% 35%, 60% 15%, 100% 50%, 60% 85%, 60% 65%, 0% 65%)" }}
                                    title="Arrow Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white" />
                                </div>
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="parallelogram" />); }}
                                    className="aspect-square bg-gradient-to-br from-sky-300 to-blue-400 shadow-inner cursor-move hover:opacity-80 transition-opacity flex items-center justify-center"
                                    style={{ clipPath: "polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)" }}
                                    title="Parallelogram Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white" />
                                </div>
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="trapezoid" />); }}
                                    className="aspect-square bg-gradient-to-br from-sky-300 to-blue-400 shadow-inner cursor-move hover:opacity-80 transition-opacity flex items-center justify-center"
                                    style={{ clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)" }}
                                    title="Trapezoid Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white" />
                                </div>
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="right-triangle" />); }}
                                    className="aspect-square bg-gradient-to-br from-[#80d8ff] to-[#00b0ff] cursor-move hover:opacity-80 transition-opacity flex items-center justify-center"
                                    style={{ clipPath: "polygon(0% 0%, 100% 100%, 0% 100%)" }}
                                    title="Right Triangle Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white" />
                                </div>
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="chevron" />); }}
                                    className="aspect-square bg-gradient-to-br from-[#80d8ff] to-[#00b0ff] cursor-move hover:opacity-80 transition-opacity flex items-center justify-center"
                                    style={{ clipPath: "polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%)" }}
                                    title="Chevron Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white" />
                                </div>
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="ribbon" />); }}
                                    className="aspect-square bg-gradient-to-br from-[#80d8ff] to-[#00b0ff] cursor-move hover:opacity-80 transition-opacity flex items-center justify-center"
                                    style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 50% 75%, 0% 100%)" }}
                                    title="Ribbon Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white" />
                                </div>
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="message" />); }}
                                    className="aspect-square bg-gradient-to-br from-[#80d8ff] to-[#00b0ff] cursor-move hover:opacity-80 transition-opacity flex items-center justify-center"
                                    style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)" }}
                                    title="Message Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white" />
                                </div>
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="tag" />); }}
                                    className="aspect-square bg-gradient-to-br from-[#80d8ff] to-[#00b0ff] cursor-move hover:opacity-80 transition-opacity flex items-center justify-center"
                                    style={{ clipPath: "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)" }}
                                    title="Tag Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white" />
                                </div>
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="shield" />); }}
                                    className="aspect-square bg-gradient-to-br from-[#80d8ff] to-[#00b0ff] cursor-move hover:opacity-80 transition-opacity flex items-center justify-center"
                                    style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)" }}
                                    title="Shield Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white" />
                                </div>
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="stairs" />); }}
                                    className="aspect-square bg-gradient-to-br from-[#80d8ff] to-[#00b0ff] cursor-move hover:opacity-80 transition-opacity flex items-center justify-center"
                                    style={{ clipPath: "polygon(0% 0%, 50% 0%, 50% 50%, 100% 50%, 100% 100%, 0% 100%)" }}
                                    title="Stairs Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white" />
                                </div>
                                <div
                                    ref={(ref) => { if (ref) connectors.create(ref, <ImageBlock frameShape="beveled" />); }}
                                    className="aspect-square bg-gradient-to-br from-[#80d8ff] to-[#00b0ff] cursor-move hover:opacity-80 transition-opacity flex items-center justify-center"
                                    style={{ clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)" }}
                                    title="Beveled Frame"
                                >
                                    <UploadCloud className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div className="text-[10px] font-bold text-sky-600 uppercase tracking-widest mb-2 mt-6">Container</div>
                            <div
                                ref={(ref) => { if (ref) connectors.create(ref, <ContainerBlock />); }}
                                onClick={() => {
                                    const nodeTree = query.parseReactElement(<ContainerBlock />).toNodeTree();
                                    actions.addNodeTree(nodeTree, getParentId());
                                }}
                                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl p-4 flex items-center justify-center text-sm font-semibold cursor-pointer shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] hover:-translate-y-[1px] transition-all mb-4"
                            >
                                <LayoutGrid className="w-4 h-4 mr-2" /> Add a Container
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};
