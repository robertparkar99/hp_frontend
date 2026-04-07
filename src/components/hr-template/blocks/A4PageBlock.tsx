import React from "react";
import { useNode, Element } from "@craftjs/core";

export const A4PageBlock = ({ children }: any) => {
    const { connectors: { connect } } = useNode();

    return (
        <div
            ref={(ref) => { if (ref) connect(ref); }}
            className="relative bg-white mx-auto w-full h-full"
            style={{
                width: "794px",
                height: "1123px",
                boxSizing: "border-box",
                overflow: "hidden" // Keep elements bounded to the A4 page
            }}
        >
            {/* Subtle print margin guide (not exported, visual only) */}
            <div className="absolute inset-8 border border-neutral-100/50 pointer-events-none z-0" data-html2canvas-ignore="true" />
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};

export const A4PageBlockSettings = () => {
    return (
        <div className="flex flex-col space-y-4 text-sm text-muted-foreground p-4">
            <p><strong>A4 Document Page</strong></p>
            <p>This is the root document layer.</p>
            <p>Dimensions: 210mm × 297mm (794px × 1123px at 96 DPI).</p>
            <p>You can drag items anywhere strictly inside this page layout.</p>
        </div>
    );
};

A4PageBlock.craft = {
    displayName: "A4 Page",
    props: {},
    rules: {
        canDrag: () => false, // Cannot drag the root page
        canDelete: () => false, // Cannot delete the root page
    },
    related: {
        settings: A4PageBlockSettings,
    }
};
