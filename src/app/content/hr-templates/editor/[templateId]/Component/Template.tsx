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
import { DocumentContainer } from "../../../../../../components/hr-template/blocks/DocumentContainer";
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
    const [offerData, setOfferData] = useState<any>(null);
    const [form16Data, setForm16Data] = useState<any>(null);

    const handleSetToolboxTab = (tab: string | null) => {
        setToolboxTab(tab);
        if (tab) {
            setIsFloatingToolbarVisible(false);
        }
    };
    const [sessionData, setSessionData] = useState<SessionData>({});

    // Function to replace placeholders in template content
    const replacePlaceholders = (content: any, data: any) => {
        if (!data) return content;

        console.log('Replacing placeholders with data:', data);

        let employeeFullName = '';
        let replacements: { [key: string]: string } = {};

        if (data.selectedYear) {
            // Form 16 data
            employeeFullName = `${data.employeeData.first_name} ${data.employeeData.middle_name || ''} ${data.employeeData.last_name}`.trim();

            replacements = {
                '{{employee_name}}': employeeFullName, // Hardcoded as in original
                '{{employee_email}}': data.employeeData?.email || '',
                '{{employee_mobile}}': data.employeeData?.mobile || '',
                '{{employee_address}}': data.employeeData?.current_location || '',
                '{{company_name}}': data.companyData?.name || data.companyData?.legal_name || 'Triz International School',
                '{{company_address}}': data.companyData?.address || data.companyData?.registered_address || 'Adajan-Surat',
                '{{company_email}}': data.company_email || data.companyData?.email || '',
                '{{company_mobile}}': data.company_phone || data.companyData?.mobile_no || data.companyData?.phone || '',
                '{{company_logo}}': data.company_logo || data.companyData?.logo || '',
                '{{company_website}}': data.company_website || data.companyData?.website || '',
                '{{pan_deductor}}': data.companyData?.pan || 'ABCDE1234F',
                '{{tan_deductor}}': data.companyData?.tan || 'SURP12345F',
                '{{pan_employee}}': data.employeeData?.pan || 'TIWAD1234E',
                '{{cit_tds}}': 'Surat',
                '{{assessment_year}}': data.selectedYear || '',
                '{{period_from}}': data.selectedYear ? `01/Apr/${data.selectedYear.split('-')[0]}` : '',
                '{{period_to}}': data.selectedYear ? `31/Mar/${data.selectedYear.split('-')[1]}` : '',
                '{{department}}': data.selectedDepartment || data.employeeData?.department || '',
                '{{place}}': 'Surat',
                '{{date}}': new Date().toLocaleDateString(),
                '{{designation}}': data.employeeData?.transfer_type || '',
                '{{full_name}}': employeeFullName,
                '{{reporting_manager}}': data.reporting_manager || data.companyData?.reporting_manager || 'Manager Name',
                '{{start_time}}': data.workScheduleStart || '',
                '{{end_time}}': data.workScheduleEnd || '',

            };
        } else {
            // Offer data
            employeeFullName = data.selectedEmployeeData ? `${data.selectedEmployeeData.first_name} ${data.selectedEmployeeData.middle_name || ''} ${data.selectedEmployeeData.last_name}`.trim() : data.candidateName || '';

            replacements = {
                '{{employee_name}}': employeeFullName,
                '{{candidate_name}}': employeeFullName,
                '{{employee_email}}': data.employeeData?.email || '',
                '{{candidate_email}}': data.selectedEmployeeData?.employee_email || data.employeeData?.email || '',
                '{{employee_mobile}}': data.selectedEmployeeData?.mobile || data.employeeData?.mobile || '',
                '{{candidate_mobile}}': data.selectedEmployeeData?.mobile || data.employeeData?.mobile || '',
                '{{employee_address}}': data.employeeData?.current_location || '',
                '{{designation}}': data.selectedEmployeeData?.department || data.position || '',
                '{{position}}': data.selectedEmployeeData?.transfer_type || data.position || '',
                '{{joining_date}}': data.startDate || '',
                '{{start_date}}': data.startDate || '',
                '{{salary_amount}}': data.selectedEmployeeData?.amount || data.salary || '',
                '{{salary}}': data.selectedEmployeeData?.amount || data.salary || '',
                '{{company_name}}': data.company_name || data.companyData?.legal_name || data.companyData?.name || '',
                '{{company_address}}': data.company_address || data.companyData?.registered_address || data.companyData?.address || '',
                '{{company_email}}': data.company_email || data.companyData?.email || '',
                '{{company_mobile}}': data.company_phone || data.companyData?.mobile_no || data.companyData?.phone || '',
                '{{company_website}}': data.company_website || data.companyData?.website || '',
                '{{company_logo}}': data.company_logo || data.companyData?.logo || '',
                '{{company_cin}}': data.company_cin || data.companyData?.cin || '',
                '{{company_gstin}}': data.company_gstin || data.companyData?.gstin || '',
                '{{company_pan}}': data.company_pan || data.companyData?.pan || '',
                 '{{department_name}}': data.department_name || data.selectedDepartment || data.employeeData?.department_name || '',
                '{{hr_name}}': data.hrData?.name || '',
                '{{hr_designation}}': data.hrData?.designation || '',
                '{{hr_email}}': data.hrData?.email || '',
                '{{offer_date}}': new Date().toLocaleDateString(),
                '{{reporting_manager}}': data.reportManager || data.companyData?.reporting_manager || 'Manager Name',
                '{{start_time}}': data.workScheduleStart || '',
                '{{end_time}}': data.workScheduleEnd || '',
                '{{probation_period}}': '3 months',
                '{{notes}}': data.notes || '',
                '{{key_responsibility}}': data.keyResponsibility || '',
            };
        }

        const traverseAndReplace = (obj: any): any => {
            if (typeof obj === 'string') {
                let replaced = obj;
                Object.entries(replacements).forEach(([placeholder, value]) => {
                    const regex = new RegExp(placeholder, 'g');
                    const before = replaced;
                    replaced = replaced.replace(regex, value);
                    if (before !== replaced) {
                        console.log(`Replaced "${placeholder}" with "${value}"`);
                    }
                });
                return replaced;
            } else if (Array.isArray(obj)) {
                return obj.map(traverseAndReplace);
            } else if (obj && typeof obj === 'object') {
                const newObj: any = {};
                for (const key in obj) {
                    newObj[key] = traverseAndReplace(obj[key]);
                }
                return newObj;
            }
            return obj;
        };

        return traverseAndReplace(content);
    };

    useEffect(() => {
        setMounted(true);
        if (typeof window !== "undefined") {
            const userData = localStorage.getItem("userData");
            if (userData) {
                const { APP_URL, token, sub_institute_id } = JSON.parse(userData);
                setSessionData({ url: APP_URL, token, sub_institute_id });
            }

            // Load offer data if present
            const storedOfferData = localStorage.getItem("offerData");
            if (storedOfferData) {
                setOfferData(JSON.parse(storedOfferData));
                localStorage.removeItem("offerData"); // Clear after loading
            }

            // Load form16 data if present
            const storedForm16Data = localStorage.getItem("form16Data");
            if (storedForm16Data) {
                setForm16Data(JSON.parse(storedForm16Data));
                localStorage.removeItem("form16Data"); // Clear after loading
            }
        }
    }, []);

    if (!mounted) {
        return <div className="flex items-center justify-center h-screen bg-neutral-50"><p className="text-muted-foreground animate-pulse">Initializing Editor...</p></div>;
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Editor resolver={{ TextBlock, ImageBlock, ContainerBlock, A4PageBlock, DocumentContainer, ButtonBlock, DividerBlock, GridBlock, ShapeBlock, TableBlock, DrawingBlock, LineBlock }}>
                <Topbar templateId={templateId} offerData={offerData} />

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
                            <FrameLoader templateId={templateId} sessionData={sessionData} offerData={offerData} form16Data={form16Data} replacePlaceholders={replacePlaceholders} />
                        </EditorCanvas>
                    </div>
                </div>
            </Editor>
        </div>
    );
}

