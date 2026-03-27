import { Template } from "../../core/models/Template";

export interface TemplateAdapter {
    save(template: Template): Promise<void>;
    getById(id: string): Promise<Template | null>;
    getAll(): Promise<Template[]>;
    delete(id: string): Promise<void>;
}
