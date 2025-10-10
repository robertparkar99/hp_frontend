// "use client";

// import { useState, useEffect } from "react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

// type JobRole = {
//   id: number;
//   industries: string;
//   department: string;
//   sub_department: string;
//   jobrole: string;
//   description: string;
//   jobrole_category: string;
//   performance_expectation: string;
//   status: string;
//   related_jobrole: string;
// };

// type Skill = {
//   id?: number;
//   SkillName: string;
//   description: string;
//   proficiency_level?: string;
//   category: string;
//   sub_category: string;
//   skill_id?: string;
// };

// type Task = {
//   id?: number;
//   taskName: string;
//   critical_work_function: string;
//   department?: string;
//   subDepartment?: string;
//   jobrole?: string;
// };

// type JobDescriptionModalProps = {
//   isOpen: boolean;
//   onClose: () => void;
//   jobRole: JobRole | null;
// };

// export default function JobDescriptionModal({ isOpen, onClose, jobRole }: JobDescriptionModalProps) {
//   const [skillsData, setSkillsData] = useState<Skill[]>([]);
//   const [tasksData, setTasksData] = useState<Task[]>([]);
//   const [loadingSkills, setLoadingSkills] = useState(true);
//   const [loadingTasks, setLoadingTasks] = useState(true);
//   const [sessionData, setSessionData] = useState({
//     url: "",
//     token: "",
//     subInstituteId: "",
//     orgType: "",
//   });

//   // Load session data
//   useEffect(() => {
//     const userData = localStorage.getItem("userData");
//     if (userData) {
//       const { APP_URL, token, sub_institute_id, org_type } = JSON.parse(userData);
//       setSessionData({
//         url: APP_URL,
//         token,
//         subInstituteId: sub_institute_id,
//         orgType: org_type,
//       });
//     }
//   }, []);

//   // Fetch skills data when jobRole changes
//   useEffect(() => {
//     if (jobRole && sessionData.url && sessionData.token) {
//       fetchSkillsData();
//       fetchTasksData();
//     }
//   }, [jobRole, sessionData]);

//   const fetchSkillsData = async () => {
//     if (!jobRole || !sessionData.url || !sessionData.token) return;

//     setLoadingSkills(true);
//     try {
//       const res = await fetch(
//         `${sessionData.url}/jobrole_library/create?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&jobrole=${jobRole.jobrole}&formType=skills`
//       );
//       const data = await res.json();

//       if (data?.userskillData) {
//         const transformedData = Array.isArray(data.userskillData)
//           ? data.userskillData.map((item: any) => ({
//               id: item.id,
//               SkillName: typeof item.skillTitle === 'object' && item.skillTitle !== null
//                 ? (item.skillTitle.title || item.skillTitle.name || String(item.skillTitle))
//                 : String(item.skillTitle || ''),
//               description: String(item.description || item.skillDescription || ''),
//               proficiency_level: String(item.proficiency_level) || '',
//               category: String(item.category || ''),
//               sub_category: String(item.sub_category || ''),
//               skill_id: String(item.skill_id || ''),
//             }))
//           : [];

//         setSkillsData(transformedData);
//       } else {
//         setSkillsData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching skills data:", error);
//       setSkillsData([]);
//     } finally {
//       setLoadingSkills(false);
//     }
//   };

//   const fetchTasksData = async () => {
//     if (!jobRole || !sessionData.url || !sessionData.token) return;

//     setLoadingTasks(true);
//     try {
//       const params = new URLSearchParams({
//         type: "API",
//         token: sessionData.token,
//         sub_institute_id: sessionData.subInstituteId,
//         org_type: sessionData.orgType,
//         jobrole: jobRole.jobrole,
//         formType: "tasks",
//       });

//       const res = await fetch(
//         `${sessionData.url}/jobrole_library/create?${params.toString()}`
//       );
//       const data = await res.json();

