import React from "react";
import { useNode, Element } from "@craftjs/core";

export const DocumentContainer = ({ children }: any) => {
    const { connectors: { connect } } = useNode();

    return (
        <div
            ref={(ref) => { if (ref) connect(ref); }}
            className="flex flex-col items-center gap-8 py-4"
            style={{ minHeight: '100%' }}
        >
            {children}
        </div>
    );
};

export const DocumentContainerSettings = () => {
    return (
        <div className="flex flex-col space-y-4 text-sm text-muted-foreground p-4">
            <p><strong>Document Container</strong></p>
            <p>This is the root container for multiple pages.</p>
            <p>Use the "Add Page" button to add more A4 pages to your document.</p>
        </div>
    );
};

DocumentContainer.craft = {
    displayName: "Document",
    props: {},
    rules: {
        canDrag: () => false,
        canDelete: () => false,
    },
    related: {
        settings: DocumentContainerSettings,
    }
};
