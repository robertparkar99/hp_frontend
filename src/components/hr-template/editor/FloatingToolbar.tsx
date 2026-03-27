import React, { useState } from "react";
import { MousePointer2, Pen, Square, Minus, StickyNote, Type, PenLine, Highlighter, Eraser } from "lucide-react";
import { useEditor } from "@craftjs/core";
import { ShapeBlock } from "../blocks/ShapeBlock";

// Custom icons for line types
const StraightLineIcon = ({ className }: { className?: string }) => <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="19" x2="19" y2="5"></line><circle cx="5" cy="19" r="2" fill="currentColor" /><circle cx="19" cy="5" r="2" fill="currentColor" /></svg>;
const CurvedLineIcon = ({ className }: { className?: string }) => <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 19 C 10 19, 14 5, 19 5"></path><circle cx="5" cy="19" r="2" fill="currentColor" /><circle cx="19" cy="5" r="2" fill="currentColor" /></svg>;
const ElbowLineIcon = ({ className }: { className?: string }) => <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 19 L 5 5 L 19 5"></path><circle cx="5" cy="19" r="2" fill="currentColor" /><circle cx="19" cy="5" r="2" fill="currentColor" /></svg>;

export type WhiteboardTool =
    | 'select'
    | 'draw_pen' | 'draw_marker' | 'draw_highlighter' | 'draw_eraser'
    | 'shapes'
    | 'line_straight' | 'line_curved' | 'line_elbow'
    | 'sticky'
    | 'text';

interface FloatingToolbarProps {
    activeTool: WhiteboardTool;
    setActiveTool: (tool: WhiteboardTool) => void;
    openToolboxTab: (tab: string) => void;
}