//       if (data?.usertaskData) {
//         const transformedData = Array.isArray(data.usertaskData)
//           ? data.usertaskData.map((item: any) => ({
//               id: item.id,
//               taskName: (typeof item.task === 'object' && item.task !== null)
//                 ? (item.task.title || item.task.name || '')
//                 : String(item.task || ''),
//               critical_work_function: String(item.critical_work_function || item.taskcritical_work_function || ''),
//               jobrole: String(item.jobrole || jobRole.jobrole || ''),
//               department: String(item.department || item.sector || ''),
//               subDepartment: String(item.subDepartment || item.track || ''),
//             }))
//           : [];

//         setTasksData(transformedData);
//       } else {
//         setTasksData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching tasks data:", error);
//       setTasksData([]);
//     } finally {
//       setLoadingTasks(false);
//     }
//   };

//   if (!isOpen || !jobRole) return null;

//   // Group skills by category for display
//   const skillsByCategory = skillsData.reduce((acc, skill) => {
//     const category = skill.category || 'Uncategorized';
//     if (!acc[category]) {
//       acc[category] = [];
//     }
//     acc[category].push(skill);
//     return acc;
//   }, {} as Record<string, Skill[]>);

//   // Group tasks by critical work function for display
//   const tasksByFunction = tasksData.reduce((acc, task) => {
//     const functionName = task.critical_work_function || 'Uncategorized';
//     if (!acc[functionName]) {
//       acc[functionName] = [];
//     }
//     acc[functionName].push(task);
//     return acc;
//   }, {} as Record<string, Task[]>);

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//       <div className="bg-white rounded-xl shadow-lg w-full max-w-6xl p-6 overflow-y-auto max-h-[90vh] hide-scroll">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-2xl font-semibold">Job Role: {jobRole.jobrole}</h2>
//           <button
//             className="text-gray-500 hover:text-gray-700"
//             onClick={onClose}
//           >
//             ✕
//           </button>
//         </div>

//         {/* Job Description */}
//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle>Job Description</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4 text-sm text-muted-foreground">
//             <p>{jobRole.description}</p>
//           </CardContent>
//         </Card>

