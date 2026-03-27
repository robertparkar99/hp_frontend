"use client";
import React from "react";
import { useEditor } from "@craftjs/core";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import { Save, Download, Trash2, FilePlus, ArrowLeft } from "lucide-react";
import { TemplateService } from "../../../core/services/TemplateService";
// import { LocalStorageAdapter } from "../../infrastructure/adapters/LocalStorageAdapter";
import { LocalStorageAdapter } from "../../../infrastructure/adapters/LocalStorageAdapter";
import { v4 as uuidv4 } from "uuid";

// We instantiate the service with the local storage adapter as per clean architecture requirements
const templateService = new TemplateService(new LocalStorageAdapter());

export const Topbar = ({ templateId }: { templateId?: string }) => {
    const router = useRouter();
    const { actions, query } = useEditor();
    const [currentId, setCurrentId] = React.useState(templateId || uuidv4());
    const [templateName, setTemplateName] = React.useState("Untitled Template");

    const handleSave = async () => {
        const json = query.serialize();

        // Try to get custom name from root node
        let name = templateName;
        try {
            const rootNode = query.node("ROOT").get();
            if (rootNode?.data?.props?.customName) {
                name = rootNode.data.props.customName;
            }
        } catch (e) {
            // Ignore - root node might not exist
        }

        await templateService.saveTemplate({
            id: currentId,
            name: name,
            type: "document",
            schema: json,
            createdAt: Date.now(),
        });
        setTemplateName(name);
        alert("Template saved!");
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
                <span className="text-xs text-muted-foreground mr-4">ID: {currentId.split("-")[0]}...</span>
                <Button variant="outline" size="sm" onClick={handleNew} className="bg-white hover:bg-sky-50 border-neutral-200 shadow-sm rounded-lg transition-all duration-200 hover:border-sky-200 hover:text-sky-700">
                    <FilePlus className="w-4 h-4 mr-2 text-sky-500" /> New
                </Button>
                <Button variant="outline" size="sm" onClick={handleLoad} className="bg-white hover:bg-sky-50 border-neutral-200 shadow-sm rounded-lg transition-all duration-200 hover:border-sky-200 hover:text-sky-700">
                    <Download className="w-4 h-4 mr-2 text-blue-500" /> Load
                </Button>
                <Button variant="outline" size="sm" onClick={handleDelete} className="bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-neutral-200 text-destructive shadow-sm rounded-lg transition-all duration-200">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
                <Button size="sm" onClick={handleSave} className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] hover:-translate-y-[1px] rounded-lg transition-all duration-200 border-0">
                    <Save className="w-4 h-4 mr-2" /> Save
                </Button>
            </div>
        </div>
    );
};
