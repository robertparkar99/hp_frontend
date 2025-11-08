export type Template = {
  id: string;
  title: string;
  jobRole: string;
  criticalWorkFunction: string;
  tasks: string[];
  skills: string[];
};

export type Config = {
  department: string;
  jobRole: string;
  criticalWorkFunction: string;
  tasks: string[];
  skills: string[];
  proficiencyTarget: number;
  modality: { selfPaced: boolean; instructorLed: boolean; };
  key_task?: string | string[];
  aiModel: string;
};

export interface JobRole {
  id: string;
  jobrole: string;
}

export interface Department {
  id: string;
  department: string;
}

export interface AiCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (payload: { topic: string; description: string; apiResponse?: any }) => void;
}