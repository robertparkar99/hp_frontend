import React from "react";
import { useEditor, useNode } from "@craftjs/core";
import {
    ChevronDown,
    ChevronUp,
    Copy,
    Eye,
    EyeOff,
    Plus,
    Trash2,
} from "lucide-react";
import { createA4PageNodeTree, scrollPageIntoView } from "../editor/utils/documentModel";

export const A4PageBlock = ({ children }: any) => {
    const {
        id,
        pageHidden,
        actions: { setProp },
        connectors: { connect },
    } = useNode((node) => ({
        id: node.id,
        pageHidden: !!node.data.props.pageHidden,
    }));
    const { actions, query, pageIds, isSelected } = useEditor((state, query) => {
        const rootNode = query.node("ROOT").get();
        const pages = rootNode?.data?.nodes?.filter((nodeId: string) => {
            const node = query.node(nodeId).get();
            return node?.data?.name === "A4PageBlock";
        }) || [];

        return {
            pageIds: pages,
            isSelected: state.events.selected?.has(id),
        };
    });

    const pageIndex = Math.max(pageIds.indexOf(id), 0);
    const pageNumber = pageIndex + 1;
    const pageCount = pageIds.length;

    const selectPage = React.useCallback((event?: React.MouseEvent) => {
        event?.stopPropagation();
        actions.selectNode(id);
    }, [actions, id]);

    const movePage = React.useCallback((direction: -1 | 1, event: React.MouseEvent) => {
        event.stopPropagation();
        const nextIndex = pageIndex + direction;
        if (nextIndex < 0 || nextIndex >= pageCount) return;
        (actions as any).move(id, "ROOT", nextIndex);
        actions.selectNode(id);
    }, [actions, id, pageCount, pageIndex]);

    const addPageAfter = React.useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        const newPageNode = createA4PageNodeTree(query);
        actions.addNodeTree(newPageNode, "ROOT", pageIndex + 1);
        actions.selectNode(newPageNode.rootNodeId);
        scrollPageIntoView(newPageNode.rootNodeId);
    }, [actions, pageIndex, query]);

    const togglePageVisibility = React.useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        setProp((props: any) => {
            props.pageHidden = !pageHidden;
        });
        actions.selectNode(id);
    }, [actions, id, pageHidden, setProp]);

    const deletePage = React.useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        if (pageCount <= 1) return;
        const nextSelectedId = pageIds[pageIndex + 1] || pageIds[pageIndex - 1];
        (actions as any).delete(id);
        if (nextSelectedId) {
            requestAnimationFrame(() => actions.selectNode(nextSelectedId));
        }
    }, [actions, id, pageCount, pageIds, pageIndex]);

    const toolbarButtonClass = "h-8 w-8 inline-flex items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 disabled:text-neutral-300 disabled:hover:bg-transparent";

    return (
        <div
            ref={(ref) => { if (ref) connect(ref); }}
            className="group/page relative mx-auto w-[794px] pt-12"
            style={{
                boxSizing: "border-box",
            }}
            data-page-id={id}
        >
            <div
                className={`absolute left-0 top-2 z-30 flex h-9 w-full items-center justify-between transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover/page:opacity-100"}`}
                data-html2canvas-ignore="true"
            >
                <button
                    type="button"
                    className="max-w-[280px] truncate text-left text-lg font-semibold text-neutral-950"
                    onClick={selectPage}
                    title={`Page ${pageNumber}`}
                >
                    Page {pageNumber} <span className="font-medium text-neutral-500">- Add p...</span>
                </button>

                <div className="flex items-center gap-1">
                    <button type="button" className={toolbarButtonClass} onClick={(event) => movePage(-1, event)} disabled={pageIndex === 0} title="Move page up">
                        <ChevronUp className="h-5 w-5" />
                    </button>
                    <button type="button" className={toolbarButtonClass} onClick={(event) => movePage(1, event)} disabled={pageIndex === pageCount - 1} title="Move page down">
                        <ChevronDown className="h-5 w-5" />
                    </button>
                    <button type="button" className={toolbarButtonClass} onClick={togglePageVisibility} title={pageHidden ? "Show page" : "Hide page"}>
                        {pageHidden ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>
                    <button type="button" className={toolbarButtonClass} onClick={addPageAfter} title="Add page after">
                        <Copy className="h-5 w-5" />
                    </button>
                    <button type="button" className={toolbarButtonClass} onClick={deletePage} disabled={pageCount <= 1} title="Delete page">
                        <Trash2 className="h-5 w-5" />
                    </button>
                    <button type="button" className={toolbarButtonClass} onClick={addPageAfter} title="Add page">
                        <Plus className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div
                className={`relative h-[1123px] w-[794px] bg-white shadow-xl transition-shadow ${isSelected ? "ring-2 ring-violet-500" : "ring-0"}`}
                style={{
                    boxSizing: "border-box",
                    overflow: "hidden",
                }}
                data-craft-node="A4PageBlock"
                data-page-hidden={pageHidden ? "true" : "false"}
            >
                {/* Subtle print margin guide (not exported, visual only) */}
                {!pageHidden && <div className="absolute inset-8 border border-neutral-100/50 pointer-events-none z-0" data-html2canvas-ignore="true" />}
                {pageHidden ? (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-50 text-sm font-medium text-neutral-400" data-html2canvas-ignore="true">
                        Page hidden
                    </div>
                ) : (
                    <div className="relative z-10 w-full h-full">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};

export const A4PageBlockSettings = () => {
    return null;
};

A4PageBlock.craft = {
    displayName: "A4 Page",
    props: {
        pageHidden: false,
    },
    rules: {
        canDrag: () => false, // Cannot drag the root page
        canDelete: () => true,
    },
    related: {}
};
