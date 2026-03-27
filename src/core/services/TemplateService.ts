import { Template } from "../models/Template";
import { TemplateAdapter } from "../../infrastructure/adapters/TemplateAdapter";

export class TemplateService {
    constructor(private adapter: TemplateAdapter) { }

    async saveTemplate(template: Template): Promise<void> {
        await this.adapter.save(template);
    }

    async getTemplate(id: string): Promise<Template | null> {
        return await this.adapter.getById(id);
    }

    async getAllTemplates(): Promise<Template[]> {
        return await this.adapter.getAll();
    }

    async deleteTemplate(id: string): Promise<void> {
        await this.adapter.delete(id);
    }

    async updateTemplate(id: string, updates: Partial<Omit<Template, 'id' | 'createdAt'>>): Promise<void> {
        const template = await this.adapter.getById(id);
        if (template) {
            const updatedTemplate = { ...template, ...updates };
            await this.adapter.save(updatedTemplate);
        }
    }
}
