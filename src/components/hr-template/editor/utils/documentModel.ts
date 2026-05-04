/**
 * Utilities for normalizing and interacting with the document structure
 * for the Craft.js A4 document editor.
 */

export function createEmptyDocument() {
    const pageId = "page_1";
    return JSON.stringify({
        ROOT: {
            type: { resolvedName: "DocumentContainer" },
            isCanvas: true,
            props: {},
            displayName: "Document",
            custom: {},
            hidden: false,
            nodes: [pageId],
            linkedNodes: {}
        },
        [pageId]: {
            type: { resolvedName: "A4PageBlock" },
            isCanvas: true,
            props: {},
            displayName: "A4 Page",
            custom: {},
            hidden: false,
            nodes: [],
            linkedNodes: {},
            parent: "ROOT"
        }
    });
}

export function createA4PageNodeTree(query: any) {
    const pageNode = query.parseSerializedNode({
        type: { resolvedName: "A4PageBlock" },
        isCanvas: true,
        props: {},
        displayName: "A4 Page",
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
        parent: null,
    }).toNode();

    return {
        rootNodeId: pageNode.id,
        nodes: {
            [pageNode.id]: pageNode,
        },
    };
}

export function scrollPageIntoView(pageId: string) {
    requestAnimationFrame(() => {
        document
            .querySelector(`[data-page-id="${pageId}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
}

/**
 * Normalizes an older layout-based or empty craft document to ensure
 * there is a safe DocumentContainer at the ROOT layer with at least one A4PageBlock.
 */
export function normalizeTemplateDocument(jsonStr: string) {
    if (!jsonStr || jsonStr === "{}" || jsonStr === '""' || jsonStr.length <= 2) {
        return createEmptyDocument();
    }

    try {
        const doc = JSON.parse(jsonStr);

        // If ROOT exists and it is an old A4PageBlock directly, convert to new structure
        if (doc && doc.ROOT && doc.ROOT.type?.resolvedName === "A4PageBlock") {
            // Create new structure with DocumentContainer as ROOT
            const oldRoot = doc.ROOT;
            const pageId = "page_1";

            doc.ROOT = {
                type: { resolvedName: "DocumentContainer" },
                isCanvas: true,
                props: {},
                displayName: "Document",
                custom: {},
                hidden: false,
                nodes: [pageId],
                linkedNodes: {}
            };

            doc[pageId] = {
                ...oldRoot,
                parent: "ROOT"
            };

            // Update any nodes that were children of ROOT to be children of the page
            Object.keys(doc).forEach(key => {
                if (key !== 'ROOT' && key !== pageId && doc[key].parent === 'ROOT') {
                    doc[key].parent = pageId;
                }
            });
        } else if (doc && doc.ROOT && doc.ROOT.type?.resolvedName !== "DocumentContainer") {
            // Handle other old formats - create new structure
            return createEmptyDocument();
        } else if (!doc.ROOT) {
            // Document corrupted or missing ROOT, reset
            return createEmptyDocument();
        }

        return JSON.stringify(doc);
    } catch (e) {
        console.error("Failed to parse and normalize template document.", e);
        return createEmptyDocument();
    }
}
