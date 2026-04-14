"use client";
import React, { useEffect, useState } from "react";
import { Editor, Frame, Element, useEditor } from "@craftjs/core";
import { Topbar } from "../../../../../../components/hr-template/editor/Topbar";
import { Toolbox } from "../../../../../../components/hr-template/editor/Toolbox";

import { EditorCanvas } from "../../../../../../components/hr-template/editor//EditorCanvas";
import { Layers } from "@craftjs/layers";
import { TextBlock } from "../../../../../../components/hr-template/blocks/TextBlock";
import { ImageBlock } from "../../../../../../components/hr-template/blocks/ImageBlock";
import { ContainerBlock } from "../../../../../../components/hr-template/blocks/ContainerBlock";
import { A4PageBlock } from "../../../../../../components/hr-template/blocks/A4PageBlock";
import { normalizeTemplateDocument, createEmptyDocument } from "../../../../../../components/hr-template/editor/utils/documentModel";
import { ButtonBlock } from "../../../../../../components/hr-template/blocks/ButtonBlock";
import { DividerBlock } from "../../../../../../components/hr-template/blocks/DividerBlock";
import { GridBlock } from "../../../../../../components/hr-template/blocks/GridBlock";
import { ShapeBlock } from "../../../../../../components/hr-template/blocks/ShapeBlock";
import { TableBlock } from "../../../../../../components/hr-template/blocks/TableBlock";
import { DrawingBlock } from "../../../../../../components/hr-template/blocks/DrawingBlock";
import { LineBlock } from "../../../../../../components/hr-template/blocks/LineBlock";
import { FloatingToolbar, WhiteboardTool } from "../../../../../../components/hr-template/editor/FloatingToolbar";

interface SessionData {
    url?: string;
    token?: string;
    sub_institute_id?: string;
}

export default function EditorPage({ params }: { params: Promise<{ templateId: string }> }) {
    const unwrappedParams = React.use(params);
    const templateId = unwrappedParams.templateId;

    const [mounted, setMounted] = useState(false);
    const [toolboxTab, setToolboxTab] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState<WhiteboardTool>('select');
    const [isFloatingToolbarVisible, setIsFloatingToolbarVisible] = useState(true);

    const handleSetToolboxTab = (tab: string | null) => {
        setToolboxTab(tab);
        if (tab) {
            setIsFloatingToolbarVisible(false);
        }
    };
    const [sessionData, setSessionData] = useState<SessionData>({});

    useEffect(() => {
        setMounted(true);
        if (typeof window !== "undefined") {
            const userData = localStorage.getItem("userData");
            if (userData) {
                const { APP_URL, token, sub_institute_id } = JSON.parse(userData);
                setSessionData({ url: APP_URL, token, sub_institute_id });
            }
        }
    }, []);

    if (!mounted) {
        return <div className="flex items-center justify-center h-screen bg-neutral-50"><p className="text-muted-foreground animate-pulse">Initializing Editor...</p></div>;
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Editor resolver={{ TextBlock, ImageBlock, ContainerBlock, A4PageBlock, ButtonBlock, DividerBlock, GridBlock, ShapeBlock, TableBlock, DrawingBlock, LineBlock }}>
                <Topbar templateId={templateId} />

                <div className="flex flex-1 overflow-hidden relative">
                    <div className="z-20 flex flex-col border-r border-border bg-white h-full relative" style={{ width: toolboxTab ? "368px" : "80px", transition: "width 0.3s ease-in-out" }}>
                        <Toolbox
                            activeTab={toolboxTab}
                            setActiveTab={handleSetToolboxTab}
                            isFloatingToolbarVisible={isFloatingToolbarVisible}
                            toggleFloatingToolbar={() => {
                                const newState = !isFloatingToolbarVisible;
                                setIsFloatingToolbarVisible(newState);
                                if (newState) {
                                    setToolboxTab(null);
                                }
                            }}
                        />
                    </div>

                    <div className="flex-1 flex overflow-hidden relative">
                        {/* Portal target for the Text block's bubble menu so it perfectly centers over the canvas */}
                        <div id="text-toolbar-portal" className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-max" />
                        
                        {isFloatingToolbarVisible && (
                            <FloatingToolbar
                                activeTool={activeTool}
                                setActiveTool={setActiveTool}
                                openToolboxTab={handleSetToolboxTab}
                            />
                        )}
                        <EditorCanvas activeTool={activeTool}>
                            <FrameLoader templateId={templateId} sessionData={sessionData} />
                        </EditorCanvas>
                    </div>
                </div>
            </Editor>
        </div>
    );
}

function FrameLoader({ templateId, sessionData }: { templateId: string; sessionData: SessionData }) {
    const { actions } = useEditor();
    const [loaded, setLoaded] = useState(false);

    // Use a ref for actions so we always call the latest version
    // WITHOUT re-triggering the useEffect when Craft.js state changes.
    // actions from useEditor() gets a new reference on every editor state change
    // (selection, prop update, etc.), so including it in deps would re-run this
    // effect and call deserialize(createEmptyDocument()) again — wiping all nodes.
    const actionsRef = React.useRef(actions);
    actionsRef.current = actions;

    // Guard: only load once per mount
    const hasLoaded = React.useRef(false);

    useEffect(() => {
        if (hasLoaded.current) return; // Already loaded, don't re-run
        let isMounted = true;
        let timeoutId: NodeJS.Timeout | null = null;

        (async () => {
            try {
                if (!sessionData.url || !sessionData.token) {
                    hasLoaded.current = true;
                    if (isMounted) setLoaded(true);
                    return;
                }

                if (templateId === "new") {
                    if (isMounted) {
                        try {
                            actionsRef.current.deserialize(createEmptyDocument());
                        } catch (err) {
                            console.error("Failed to load empty document:", err);
                        }
                        hasLoaded.current = true;
                        setLoaded(true);
                    }
                    return;
                }

                const response = await fetch(
                    `${sessionData.url}/api/templates/${templateId}`,
                    {
                        headers: {
                            "Authorization": `Bearer ${sessionData.token}`
                        }
                    }
                );

                if (response.ok && isMounted) {
                    const template = await response.json();
                    const content = template.content;
                    if (content) {
                        timeoutId = setTimeout(() => {
                            if (isMounted) {
                                try {
                                    const normalizedContent = normalizeTemplateDocument(content);
                                    actionsRef.current.deserialize(normalizedContent);
                                } catch (err) {
                                    console.error("Failed to deserialize template:", err);
                                }
                                hasLoaded.current = true;
                            }
                        }, 100);
                    }
                }
            } catch (err) {
                console.error("Failed to load schema", err);
            } finally {
                if (isMounted) setLoaded(true);
            }
        })();

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [templateId]);

    if (!loaded) return <div className="p-8 text-center text-muted-foreground flex justify-center items-center h-full">Loading workspace...</div>;

    return (
        <Frame>
            <Element is={A4PageBlock} canvas />
        </Frame>
    );
}
