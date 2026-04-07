/**
 * Table utilities for the Tiptap-backed TableBlock.
 *
 * Provides helpers for:
 *  - Creating starter Tiptap table content (JSON)
 *  - Migrating legacy div/input table props to Tiptap content
 *  - Normalizing table content on load
 */

// ── Starter Content ──────────────────────────────────────────────────

/**
 * Creates valid Tiptap JSON content for a table with the given dimensions.
 * Cells are empty paragraphs, with an optional header row.
 */
export function createStarterTableContent(
    rows: number,
    cols: number,
    withHeaderRow = false
): Record<string, any> {
    const tableRows: any[] = [];

    for (let r = 0; r < rows; r++) {
        const isHeader = withHeaderRow && r === 0;
        const cells: any[] = [];

        for (let c = 0; c < cols; c++) {
            cells.push({
                type: isHeader ? "tableHeader" : "tableCell",
                attrs: {},
                content: [{ type: "paragraph", content: [] }],
            });
        }

        tableRows.push({
            type: "tableRow",
            content: cells,
        });
    }

    return {
        type: "doc",
        content: [
            {
                type: "table",
                content: tableRows,
            },
        ],
    };
}

// ── Legacy Migration ─────────────────────────────────────────────────

/**
 * Checks whether a set of props represents a legacy (div/input) table.
 * Legacy tables have `rows`/`cols` but no `content` (the Tiptap JSON).
 */
export function isLegacyTableProps(props: Record<string, any>): boolean {
    return (
        typeof props.rows === "number" &&
        typeof props.cols === "number" &&
        !props.content
    );
}

/**
 * Converts legacy table props (rows, cols, cellText, etc.) into
 * valid Tiptap table JSON content.
 *
 * Legacy data shape:
 *   rows: number
 *   cols: number
 *   cellText: { "cell-0-0": "Hello", "cell-1-2": "World", ... }
 */
export function migrateLegacyTablePropsToContent(
    props: Record<string, any>
): Record<string, any> {
    const rows = props.rows || 3;
    const cols = props.cols || 3;
    const cellText: Record<string, string> = props.cellText || {};

    const tableRows: any[] = [];

    for (let r = 0; r < rows; r++) {
        const cells: any[] = [];
        for (let c = 0; c < cols; c++) {
            const key = `cell-${r}-${c}`;
            const text = cellText[key] || "";

            const cellContent: any[] = [];
            if (text) {
                cellContent.push({
                    type: "paragraph",
                    content: [{ type: "text", text }],
                });
            } else {
                cellContent.push({ type: "paragraph", content: [] });
            }

            cells.push({
                type: "tableCell",
                attrs: {},
                content: cellContent,
            });
        }
        tableRows.push({ type: "tableRow", content: cells });
    }

    return {
        type: "doc",
        content: [{ type: "table", content: tableRows }],
    };
}

// ── Normalization ────────────────────────────────────────────────────

/**
 * Ensures content is a valid Tiptap JSON document containing a table.
 * Returns the content as-is if valid, or creates a 3×3 starter if not.
 */
export function normalizeTableContent(
    content: Record<string, any> | string | null | undefined,
    fallbackRows = 3,
    fallbackCols = 3
): Record<string, any> {
    if (!content) {
        return createStarterTableContent(fallbackRows, fallbackCols);
    }

    let parsed: any = content;
    if (typeof content === "string") {
        try {
            parsed = JSON.parse(content);
        } catch {
            return createStarterTableContent(fallbackRows, fallbackCols);
        }
    }

    // Validate basic structure
    if (
        parsed &&
        parsed.type === "doc" &&
        Array.isArray(parsed.content) &&
        parsed.content.length > 0 &&
        parsed.content[0]?.type === "table"
    ) {
        return parsed;
    }

    return createStarterTableContent(fallbackRows, fallbackCols);
}