//           {/* Critical Work Functions Table with Real Data */}
//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle>Critical Work Functions & Key Tasks</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {loadingTasks ? (
//               <div className="text-center py-4">Loading tasks data...</div>
//             ) : tasksData.length === 0 ? (
//               <div className="text-center py-4 text-gray-500">
//                 No critical work functions data available for this job role.
//               </div>
//             ) : (
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Critical Work Functions</TableHead>
//                     <TableHead>Key Tasks</TableHead>
//                     {/* <TableHead>Performance Expectations</TableHead> */}
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {Object.entries(tasksByFunction).map(([criticalFunction, tasks], idx) => (
//                     <TableRow key={idx}>
//                       <TableCell className="font-semibold">{criticalFunction}</TableCell>
//                       <TableCell>
//                         <ul className="list-disc ml-4 space-y-1 text-sm">
//                           {tasks.map((task, i) => (
//                             <li key={i}>{task.taskName}</li>
//                           ))}
//                         </ul>
//                       </TableCell>

//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             )}
//           </CardContent>
//         </Card>

//         {/* Skills & Competencies with Real Data Only */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Skills & Competencies</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {loadingSkills ? (
//               <div className="text-center py-4">Loading skills data...</div>
//             ) : skillsData.length === 0 ? (
//               <div className="text-center py-4 text-gray-500">
//                 No skills data available for this job role.
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 {Object.entries(skillsByCategory).map(([category, skills]) => (
//                   <div key={category} className="border-b pb-4 last:border-b-0">
//                     <h4 className="font-semibold text-lg mb-3 text-blue-600">
//                       {category}
//                     </h4>
//                     <div className="grid md:grid-cols-2 gap-4">
//                       {skills.map((skill, index) => (
//                         <div
//                           key={skill.id || index}
//                           className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r"
//                         >
//                           <div className="flex justify-between items-start mb-2">
//                             <h5 className="font-medium text-gray-800 text-base">
//                               {skill.SkillName}
//                             </h5>
//                             {skill.proficiency_level && (
//                               <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
//                                 Level {skill.proficiency_level}
//                               </span>
//                             )}
//                           </div>
//                           {skill.description && (
//                             <p className="text-sm text-gray-600 mb-2">
//                               {skill.description}
//                             </p>
//                           )}
//                           {skill.sub_category && (
//                             <div className="flex justify-between items-center">
//                               <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
//                                 {skill.sub_category}
//                               </span>
//                             </div>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ))}

//                 {/* Skills Summary Statistics */}
//                 {/* <div className="mt-6 bg-blue-50 rounded-lg p-4">
//                   <h4 className="font-semibold mb-3 text-blue-800">Skills Summary</h4>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                     <div className="text-center">
//                       <div className="text-2xl font-bold text-blue-600">
//                         {skillsData.length}
//                       </div>
//                       <div className="text-gray-600">Total Skills</div>
//                     </div>
//                     <div className="text-center">
//                       <div className="text-2xl font-bold text-green-600">
//                         {Object.keys(skillsByCategory).length}
//                       </div>
//                       <div className="text-gray-600">Categories</div>
//                     </div>
//                     <div className="text-center">
//                       <div className="text-2xl font-bold text-purple-600">
//                         {new Set(skillsData.map(s => s.sub_category)).size}
//                       </div>
//                       <div className="text-gray-600">Sub-categories</div>
//                     </div>
//                     <div className="text-center">
//                       <div className="text-2xl font-bold text-orange-600">
//                         {new Set(skillsData.map(s => s.proficiency_level)).size}
//                       </div>
//                       <div className="text-gray-600">Proficiency Levels</div>
//                     </div>
//                   </div>
//                 </div> */}
//               </div>
//             )}
//           </CardContent>
//         </Card>


//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import ViewSkill from "@/components/skillComponent/viewDialouge"; // ✅ import ViewSkill

type JobRole = {
  id: number;
  industries: string;
  department: string;
  sub_department: string;
  jobrole: string;
  description: string;
  jobrole_category: string;
  performance_expectation: string;
  status: string;
  related_jobrole: string;
};

type Skill = {
  id?: number;
  SkillName: string;
  description: string;
  proficiency_level?: string;
  category: string;
  sub_category: string;
  skill_id?: string;
};

type Task = {
  id?: number;
  taskName: string;
  critical_work_function: string;
  department?: string;
  subDepartment?: string;
  jobrole?: string;
};

type JobDescriptionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  jobRole: JobRole | null;
};

export default function JobDescriptionModal({ isOpen, onClose, jobRole }: JobDescriptionModalProps) {
  const [skillsData, setSkillsData] = useState<Skill[]>([]);
  const [tasksData, setTasksData] = useState<Task[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
  });

  // ✅ New state for ViewSkill modal
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [isViewSkillOpen, setIsViewSkillOpen] = useState(false);

  // Load session data
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, sub_institute_id, org_type } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        orgType: org_type,
      });
    }
  }, []);

  // Fetch data
  useEffect(() => {
    if (jobRole && sessionData.url && sessionData.token) {
      fetchSkillsData();
      fetchTasksData();
    }
  }, [jobRole, sessionData]);

  const fetchSkillsData = async () => {
    if (!jobRole || !sessionData.url || !sessionData.token) return;
    setLoadingSkills(true);
    try {
      const res = await fetch(
        `${sessionData.url}/jobrole_library/create?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&jobrole=${jobRole.jobrole}&formType=skills`
      );
      const data = await res.json();

      if (data?.userskillData) {
        const transformedData = Array.isArray(data.userskillData)
          ? data.userskillData.map((item: any) => ({
            id: item.id,
            SkillName:
              typeof item.skillTitle === "object" && item.skillTitle !== null
                ? item.skillTitle.title || item.skillTitle.name || String(item.skillTitle)
                : String(item.skillTitle || ""),
            description: String(item.description || item.skillDescription || ""),
            proficiency_level: String(item.proficiency_level) || "",
            category: String(item.category || ""),
            sub_category: String(item.sub_category || ""),
            skill_id: String(item.skill_id || ""),
          }))
          : [];
        setSkillsData(transformedData);
      } else {
        setSkillsData([]);
      }
    } catch (error) {
      console.error("Error fetching skills data:", error);
      setSkillsData([]);
    } finally {
      setLoadingSkills(false);
    }
  };

  const fetchTasksData = async () => {
    if (!jobRole || !sessionData.url || !sessionData.token) return;
    setLoadingTasks(true);
    try {
      const params = new URLSearchParams({
        type: "API",
        token: sessionData.token,
        sub_institute_id: sessionData.subInstituteId,
        org_type: sessionData.orgType,
        jobrole: jobRole.jobrole,
        formType: "tasks",
      });

      const res = await fetch(`${sessionData.url}/jobrole_library/create?${params.toString()}`);
      const data = await res.json();

      if (data?.usertaskData) {
        const transformedData = Array.isArray(data.usertaskData)
          ? data.usertaskData.map((item: any) => ({
            id: item.id,
            taskName:
              typeof item.task === "object" && item.task !== null
                ? item.task.title || item.task.name || ""
                : String(item.task || ""),
            critical_work_function: String(
              item.critical_work_function || item.taskcritical_work_function || ""
            ),
            jobrole: String(item.jobrole || jobRole.jobrole || ""),
            department: String(item.department || item.sector || ""),
            subDepartment: String(item.subDepartment || item.track || ""),
          }))
          : [];
        setTasksData(transformedData);
      } else {
        setTasksData([]);
      }
    } catch (error) {
      console.error("Error fetching tasks data:", error);
      setTasksData([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  // ✅ Handle skill click to open ViewSkill modal
  const handleSkillClick = (skillId: number) => {
    setSelectedSkillId(skillId);
    setIsViewSkillOpen(true);
  };

  // ✅ Close ViewSkill modal
  const handleCloseViewSkill = () => {
    setIsViewSkillOpen(false);
    setSelectedSkillId(null);
  };

  if (!isOpen || !jobRole) return null;

  // Group data
  const skillsByCategory = skillsData.reduce((acc, skill) => {
    const category = skill.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const tasksByFunction = tasksData.reduce((acc, task) => {
    const fn = task.critical_work_function || "Uncategorized";
    if (!acc[fn]) acc[fn] = [];
    acc[fn].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-6xl p-6 overflow-y-auto max-h-[90vh] hide-scroll">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Job Role: {jobRole.jobrole}</h2>
            <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* 🧩 Job Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>{jobRole.description}</p>
            </CardContent>
          </Card>

          {/* 🧩 Critical Work Functions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Critical Work Functions & Key Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTasks ? (
                <div className="text-center py-4">Loading tasks data...</div>
              ) : tasksData.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No critical work functions data available for this job role.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Critical Work Functions</TableHead>
                      <TableHead>Key Tasks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(tasksByFunction).map(([criticalFunction, tasks], idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-semibold">{criticalFunction}</TableCell>
                        <TableCell>
                          <ul className="list-disc ml-4 space-y-1 text-sm">
                            {tasks.map((task, i) => (
                              <li key={i}>{task.taskName}</li>
                            ))}
                          </ul>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* 🧩 Skills & Competencies */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Competencies</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSkills ? (
                <div className="text-center py-4">Loading skills data...</div>
              ) : skillsData.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No skills data available.</div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(skillsByCategory).map(([category, skills]) => (
                    <div key={category} className="border-b pb-4 last:border-b-0">
                      <h4 className="font-semibold text-lg mb-3 text-blue-600">{category}</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {skills.map((skill, index) => (
                          <div
                            key={skill.id || index}
                            onClick={() => skill.skill_id && handleSkillClick(Number(skill.skill_id))} // ✅ use skill.skill_id here
                            className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r cursor-pointer hover:bg-blue-50 transition"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-800 text-base hover:text-blue-600">
                                {skill.SkillName}
                              </h5>
                              {skill.proficiency_level && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                  Level {skill.proficiency_level}
                                </span>
                              )}
                            </div>
                            {skill.description && (
                              <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                            )}
                            {skill.sub_category && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {skill.sub_category}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* // In your JobDescriptionModal.tsx, update the ViewSkill usage: */}

      {isViewSkillOpen && selectedSkillId && (
        <ViewSkill
          skillId={selectedSkillId}
          formType="user"
          onClose={handleCloseViewSkill}
          onSuccess={() => { }}
          viewMode="kaab-only" // ✅ This will show only KAAB data with proficiency levels
        />
      )}
    </>
  );
}
