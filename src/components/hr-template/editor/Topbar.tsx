"use client";
import React, { useState, useEffect } from "react";
import { useEditor } from "@craftjs/core";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import { Save, Download, Trash2, FilePlus, ArrowLeft } from "lucide-react";
import { TemplateService } from "../../../core/services/TemplateService";
// import { LocalStorageAdapter } from "../../infrastructure/adapters/LocalStorageAdapter";
import { LocalStorageAdapter } from "../../../infrastructure/adapters/LocalStorageAdapter";
import { v4 as uuidv4 } from "uuid";


interface SessionData {
    url?: string;
    token?: string;
    sub_institute_id?: string;
    org_type?: string;
}

// We instantiate the service with the local storage adapter as per clean architecture requirements
const templateService = new TemplateService(new LocalStorageAdapter());

export const Topbar = ({ templateId }: { templateId?: string }) => {
    const router = useRouter();
    const { actions, query } = useEditor();
    const [currentId, setCurrentId] = React.useState(templateId || uuidv4());
    const [templateName, setTemplateName] = React.useState("Untitled Template");
    const [sessionData, setSessionData] = useState<SessionData>({});
    const [showNameDialog, setShowNameDialog] = useState(false);
    const [tempName, setTempName] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userData = localStorage.getItem("userData");
            if (userData) {
                const { APP_URL, token, sub_institute_id, org_type } = JSON.parse(userData);
                setSessionData({ url: APP_URL, token, sub_institute_id, org_type });
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
            alert("Please enter a template name");
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
                alert("Template saved to database!");
            } else {
                const error = await response.text();
                console.error("Failed to save template:", error);
                alert("Failed to save template to database.");
            }
        } catch (error) {
            console.error("Error saving template to database:", error);
            alert("Failed to save template to database.");
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
                alert("Template updated!");
            } else {
                const error = await response.text();
                console.error("Failed to update template:", error);
                alert("Failed to update template in database.");
            }
        } catch (error) {
            console.error("Error updating template in database:", error);
            alert("Failed to update template in database.");
        }
    };

    const handleLoad = async () => {
        const template = await templateService.getTemplate(currentId);
        if (template && template.schema) {
            actions.deserialize(template.schema);
            setTemplateName(template.name || "Untitled Template");

            // Set the template name as custom name on the root node if it exists
            if (template.name && template.name !== "Untitled Template") {
                try {
                    const rootNode = query.node("ROOT").get();
                    if (rootNode) {
                        actions.setProp("ROOT", (props: any) => {
                            props.customName = template.name;
                        });
                    }
                } catch (e) {
                    // Ignore - root node might not exist
                }
            }
        } else {
            alert("No template found with this ID.");
        }
    };

    const handleDelete = async () => {
        await templateService.deleteTemplate(currentId);
        alert("Template deleted!");
        // clear editor
        actions.deserialize("{}");
    };

    const handleNew = () => {
        setCurrentId(uuidv4());
        actions.deserialize("{}"); // Load empty
    };

    const handleBack = () => {
        router.push("/content/hr-templates");
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