function FrameLoader({ templateId, sessionData, offerData, form16Data, replacePlaceholders }: { templateId: string; sessionData: SessionData; offerData: any; form16Data: any; replacePlaceholders: (content: any, data: any) => any }) {
    const { actions } = useEditor();
    const [loaded, setLoaded] = useState(false);
    const [rawContent, setRawContent] = useState<any>(null);

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
                    let content = template.content;
                    if (content) {
                        setRawContent(content);
                        // Replace placeholders if data exists
                        const data = offerData || form16Data;
                        if (data) {
                            console.log('Replacing placeholders in initial template load');
                            content = replacePlaceholders(content, data);
                        }
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

    // Effect to re-deserialize when data changes
    useEffect(() => {
        if (!rawContent || (!offerData && !form16Data) || !hasLoaded.current) return;

        const data = offerData || form16Data;
        if (data) {
            console.log('Re-deserializing template with data');
            const content = replacePlaceholders(rawContent, data);
            try {
                const normalizedContent = normalizeTemplateDocument(content);
                actionsRef.current.deserialize(normalizedContent);
            } catch (err) {
                console.error("Failed to re-deserialize template with data:", err);
            }
        }
    }, [offerData, form16Data, rawContent]);

    if (!loaded) return <div className="p-8 text-center text-muted-foreground flex justify-center items-center h-full">Loading workspace...</div>;

    return (
        <Frame>
            <Element is={DocumentContainer} canvas />
        </Frame>
    );
}
