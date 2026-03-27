import { Template } from "../../core/models/Template";
import { TemplateAdapter } from "./TemplateAdapter";

const STORAGE_KEY = "hr_templates";

export class LocalStorageAdapter implements TemplateAdapter {
    private getTemplates(): Template[] {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    private setTemplates(templates: Template[]): void {
        if (typeof window === "undefined") return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
        } catch (error) {
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                console.error("LocalStorage quota exceeded. Trying to clear old templates...");
                // Try to remove oldest templates to make space
                if (templates.length > 1) {
                    // Keep only the most recent 5 templates
                    const sortedTemplates = templates.sort((a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                    const trimmedTemplates = sortedTemplates.slice(0, 5);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedTemplates));
                }
            } else {
                throw error;
            }
        }
    }

    async save(template: Template): Promise<void> {
        const templates = this.getTemplates();
        const index = templates.findIndex((t) => t.id === template.id);
        if (index >= 0) {
            templates[index] = template;
        } else {
            templates.push(template);
        }
        try {
            this.setTemplates(templates);
        } catch (error) {
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                console.error("Failed to save template: localStorage quota exceeded");
                // Try to save just this template by itself
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify([template]));
                } catch {
                    // Even saving single template failed - template is too large
                    console.error("Template too large to save");
                }
            }
        }
    }

    async getById(id: string): Promise<Template | null> {
        const templates = this.getTemplates();
        return templates.find((t) => t.id === id) || null;
    }

    async getAll(): Promise<Template[]> {
        return this.getTemplates();
    }

    async delete(id: string): Promise<void> {
        const templates = this.getTemplates();
        this.setTemplates(templates.filter((t) => t.id !== id));
    }
}
