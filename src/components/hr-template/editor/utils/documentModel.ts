/**
 * Utilities for normalizing and interacting with the document structure
 * for the Craft.js A4 document editor.
 */

export function createEmptyDocument() {
    return JSON.stringify({
        ROOT: {
            type: { resolvedName: "A4PageBlock" },
            isCanvas: true,
            props: {},
            displayName: "A4 Page",
            custom: {},
            hidden: false,
            nodes: [],
            linkedNodes: {}
        }
    });
}

/**
 * Normalizes an older layout-based or empty craft document to ensure
 * there is a safe A4PageBlock at the ROOT layer.
 */
export function normalizeTemplateDocument(jsonStr: string) {
    if (!jsonStr || jsonStr === "{}" || jsonStr === '""' || jsonStr.length <= 2) {
        return createEmptyDocument();
    }

    try {
        const doc = JSON.parse(jsonStr);

        // If ROOT exists and it is NOT an A4PageBlock, we must normalize it
        if (doc && doc.ROOT) {
            if (doc.ROOT.type?.resolvedName === "ContainerBlock" || doc.ROOT.type === "ContainerBlock" || typeof doc.ROOT.type === 'object') {
                 // Ensure type is just A4PageBlock string if it was old format
                 doc.ROOT.type = { resolvedName: "A4PageBlock" };
                 // Reset props that don't belong to a strict page
                 doc.ROOT.props = {};
            } else if (doc.ROOT.type === 'A4PageBlock' || typeof doc.ROOT.type === 'string') {
                doc.ROOT.type = { resolvedName: "A4PageBlock" };
                doc.ROOT.props = {};
            }
        } else {
            // Document corrupted or missing ROOT, reset
            return createEmptyDocument();
        }

        return JSON.stringify(doc);
    } catch (e) {
        console.error("Failed to parse and normalize template document.", e);
        return createEmptyDocument();
    }
}
