export interface Template {
    id: string;
    name: string;
    type: string;
    schema: string; // Storing Craft.js serialized state string
    createdAt: number;
}
