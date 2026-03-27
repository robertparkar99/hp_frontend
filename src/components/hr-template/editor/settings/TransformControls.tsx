import React from "react";

interface TransformControlsProps {
    controls: {
        onResizeStart: (e: React.PointerEvent<HTMLDivElement>) => void;
        onResizeMove: (e: React.PointerEvent<HTMLDivElement>) => void;
        onRotateStart: (e: React.PointerEvent<HTMLDivElement>) => void;
        onRotateMove: (e: React.PointerEvent<HTMLDivElement>) => void;
        onDelete?: () => void;
    };
    handlers: {
        onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
        onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
        onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
        onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
    };
    children: React.ReactNode;
    selected?: boolean;
}

export const TransformControls = ({ controls, handlers, children, selected }: TransformControlsProps) => {
    return (
        <div className={`relative w-full h-full group/transform`}>
            {children}

            <div className={`absolute inset-0 pointer-events-none ${selected ? 'opacity-100' : 'opacity-0'} transition-opacity duration-150`}>
                {/* Floating Toolbar */}
                <div className="absolute -top-[48px] left-1/2 -translate-x-1/2 flex items-center gap-[8px] pointer-events-auto z-[9999]">
                    {/* Rotate Button */}
                    <div
                        className="w-[36px] h-[36px] rounded-full bg-white shadow-sm border border-neutral-200 text-neutral-600 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-neutral-50 transition-colors transform-handle"
                        onPointerDown={controls.onRotateStart}
                        onPointerMove={controls.onRotateMove}
                        onPointerUp={handlers.onPointerUp}
                        onPointerCancel={handlers.onPointerCancel}
                        title="Rotate"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                    </div>

                    {/* Move Button */}
                    <div
                        className="w-[36px] h-[36px] rounded-full bg-white shadow-sm border border-neutral-200 text-neutral-600 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-neutral-50 transition-colors move-handle pointer-events-auto"
                        onPointerDown={handlers.onPointerDown}
                        onPointerMove={handlers.onPointerMove}
                        onPointerUp={handlers.onPointerUp}
                        onPointerCancel={handlers.onPointerCancel}
                        title="Move"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="19 9 22 12 19 15"></polyline><polyline points="9 19 12 22 15 19"></polyline><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>
                    </div>

                    {/* Delete Button */}
                    {controls.onDelete && (
                        <div
                            className="w-[36px] h-[36px] rounded-full bg-white shadow-sm border border-neutral-200 text-red-500 flex items-center justify-center cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors transform-handle pointer-events-auto"
                            onPointerDown={(e) => { e.stopPropagation(); controls.onDelete!(); }}
                            title="Delete"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </div>
                    )}
                </div>

                {/* Purple Outline */}
                <div className="absolute inset-0 border-[1.5px] border-[#8b3dff]"></div>

                {/* Corner Resize Handles */}
                <div data-dir="nw" className="absolute -top-[6px] -left-[6px] w-[12px] h-[12px] bg-white border-[1.5px] border-[#8b3dff] rounded-full cursor-nwse-resize shadow-sm transform-handle pointer-events-auto" onPointerDown={controls.onResizeStart} onPointerMove={controls.onResizeMove} onPointerUp={handlers.onPointerUp} onPointerCancel={handlers.onPointerCancel} />
                <div data-dir="ne" className="absolute -top-[6px] -right-[6px] w-[12px] h-[12px] bg-white border-[1.5px] border-[#8b3dff] rounded-full cursor-nesw-resize shadow-sm transform-handle pointer-events-auto" onPointerDown={controls.onResizeStart} onPointerMove={controls.onResizeMove} onPointerUp={handlers.onPointerUp} onPointerCancel={handlers.onPointerCancel} />
                <div data-dir="sw" className="absolute -bottom-[6px] -left-[6px] w-[12px] h-[12px] bg-white border-[1.5px] border-[#8b3dff] rounded-full cursor-nesw-resize shadow-sm transform-handle pointer-events-auto" onPointerDown={controls.onResizeStart} onPointerMove={controls.onResizeMove} onPointerUp={handlers.onPointerUp} onPointerCancel={handlers.onPointerCancel} />
                <div data-dir="se" className="absolute -bottom-[6px] -right-[6px] w-[12px] h-[12px] bg-white border-[1.5px] border-[#8b3dff] rounded-full cursor-nwse-resize shadow-sm transform-handle pointer-events-auto" onPointerDown={controls.onResizeStart} onPointerMove={controls.onResizeMove} onPointerUp={handlers.onPointerUp} onPointerCancel={handlers.onPointerCancel} />

                {/* Edge Resize Handles (Pills) */}
                <div data-dir="n" className="absolute -top-[4px] left-1/2 -translate-x-1/2 w-[24px] h-[8px] bg-white border-[1.5px] border-[#8b3dff] rounded-full cursor-ns-resize shadow-sm transform-handle pointer-events-auto" onPointerDown={controls.onResizeStart} onPointerMove={controls.onResizeMove} onPointerUp={handlers.onPointerUp} onPointerCancel={handlers.onPointerCancel} />
                <div data-dir="s" className="absolute -bottom-[4px] left-1/2 -translate-x-1/2 w-[24px] h-[8px] bg-white border-[1.5px] border-[#8b3dff] rounded-full cursor-ns-resize shadow-sm transform-handle pointer-events-auto" onPointerDown={controls.onResizeStart} onPointerMove={controls.onResizeMove} onPointerUp={handlers.onPointerUp} onPointerCancel={handlers.onPointerCancel} />
                <div data-dir="w" className="absolute top-1/2 -translate-y-1/2 -left-[4px] w-[8px] h-[24px] bg-white border-[1.5px] border-[#8b3dff] rounded-full cursor-ew-resize shadow-sm transform-handle pointer-events-auto" onPointerDown={controls.onResizeStart} onPointerMove={controls.onResizeMove} onPointerUp={handlers.onPointerUp} onPointerCancel={handlers.onPointerCancel} />
                <div data-dir="e" className="absolute top-1/2 -translate-y-1/2 -right-[4px] w-[8px] h-[24px] bg-white border-[1.5px] border-[#8b3dff] rounded-full cursor-ew-resize shadow-sm transform-handle pointer-events-auto" onPointerDown={controls.onResizeStart} onPointerMove={controls.onResizeMove} onPointerUp={handlers.onPointerUp} onPointerCancel={handlers.onPointerCancel} />
            </div>
        </div>
    );
};
