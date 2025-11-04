// // // types.ts

// // // Types for Course Creator Module
// // export type Template = {
// //   id: string;
// //   title: string;
// //   jobRole: string;
// //   criticalWorkFunction: string;
// //   tasks: string[];
// //   skills: string[];
// // };

// // export type Config = {
// //   department: string;
// //   jobRole: string;
// //   criticalWorkFunction: string;
// //   tasks: string[];
// //   skills: string[];
// //   audience: "Student" | "Intern" | "Junior" | "Mid" | "Senior" | "";
// //   proficiencyTarget: number;
// //   duration: "1h" | "2h" | "Half-day" | "1-day" | "Multi-day" | "";
// //   modality: { selfPaced: boolean; instructorLed: boolean; };
// //   outcomes: string[];
// //   aiModel: string;
// // };

// // export interface JobRole {
// //   id: string;
// //   jobrole: string;
// // }

// // export interface Department {
// //   id: string;
// //   department: string;
// // }

// // export interface AiCourseDialogProps {
// //   open: boolean;
// //   onOpenChange: (open: boolean) => void;
// //   onGenerate: (payload: { topic: string; description: string; apiResponse?: any }) => void;
// // }

// // types.ts

// // Types for Course Creator Module
// export type Template = {
//   id: string;
//   title: string;
//   jobRole: string;
//   criticalWorkFunction: string;
//   tasks: string[];
//   skills: string[];
// };

// export type Config = {
//   department: string;
//   jobRole: string;
//   criticalWorkFunction: string;
//   tasks: string[];
//   skills: string[];
//   audience: "Student" | "Intern" | "Junior" | "Mid" | "Senior" | "";
//   proficiencyTarget: number;
//   duration: "1h" | "2h" | "Half-day" | "1-day" | "Multi-day" | "";
//   modality: { selfPaced: boolean; instructorLed: boolean; };
//   outcomes: string[];
//   aiModel: string;
// };

// export interface JobRole {
//   id: string;
//   jobrole: string;
// }

// export interface Department {
//   id: string;
//   department: string;
// }

// export interface AiCourseDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onGenerate: (payload: { topic: string; description: string; apiResponse?: any }) => void;
// }

// Types.ts

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
  audience: "Student" | "Intern" | "Junior" | "Mid" | "Senior" | "";
  proficiencyTarget: number;
  duration: "1h" | "2h" | "Half-day" | "1-day" | "Multi-day" | "";
  modality: { selfPaced: boolean; instructorLed: boolean; };
  outcomes: string[];
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