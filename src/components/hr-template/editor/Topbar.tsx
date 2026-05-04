"use client";
import React, { useState, useEffect } from "react";
import { useEditor } from "@craftjs/core";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import { Save, Download, Trash2, FilePlus, ArrowLeft, Loader2, ChevronDown, FileText, Image as ImageIcon, Undo2, Redo2, Send } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { createEmptyDocument } from "./utils/documentModel";
import { toast } from "../../ui/use-toast";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../../ui/dropdown-menu";

interface SessionData {
    url?: string;
    token?: string;
    sub_institute_id?: string;
    org_type?: string;
    user_id?: number;
    id?: number;
}


export const Topbar = ({ templateId, offerData }: { templateId?: string; offerData?: any }) => {
    const router = useRouter();
    const { actions, query } = useEditor();
    const [currentId, setCurrentId] = React.useState(templateId || uuidv4());
    const [templateName, setTemplateName] = React.useState("Untitled Template");
    const [sessionData, setSessionData] = useState<SessionData>({});
    const [showNameDialog, setShowNameDialog] = useState(false);
    const [tempName, setTempName] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // ── Reactive canvas-level undo/redo ──
    // Sync with Craft.js history on every state change (zero polling, instant response)
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const refreshHistory = React.useCallback(() => {
        try {
            setCanUndo(query.history.canUndo());
            setCanRedo(query.history.canRedo());
        } catch { /* query not ready */ }
    }, [query]);

    // Re-check history state on every Craft.js state mutation
    useEffect(() => {
        const interval = setInterval(refreshHistory, 250);
        // Also run immediately on mount
        refreshHistory();
        return () => clearInterval(interval);
    }, [refreshHistory]);

    const handleUndo = React.useCallback(() => {
        try {
            actions.history.undo();
            // Instant UI refresh — don't wait for the next poll cycle
            requestAnimationFrame(() => {
                try {
                    setCanUndo(query.history.canUndo());
                    setCanRedo(query.history.canRedo());
                } catch {}
            });
        } catch { /* nothing to undo */ }
    }, [actions, query]);

    const handleRedo = React.useCallback(() => {
        try {
            actions.history.redo();
            requestAnimationFrame(() => {
                try {
                    setCanUndo(query.history.canUndo());
                    setCanRedo(query.history.canRedo());
                } catch {}
            });
        } catch { /* nothing to redo */ }
    }, [actions, query]);

    // ── Focus-aware keyboard shortcuts ──
    // When inside contentEditable (Tiptap), Ctrl+Z is handled natively by Tiptap's
    // History extension — we never interfere. When focus is anywhere else on the
    // page, Ctrl+Z triggers Craft.js canvas undo.
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            // Let text editors, inputs, textareas handle their own undo/redo
            if (
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target.isContentEditable ||
                target.closest?.('[contenteditable="true"]')
            ) return;

            const isMod = e.ctrlKey || e.metaKey;
            if (!isMod) return;

            if (e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
            } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
                e.preventDefault();
                handleRedo();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userData = localStorage.getItem("userData");
            if (userData) {
                const { APP_URL, token, sub_institute_id, org_type, user_id } = JSON.parse(userData);
                setSessionData({ url: APP_URL, token, sub_institute_id, org_type, user_id });
            }
        }
    }, []);

    useEffect(() => {
        if (templateId && !isNaN(Number(templateId)) && sessionData.url && sessionData.token) {
            setIsEditing(true);
            fetch(`${sessionData.url}/api/templates/${templateId}`, {
                headers: {
                    "Authorization": `Bearer ${sessionData.token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    setTemplateName(data.name || "Untitled Template");
                    setCurrentId(String(data.id));
                })
                .catch(err => console.error("Failed to load template:", err));
        }
    }, [sessionData]);

    const handleSaveClick = () => {
        setTempName("");
        setShowNameDialog(true);
    };

    const handleSaveConfirm = async () => {
        if (!tempName.trim()) {
            toast({ title: "Error", description: "Please enter a template name", variant: "destructive" });
            return;
        }

        const json = query.serialize();

        // Save to database via API
        try {
            const response = await fetch(`${sessionData.url}/api/templates`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionData.token}`
                },
                body: JSON.stringify({
                    name: tempName,
                    content: json,
                    status: "draft",
                    sub_institute_id: sessionData.sub_institute_id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Template saved to database:", data);
                setTemplateName(tempName);
                setCurrentId(String(data.id));
                setIsEditing(true);
                toast({ title: "Success", description: "Template saved to database!" });
                
                // Replace URL so we are now securely anchored to the database template ID
                router.replace(`/content/hr-templates/editor/${data.id}`);
            } else {
                const error = await response.text();
                console.error("Failed to save template:", error);
                toast({ title: "Error", description: "Failed to save template to database.", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error saving template to database:", error);
            toast({ title: "Error", description: "Failed to save template to database.", variant: "destructive" });
        }

        setShowNameDialog(false);
    };

    const handleUpdate = async () => {
        const json = query.serialize();

        try {
            const response = await fetch(`${sessionData.url}/api/templates/${currentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionData.token}`
                },
                body: JSON.stringify({
                    name: templateName,
                    content: json,
                    status: "draft",
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Template updated in database:", data);
                toast({ title: "Success", description: "Template updated successfully!" });
            } else {
                const error = await response.text();
                console.error("Failed to update template:", error);
                toast({ title: "Error", description: "Failed to update template.", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error updating template in database:", error);
            toast({ title: "Error", description: "Failed to update template.", variant: "destructive" });
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this template?")) return;
        
        try {
            const response = await fetch(`${sessionData.url}/api/templates/${currentId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${sessionData.token}`
                }
            });
            if (response.ok) {
                toast({ title: "Success", description: "Template deleted!" });
                // clear editor
                actions.deserialize(createEmptyDocument());
                setIsEditing(false);
                setCurrentId(uuidv4());
                router.replace("/content/hr-templates/editor/new");
            } else {
                toast({ title: "Error", description: "Failed to delete template from database.", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error deleting template:", error);
            toast({ title: "Error", description: "Failed to delete template.", variant: "destructive" });
        }
    };

    const handleNew = () => {
        setCurrentId(uuidv4());
        setIsEditing(false);
        setTemplateName("Untitled Template");
        actions.deserialize(createEmptyDocument()); // Load empty canvas
        router.push("/content/hr-templates/editor/new");
    };

    const handleBack = () => {
        router.push("/content/hr-templates");
    };

    const handleSendOffer = async () => {
        if (!offerData || !sessionData.url || !sessionData.token) return;

        setIsSending(true);
        try {
            // Mark the offer as sent (backend will handle email sending)
            const body: any = {
                type: 'API',
                token: sessionData.token,
                sub_institute_id: sessionData.sub_institute_id,
                user_id: sessionData.user_id,
                application_id: offerData.candidateId,
                job_id: offerData.jobId,
                position: offerData.position,
                candidateEmail: offerData.employeeData?.email || `${offerData.candidateName.toLowerCase().replace(' ', '.')}@example.com`,
                offerDetails: offerData
            };
            const sendResponse = await fetch(`${sessionData.url}/api/talent-offers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            if (sendResponse.ok) {
                // Mark interview as hired
                if (offerData.interviewId) {
                    const decisionResponse = await fetch(`${sessionData.url}/api/interviews/${offerData.interviewId}/decision?token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}&type=API`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            status: 'Hired',
                            notes: '',
                        }),
                    });

                    if (!decisionResponse.ok) {
                        console.error('Failed to update interview decision:', decisionResponse.statusText);
                        // Continue anyway, offer was sent
                    }
                }

                alert('Offer sent successfully!');
                // Clear offer data and trigger offers refresh
                localStorage.removeItem('offerData');
                localStorage.setItem('refreshOffers', 'true');
                router.push('/content/Telent-management/ManagerHub');
            } else {
                alert('Failed to send offer. Please try again.');
            }
        } catch (error) {
            console.error('Error sending offer:', error);
            alert('Error sending offer. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const handleExport = async (format: "pdf" | "png" | "jpg" | "docx") => {
        const element = document.getElementById("editor-canvas");
        if (!element) return;
        
        setIsExporting(true);
        // Clear selection to remove blue focus bounding boxes from final export
        actions.selectNode();
        
        setTimeout(async () => {
            try {
                // Store inline styles to restore after export
                const originalTransform = element.style.transform;
                const originalTransition = element.style.transition;
                
                // Force scale 1 (100%) immediately so capture isn't pixelated or scaled down
                element.style.transition = 'none';
                element.style.transform = 'scale(1)';
                
                // Wait briefly for DOM to paint un-scaled state
                await new Promise(r => setTimeout(r, 50));
                
                const canvas = await html2canvas(element, {
                    scale: 3, // HD capture
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    backgroundColor: "#ffffff"
                });
                
                // Automatically restore layout so user perceives minimal flicker
                element.style.transform = originalTransform;
                element.style.transition = originalTransition;
                
                const safeName = templateName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || "template";

                if (format === "pdf") {
                    const imgData = canvas.toDataURL('image/jpeg', 1.0);
                    const pdf = new jsPDF("p", "mm", "a4");
                    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
                    pdf.save(`${safeName}.pdf`);
                } 
                else if (format === "png") {
                    const imgData = canvas.toDataURL('image/png');
                    const a = document.createElement('a');
                    a.href = imgData;
                    a.download = `${safeName}.png`;
                    a.click();
                }
                else if (format === "jpg") {
                    const imgData = canvas.toDataURL('image/jpeg', 0.95);
                    const a = document.createElement('a');
                    a.href = imgData;
                    a.download = `${safeName}.jpg`;
                    a.click();
                }
                toast({ title: "Success", description: `Exported as ${format.toUpperCase()} successfully!` });
            } catch (error) {
                console.error("Export error:", error);
                toast({ title: "Error", description: `Failed to export ${format.toUpperCase()}! Check console.`, variant: "destructive" });
            } finally {
                setIsExporting(false);
            }
        }, 150); // Give react state selection clearing brief moment to flush
    };

    return (
        <div className="flex items-center justify-between px-6 py-3 bg-white/90 backdrop-blur-md border-b border-sky-100/50 shadow-sm sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    className="bg-white hover:bg-sky-50 border-none transition-all duration-200 hover:border-sky-200"
                >
                    <ArrowLeft className="w-4 h-4 text-sky-500" />
                </Button>
                <div className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-blue-600 drop-shadow-sm">
                    HR Template Editor
                </div>
                {/* ── Undo / Redo ── */}
                <div className="flex items-center gap-0.5 ml-3 border-l border-neutral-200/70 pl-3">
                    <button
                        onClick={handleUndo}
                        disabled={!canUndo}
                        className={`relative group h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 ${canUndo ? 'hover:bg-sky-50 hover:text-sky-600 active:scale-95 text-neutral-500 cursor-pointer' : 'text-neutral-300 cursor-not-allowed'}`}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 className="w-4 h-4" />
                        {/* Tooltip */}
                        <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-800 px-2 py-1 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
                            Undo <kbd className="ml-1 px-1 py-0.5 rounded bg-neutral-700 text-[9px]">Ctrl+Z</kbd>
                        </span>
                    </button>
                    <button
                        onClick={handleRedo}
                        disabled={!canRedo}
                        className={`relative group h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 ${canRedo ? 'hover:bg-sky-50 hover:text-sky-600 active:scale-95 text-neutral-500 cursor-pointer' : 'text-neutral-300 cursor-not-allowed'}`}
                        title="Redo (Ctrl+Shift+Z)"
                    >
                        <Redo2 className="w-4 h-4" />
                        <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-800 px-2 py-1 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
                            Redo <kbd className="ml-1 px-1 py-0.5 rounded bg-neutral-700 text-[9px]">Ctrl+Y</kbd>
                        </span>
                    </button>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground mr-4">ID: {templateId && !isNaN(Number(templateId)) ? templateId : currentId.split("-")[0]}...</span>
                <Button variant="outline" size="sm" onClick={handleNew} className="bg-white hover:bg-sky-50 border-neutral-200 shadow-sm rounded-lg transition-all duration-200 hover:border-sky-200 hover:text-sky-700">
                    <FilePlus className="w-4 h-4 mr-2 text-sky-500" /> New
                </Button>
                {isEditing && (
                    <Button variant="outline" size="sm" onClick={handleDelete} className="bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-neutral-200 text-destructive shadow-sm rounded-lg transition-all duration-200">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" disabled={isExporting} className="bg-white border-neutral-200 hover:bg-neutral-50 shadow-sm rounded-lg transition-all duration-200 hover:border-neutral-300">
                            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-neutral-500" /> : <Download className="w-4 h-4 mr-2 text-neutral-600" />} 
                            Export <ChevronDown className="w-3 h-3 ml-1 text-neutral-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 z-[100]">
                        <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer text-xs font-medium">
                            <FileText className="w-4 h-4 mr-2 text-red-500" /> Export PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('png')} className="cursor-pointer text-xs font-medium">
                            <ImageIcon className="w-4 h-4 mr-2 text-green-500" /> Export PNG
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('jpg')} className="cursor-pointer text-xs font-medium">
                            <ImageIcon className="w-4 h-4 mr-2 text-orange-500" /> Export JPG
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                {offerData && (
                    <Button size="sm" disabled={isSending} onClick={() => handleSendOffer()} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-[1px] rounded-lg transition-all duration-200 border-0">
                        {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} Send Offer
                    </Button>
                )}
                <Button size="sm" onClick={isEditing ? handleUpdate : handleSaveClick} className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] hover:-translate-y-[1px] rounded-lg transition-all duration-200 border-0">
                    {isEditing ? <><Save className="w-4 h-4 mr-2" /> save </> : <><Save className="w-4 h-4 mr-2" /> Save</>}
                </Button>
            </div>
            {showNameDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                        <h3 className="text-lg font-semibold mb-4">Enter Template Name</h3>
                        <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            placeholder="Enter template name"
                            className="w-full px-3 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowNameDialog(false)}>Cancel</Button>
                            <Button onClick={handleSaveConfirm}>Save</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
