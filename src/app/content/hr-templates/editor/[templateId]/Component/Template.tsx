"use client";
import React, { useEffect, useState } from "react";
import { Editor, Frame, Element, useEditor } from "@craftjs/core";
import { Topbar } from "../../../../../../components/hr-template/editor/Topbar";
import { Toolbox } from "../../../../../../components/hr-template/editor/Toolbox";
import { SettingsPanel } from "../../../../../../components/hr-template/editor/SettingsPanel";
import { EditorCanvas } from "../../../../../../components/hr-template/editor//EditorCanvas";
import { Layers } from "@craftjs/layers";
import { TextBlock } from "../../../../../../components/hr-template/blocks/TextBlock";
import { ImageBlock } from "../../../../../../components/hr-template/blocks/ImageBlock";
import { ContainerBlock } from "../../../../../../components/hr-template/blocks/ContainerBlock";
import { ButtonBlock } from "../../../../../../components/hr-template/blocks/ButtonBlock";
import { DividerBlock } from "../../../../../../components/hr-template/blocks/DividerBlock";
import { GridBlock } from "../../../../../../components/hr-template/blocks/GridBlock";
import { ShapeBlock } from "../../../../../../components/hr-template/blocks/ShapeBlock";
import { TableBlock } from "../../../../../../components/hr-template/blocks/TableBlock";
import { DrawingBlock } from "../../../../../../components/hr-template/blocks/DrawingBlock";
import { LineBlock } from "../../../../../../components/hr-template/blocks/LineBlock";
import { FloatingToolbar, WhiteboardTool } from "../../../../../../components/hr-template/editor/FloatingToolbar";
import { JsonPreviewPanel } from "../../../../../../components/hr-template/editor/JsonPreviewPanel";

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
            <Editor resolver={{ TextBlock, ImageBlock, ContainerBlock, ButtonBlock, DividerBlock, GridBlock, ShapeBlock, TableBlock, DrawingBlock, LineBlock }}>
                <Topbar templateId={templateId} />

                <div className="flex flex-1 overflow-hidden relative">
                    <div className="z-20 flex flex-col border-r border-border bg-white h-full relative" style={{ width: toolboxTab ? "368px" : "80px", transition: "width 0.3s ease-in-out" }}>
                        <Toolbox
                            activeTab={toolboxTab}
                            setActiveTab={setToolboxTab}
                            isFloatingToolbarVisible={isFloatingToolbarVisible}
                            toggleFloatingToolbar={() => setIsFloatingToolbarVisible(!isFloatingToolbarVisible)}
                        />
                    </div>

                    <div className="flex-1 flex overflow-hidden relative">
                        {isFloatingToolbarVisible && (
                            <FloatingToolbar
                                activeTool={activeTool}
                                setActiveTool={setActiveTool}
                                openToolboxTab={setToolboxTab}
                            />
                        )}
                        <EditorCanvas activeTool={activeTool}>
                            <FrameLoader templateId={templateId} sessionData={sessionData} />
                        </EditorCanvas>

                        <SettingsPanel />

                        <JsonPreviewPanel />
                    </div>
                </div>
            </Editor>
        </div>
    );
}

function FrameLoader({ templateId, sessionData }: { templateId: string; sessionData: SessionData }) {
    const { actions } = useEditor();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;
        let timeoutId: NodeJS.Timeout | null = null;

        (async () => {
            try {
                if (!sessionData.url || !sessionData.token) {
                    setLoaded(true);
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

                    if (content && content !== "{}" && content !== '""' && content.length > 2) {
                        timeoutId = setTimeout(() => {
                            if (isMounted) {
                                try {
                                    actions.deserialize(content);
                                } catch (err) {
                                    console.error("Failed to deserialize template:", err);
                                }
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
    }, [templateId, sessionData, actions]);

    if (!loaded) return <div className="p-8 text-center text-muted-foreground flex justify-center items-center h-full">Loading workspace...</div>;

    return (
        <Frame>
            <Element is={ContainerBlock} canvas isOverlay={false} x={0} y={0} width="100%" height="100%" />
        </Frame>
    );
}