export const FloatingToolbar = ({ activeTool, setActiveTool, openToolboxTab }: FloatingToolbarProps) => {
    const { connectors } = useEditor();
    const [hoveredTool, setHoveredTool] = useState<string | null>(null);

    const isDrawTool = activeTool.startsWith('draw');
    const isLineTool = activeTool.startsWith('line');

    return (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-50 flex">
            {/* Main Toolbar */}
            <div className="bg-white/90 backdrop-blur-xl rounded-[28px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white max-w-min ring-1 ring-black/[0.03] p-2 flex flex-col gap-2 relative z-10">
                {/* Select */}
                <button
                    type="button"
                    onClick={() => setActiveTool('select')}
                    className={`p-3 rounded-2xl transition-all duration-200 group ${activeTool === 'select' ? 'bg-sky-50 shadow-inner border border-sky-100/50' : 'hover:bg-sky-50/50 border border-transparent'}`}
                    title="Select (V)"
                >
                    <MousePointer2 className={`w-5 h-5 transition-transform duration-200 ${activeTool === 'select' ? 'text-sky-600 drop-shadow-md scale-110' : 'text-slate-500 group-hover:text-sky-500 group-hover:scale-110'}`} />
                </button>

                {/* Draw Group */}
                <div
                    className="relative flex items-center"
                    onMouseEnter={() => setHoveredTool('draw')}
                    onMouseLeave={() => setHoveredTool(null)}
                >
                    <button
                        type="button"
                        onClick={() => setActiveTool('draw_pen')}
                        className={`p-3 rounded-2xl transition-all duration-200 group ${isDrawTool ? 'bg-pink-50 shadow-inner border border-pink-100/50' : 'hover:bg-pink-50/50 border border-transparent'}`}
                        title="Draw (P)"
                    >
                        {activeTool === 'draw_highlighter' ? <Highlighter className="w-5 h-5 text-yellow-500 drop-shadow-md scale-110" /> :
                            activeTool === 'draw_marker' ? <PenLine className="w-5 h-5 text-red-500 drop-shadow-md scale-110" /> :
                                activeTool === 'draw_eraser' ? <Eraser className="w-5 h-5 text-slate-700 drop-shadow-md scale-110" /> :
                                    <Pen className={`w-5 h-5 transition-transform duration-200 ${isDrawTool ? 'text-pink-600 drop-shadow-md scale-110' : 'text-slate-500 group-hover:text-pink-500 group-hover:scale-110'}`} />}
                    </button>

                    {/* Draw Flyout - Wrapped in a padding container to bridge the hover gap */}
                    {hoveredTool === 'draw' && (
                        <div className="absolute left-full top-0 pl-2 h-full z-50">
                            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-white/50 ring-1 ring-black/[0.03] p-2 flex flex-col gap-1 min-w-[130px] animate-in slide-in-from-left-2 fade-in duration-200">
                                <button type="button" onClick={() => setActiveTool('draw_pen')} className={`p-2 rounded-xl flex items-center gap-3 hover:bg-neutral-50 transition-colors ${activeTool === 'draw_pen' ? 'bg-sky-50 text-sky-600' : 'text-neutral-700'}`}>
                                    <Pen className="w-4 h-4 text-slate-800" /> <span className="text-xs font-semibold">Pen</span>
                                </button>
                                <button type="button" onClick={() => setActiveTool('draw_marker')} className={`p-2 rounded-xl flex items-center gap-3 hover:bg-neutral-50 transition-colors ${activeTool === 'draw_marker' ? 'bg-sky-50 text-sky-600' : 'text-neutral-700'}`}>
                                    <PenLine className="w-4 h-4 text-red-500" /> <span className="text-xs font-semibold">Marker</span>
                                </button>
                                <button type="button" onClick={() => setActiveTool('draw_highlighter')} className={`p-2 rounded-xl flex items-center gap-3 hover:bg-neutral-50 transition-colors ${activeTool === 'draw_highlighter' ? 'bg-sky-50 text-sky-600' : 'text-neutral-700'}`}>
                                    <Highlighter className="w-4 h-4 text-yellow-500" /> <span className="text-xs font-semibold">Highlight</span>
                                </button>
                                <div className="h-px bg-neutral-100 w-full my-1 border-0"></div>
                                <button type="button" onClick={() => setActiveTool('draw_eraser')} className={`p-2 rounded-xl flex items-center gap-3 hover:bg-red-50 hover:text-red-600 transition-colors ${activeTool === 'draw_eraser' ? 'bg-red-50 text-red-600' : 'text-neutral-700'}`}>
                                    <Eraser className="w-4 h-4" /> <span className="text-xs font-semibold">Eraser</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Shapes */}
                <button
                    type="button"
                    onClick={() => { setActiveTool('shapes'); openToolboxTab('shapes'); }}
                    className={`p-3 rounded-2xl transition-all duration-200 group ${activeTool === 'shapes' ? 'bg-orange-50 shadow-inner border border-orange-100/50' : 'hover:bg-orange-50/50 border border-transparent'}`}
                    title="Shapes (S)"
                >
                    <Square className={`w-5 h-5 transition-transform duration-200 ${activeTool === 'shapes' ? 'text-orange-600 fill-orange-500/20 drop-shadow-md scale-110' : 'text-slate-500 fill-slate-500/10 group-hover:text-orange-500 group-hover:fill-orange-500/20 group-hover:scale-110'}`} />
                </button>

                {/* Lines Group */}
                <div
                    className="relative flex items-center"
                    onMouseEnter={() => setHoveredTool('line')}
                    onMouseLeave={() => setHoveredTool(null)}
                >
                    <button
                        type="button"
                        onClick={() => setActiveTool('line_straight')}
                        className={`p-3 rounded-2xl transition-all duration-200 group ${isLineTool ? 'bg-cyan-50 shadow-inner border border-cyan-100/50' : 'hover:bg-cyan-50/50 border border-transparent'}`}
                        title="Line (L)"
                    >
                        {activeTool === 'line_curved' ? <CurvedLineIcon className="w-5 h-5 text-cyan-600 drop-shadow-md scale-110" /> :
                            activeTool === 'line_elbow' ? <ElbowLineIcon className="w-5 h-5 text-cyan-600 drop-shadow-md scale-110" /> :
                                <Minus className={`w-5 h-5 stroke-[3] transition-transform duration-200 ${isLineTool ? 'text-cyan-600 drop-shadow-md scale-110' : 'text-slate-500 group-hover:text-cyan-500 group-hover:scale-110'}`} />}
                    </button>

                    {/* Line Flyout */}
                    {hoveredTool === 'line' && (
                        <div className="absolute left-full top-0 pl-2 h-full z-50">
                            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-white/50 ring-1 ring-black/[0.03] p-2 flex flex-col gap-1 min-w-[130px] animate-in slide-in-from-left-2 fade-in duration-200">
                                <button type="button" onClick={() => setActiveTool('line_straight')} className={`p-2 rounded-xl flex items-center gap-3 hover:bg-neutral-50 transition-colors ${activeTool === 'line_straight' ? 'bg-sky-50 text-sky-600' : 'text-neutral-700'}`}>
                                    <StraightLineIcon className="w-4 h-4 text-slate-800" /> <span className="text-xs font-semibold">Straight</span>
                                </button>
                                <button type="button" onClick={() => setActiveTool('line_curved')} className={`p-2 rounded-xl flex items-center gap-3 hover:bg-neutral-50 transition-colors ${activeTool === 'line_curved' ? 'bg-sky-50 text-sky-600' : 'text-neutral-700'}`}>
                                    <CurvedLineIcon className="w-4 h-4 text-slate-800" /> <span className="text-xs font-semibold">Curved</span>
                                </button>
                                <button type="button" onClick={() => setActiveTool('line_elbow')} className={`p-2 rounded-xl flex items-center gap-3 hover:bg-neutral-50 transition-colors ${activeTool === 'line_elbow' ? 'bg-sky-50 text-sky-600' : 'text-neutral-700'}`}>
                                    <ElbowLineIcon className="w-4 h-4 text-slate-800" /> <span className="text-xs font-semibold">Elbow</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sticky Note */}
                <button
                    type="button"
                    onClick={() => { setActiveTool('sticky'); openToolboxTab('shapes'); }}
                    className={`p-3 rounded-2xl transition-all duration-200 group ${activeTool === 'sticky' ? 'bg-amber-50 shadow-inner border border-amber-100/50' : 'hover:bg-amber-50/50 border border-transparent'}`}
                    title="Sticky Note (N)"
                >
                    <StickyNote className={`w-5 h-5 transition-transform duration-200 ${activeTool === 'sticky' ? 'text-amber-500 fill-amber-400 drop-shadow-md scale-110' : 'text-slate-500 fill-slate-200/50 group-hover:text-amber-500 group-hover:fill-amber-400 group-hover:scale-110'}`} />
                </button>

                {/* Text */}
                <button
                    type="button"
                    onClick={() => { setActiveTool('text'); openToolboxTab('text'); }}
                    className={`p-3 rounded-2xl transition-all duration-200 group ${activeTool === 'text' ? 'bg-purple-50 shadow-inner border border-purple-100/50' : 'hover:bg-purple-50/50 border border-transparent'}`}
                    title="Text (T)"
                >
                    <Type className={`w-5 h-5 font-serif transition-transform duration-200 ${activeTool === 'text' ? 'text-purple-600 drop-shadow-md scale-110' : 'text-slate-500 group-hover:text-purple-600 group-hover:scale-110'}`} />
                </button>

            </div>
        </div>
    );
};
