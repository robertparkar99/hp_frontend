"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, FileText, Trash2, Edit } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { v4 as uuidv4 } from "uuid";

interface SessionData {
    url?: string;
    token?: string;
    sub_institute_id?: string;
}

interface ApiTemplate {
    id: number;
    name: string;
    content: string;
    status: string;
    sub_institute_id: number;
}

export default function DashboardTemplatesPage() {
    const router = useRouter();
    const [templates, setTemplates] = useState<ApiTemplate[]>([]);
    const [sessionData, setSessionData] = useState<SessionData>({});

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userData = localStorage.getItem("userData");
            if (userData) {
                const { APP_URL, token, sub_institute_id } = JSON.parse(userData);
                setSessionData({ url: APP_URL, token, sub_institute_id });
            }
        }
    }, []);

    const loadTemplates = async () => {
        try {
            const response = await fetch(
                `${sessionData.url}/api/templates?sub_institute_id=${sessionData.sub_institute_id}`,
                {
                    headers: {
                        "Authorization": `Bearer ${sessionData.token}`
                    }
                }
            );
            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            }
        } catch (error) {
            console.error("Failed to load templates:", error);
        }
    };

    useEffect(() => {
        if (sessionData.url && sessionData.token) {
            loadTemplates();
        }
    }, [sessionData]);

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this template?")) {
            try {
                await fetch(`${sessionData.url}/api/templates/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${sessionData.token}`
                    }
                });
                loadTemplates();
            } catch (error) {
                console.error("Failed to delete template:", error);
            }
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-8 min-h-[calc(100vh-64px)]">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Templates </h1>
                    <p className="text-muted-foreground mt-1">Manage your HR document templates..</p>
                </div>
                <button
                    onClick={() => router.push(`/content/hr-templates/editor/${uuidv4()}`)}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium h-10 px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" /> Create New
                </button>
            </div>

            {templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white border border-dashed rounded-lg">
                    <FileText className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-foreground">No templates</h3>
                    <p className="text-sm text-muted-foreground mb-4">You have not created any templates yet.</p>
                    <button
                        onClick={() => router.push(`/content/hr-templates/editor/${uuidv4()}`)}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium h-10 px-4 py-2 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        Create your first template
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <div key={template.id} className="bg-white border rounded-lg hover:shadow-md transition-shadow overflow-hidden">
                            <div className="p-6">
                                <h3 className="font-medium text-lg truncate mb-1" title={template.name}>{template.name}</h3>
                                <span className="text-xs text-muted-foreground">ID: {template.id}</span>

                                <div className="flex space-x-2 mt-4">
                                    <Link
                                        href={`/content/hr-templates/editor/${template.id}`}
                                        className="flex-1 inline-flex items-center justify-center rounded-md font-medium h-9 px-3 text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                                    >
                                        <Edit className="w-4 h-4 mr-2" /> Edit
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                        onClick={() => handleDelete(template.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
