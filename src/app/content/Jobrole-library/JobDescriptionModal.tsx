"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
// import ViewSkill from "@/components/skillComponent/viewDialouge"; // ✅ import ViewSkill
import { Description } from "@radix-ui/react-dialog";


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

type KabaItem = {
    id: number;
    category: string;
    sub_category: string;
    title: string;
    description?: string;
};

type JobDescriptionModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfig: (jsonObject: any) => void;
    onGenerateAssessment: (data: any) => void;
    jobRole: JobRole | null;
};

type CompetencyItem = {
    id: number;
    title: string;
    category: string;
    sub_category: string;
};

export default function JobDescriptionModal({ isOpen, onClose, onConfig, onGenerateAssessment, jobRole }: JobDescriptionModalProps) {
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

    // KABA states
    const [loadingKaba, setLoadingKaba] = useState(true);
    const [knowledgeItems, setKnowledgeItems] = useState<KabaItem[]>([]);
    const [abilityItems, setAbilityItems] = useState<KabaItem[]>([]);
    const [attitudeItems, setAttitudeItems] = useState<KabaItem[]>([]);
    const [behaviourItems, setBehaviourItems] = useState<KabaItem[]>([]);

    // ✅ New state for ViewSkill modal
    const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
    const [isViewSkillOpen, setIsViewSkillOpen] = useState(false);

    // State for selected critical work function
    const [selectedFunction, setSelectedFunction] = useState<string | null>(null);

    // State for selected skill
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

    // State to show/hide skill radio buttons
    const [showSkillRadios, setShowSkillRadios] = useState(false);



    const CompetencySection = ({
        title,
        items,
    }: {
        title: string;
        items: CompetencyItem[];
    }) => {
        return (
            <div>
                <h4 className="text-base font-semibold mb-3">{title}</h4>

                {items.length === 0 ? (
                    <div className="text-gray-500 text-sm">No {title.toLowerCase()} items.</div>
                ) : (
                    <ul className="space-y-3">
                        {items.map((item) => (
                            <li key={item.id} className="pl-4 border-l-2 border-blue-500">
                                <div className="font-semibold text-gray-900">
                                    {item.title}
                                </div>
                                <div className="text-sm text-gray-600 mt-0.5 flex flex-col gap-0.5">
                                    <span>
                                        <strong>Category:</strong> {item.category}
                                    </span>

                                    {item.sub_category && (
                                        <span>
                                            <strong>Sub-category:</strong> {item.sub_category}
                                        </span>
                                    )}
                                </div>

                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    // Log JSON object when critical work function is selected
    useEffect(() => {
        if (selectedFunction && jobRole && sessionData.orgType) {
            // Calculate tasksByFunction locally
            const tasksByFunction = tasksData.reduce((acc, task) => {
                const fn = task.critical_work_function || "Uncategorized";
                if (!acc[fn]) acc[fn] = [];
                acc[fn].push(task);
                return acc;
            }, {} as Record<string, Task[]>);

            const tasksForFunction = tasksByFunction[selectedFunction] || [];
            const keyTasks = tasksForFunction.map(task => task.taskName);

            const jsonObject = {
                industry: sessionData.orgType,
                department: jobRole.department,
                jobrole: jobRole.jobrole,
                description: jobRole.description,
                critical_work_function: selectedFunction,
                key_tasks: keyTasks
            };

            console.log("Selected Critical Work Function Data:", JSON.stringify(jsonObject, null, 2));
        }
    }, [selectedFunction, jobRole, sessionData.orgType, tasksData]);

    // Log JSON object when skill is selected
    useEffect(() => {
        if (selectedSkill && jobRole && sessionData.orgType) {
            const selectedSkillData = skillsData.find(skill => skill.skill_id === selectedSkill);
            if (selectedSkillData) {
                const jsonObject = {
                    industry: sessionData.orgType,
                    department: jobRole.department,
                    jobrole: jobRole.jobrole,
                    description: jobRole.description,
                    selected_skill: {
                        skillName: selectedSkillData.SkillName,
                        category: selectedSkillData.category,
                        sub_category: selectedSkillData.sub_category,
                        proficiency_level: selectedSkillData.proficiency_level,
                        description: selectedSkillData.description,
                        skill_id: selectedSkillData.skill_id
                    }
                };

                console.log("Selected Skill Data:", JSON.stringify(jsonObject, null, 2));
            }
        }
    }, [selectedSkill, jobRole, sessionData.orgType, skillsData]);

    // State to show/hide radio buttons
    const [showRadios, setShowRadios] = useState(false);

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
            fetchKabaData();
        }
    }, [jobRole, sessionData]);

    const fetchKabaData = async () => {
        if (!jobRole || !sessionData.url) return;
        setLoadingKaba(true);
        try {
            const base = sessionData.url.replace(/\/$/, "");
            const params = new URLSearchParams({
                sub_institute_id: sessionData.subInstituteId,
                type: "jobrole",
                type_id: String(jobRole.id),
            } as Record<string, string>);

            const res = await fetch(`${base}/get-kaba?${params.toString()}`);
            const data = await res.json();

            setKnowledgeItems(Array.isArray(data?.knowledge) ? data.knowledge : []);
            setAbilityItems(Array.isArray(data?.ability) ? data.ability : []);
            setAttitudeItems(Array.isArray(data?.attitude) ? data.attitude : []);
            // API returns 'behaviour' (British spelling) or 'behavior' sometimes; handle both
            setBehaviourItems(Array.isArray(data?.behaviour) ? data.behaviour : Array.isArray(data?.behavior) ? data.behavior : []);
        } catch (error) {
            console.error("Error fetching KABA data:", error);
            setKnowledgeItems([]);
            setAbilityItems([]);
            setAttitudeItems([]);
            setBehaviourItems([]);
        } finally {
            setLoadingKaba(false);
        }
    };

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
                        industry: sessionData.orgType || "",
                        department: String(item.subDepartment || item.track || ""),
                        jobrole: String(item.jobrole || jobRole.jobrole || ""),
                        critical_work_function: String(
                            item.critical_work_function || item.taskcritical_work_function || ""
                        ),
                        taskName:
                            typeof item.task === "object" && item.task !== null
                                ? item.task.title || item.task.name || ""
                                : String(item.task || ""),
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

    const mapKabaItems = (arr: KabaItem[]) => arr.map((i) => ({ id: i.id, category: i.category, sub_category: i.sub_category, title: i.title }));

    // ✅ Handle skill click to open ViewSkill modal
    // const handleSkillClick = (skillId: number) => {
    //   setSelectedSkillId(skillId);
    //   setIsViewSkillOpen(true);
    // };

    // // ✅ Close ViewSkill modal
    // const handleCloseViewSkill = () => {
    //   setIsViewSkillOpen(false);
    //   setSelectedSkillId(null);
    // };

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

    const filteredJobRole = {
        id: jobRole.id,
        industries: jobRole.industries,
        department: jobRole.department,
        sub_department: jobRole.sub_department,
        department_id: (jobRole as any).department_id || '',
        jobrole: jobRole.jobrole,
        description: jobRole.description,
    };

    const allData = {
        jobRole: filteredJobRole,
        skillsData,
        tasksData,
        knowledgeItems,
        abilityItems,
        attitudeItems,
        behaviourItems,
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-6xl p-6 overflow-y-auto max-h-[90vh] hide-scroll">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        {/* Left: Job Role */}
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-semibold">Job Role: {jobRole.jobrole}</h2>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => onGenerateAssessment(allData)}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-sm
                 hover:bg-green-600 focus:outline-none focus:ring-2
                 focus:ring-green-400 focus:ring-offset-1 transition"
                            >
                                Generate Assessment with AI
                            </Button>

                            <button
                                onClick={onClose}
                                aria-label="Close"
                                className="w-9 h-9 flex items-center justify-center rounded-full
                 text-gray-500 hover:text-gray-700 hover:bg-gray-100
                 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                            >
                                ✕
                            </button>
                        </div>
                    </div>


                    {/* 🧩 Job Description */}
                    <Card className="mb-6">
                        <CardHeader className="flex flex-row items-center justify-between w-full px-4">
                            <CardTitle className="text-lg font-bold">Job Description</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-muted-foreground">
                            <p>{jobRole.description}</p>
                        </CardContent>
                    </Card>

                    {/* 🧩 Critical Work Functions */}
                    <Card className="mb-6">
                        {/* <CardHeader className="flex flex-row items-center justify-between w-full px-4">
                            <CardTitle className="text-lg font-bold">
                                Critical Work Functions & Key Tasks
                            </CardTitle>
                            <Button onClick={() => console.log('Generate Assessment with AI clicked')} className="bg-blue-400 text-white hover:bg-blue-500">
                                Generate Assessment with AI
                            </Button>
                            <Button onClick={() => setShowRadios(!showRadios)} className="bg-blue-400 text-white hover:bg-blue-500">
                                {showRadios ? 'Hide Selection' : 'Build Course with AI'}
                            </Button>
                        </CardHeader> */}

                        <CardHeader className="flex flex-row items-center justify-between w-full px-4">
                            {/* Title */}
                            <CardTitle className="text-lg font-bold text-gray-900">
                                Critical Work Functions & Key Tasks
                            </CardTitle>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                {/* Generate Assessment with AI */}
                                {/* <Button
                                    onClick={() => onGenerateAssessment(allData)}
                                    className="bg-green-400 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-400"
                                >
                                    Generate Assessment with AI
                                </Button> */}

                                {/* Build Course with AI */}
                                <Button
                                    onClick={() => setShowRadios(!showRadios)}
                                    className="bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"
                                >
                                    {showRadios ? "Hide Selection" : "Build Course with AI"}
                                </Button>
                            </div>
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
                                            {showRadios && <TableHead>Select</TableHead>}
                                            <TableHead>Critical Work Functions</TableHead>
                                            <TableHead>Key Tasks</TableHead>
                                            {showRadios && <TableHead>Actions</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.entries(tasksByFunction).map(([criticalFunction, tasks], idx) => (
                                            <TableRow key={criticalFunction}>
                                                {showRadios && (
                                                    <TableCell>
                                                        <input
                                                            type="radio"
                                                            name="criticalFunction"
                                                            value={criticalFunction}
                                                            checked={selectedFunction === criticalFunction}
                                                            onChange={() => setSelectedFunction(criticalFunction)}
                                                        />
                                                    </TableCell>
                                                )}
                                                <TableCell className="font-semibold">{criticalFunction}</TableCell>
                                                <TableCell>
                                                    <ul className="list-disc ml-4 space-y-1 text-sm">
                                                        {tasks.map((task, i) => (
                                                            <li key={task.id || i}>{task.taskName}</li>
                                                        ))}
                                                    </ul>
                                                </TableCell>
                                                {showRadios && (
                                                    <TableCell>
                                                        {selectedFunction === criticalFunction && (
                                                            <Button className="bg-green-400 text-white hover:bg-green-500" onClick={() => {
                                                                const tasksByFunction = tasksData.reduce((acc, task) => {
                                                                    const fn = task.critical_work_function || "Uncategorized";
                                                                    if (!acc[fn]) acc[fn] = [];
                                                                    acc[fn].push(task);
                                                                    return acc;
                                                                }, {} as Record<string, Task[]>);

                                                                const tasksForFunction = tasksByFunction[selectedFunction] || [];
                                                                const keyTasks = tasksForFunction.map(task => task.taskName);

                                                                const payload = {
                                                                    industry: sessionData.orgType,
                                                                    department: jobRole.department,
                                                                    jobrole: jobRole.jobrole,
                                                                    description: jobRole.description,
                                                                    critical_work_function: selectedFunction,
                                                                    key_tasks: keyTasks,
                                                                    knowledge: mapKabaItems(knowledgeItems),
                                                                    ability: mapKabaItems(abilityItems),
                                                                    attitude: mapKabaItems(attitudeItems),
                                                                    behaviour: mapKabaItems(behaviourItems),
                                                                };

                                                                // ✅ CONSOLE LOG ON CONFIG CLICK
                                                                console.log("🟢 Configuration Payload (Critical Work Function):",
                                                                    JSON.stringify(payload, null, 2)
                                                                );

                                                                onConfig(payload);
                                                            }}
                                                            >
                                                                Configuration</Button>
                                                        )}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/*Skills*/}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between w-full px-4">
                            <CardTitle className="text-lg font-bold">
                                Skills
                            </CardTitle>

                            <Button onClick={() => setShowSkillRadios(!showSkillRadios)} className="bg-blue-400 text-white hover:bg-blue-500">
                                {showSkillRadios ? 'Hide Selection' : 'Build Course with AI'}
                            </Button>
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
                                                        key={skill.id || skill.skill_id || index}
                                                        className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r cursor-default hover:bg-blue-50 transition relative"
                                                    >
                                                        {showSkillRadios && (
                                                            <input
                                                                type="radio"
                                                                name="skillSelection"
                                                                value={skill.skill_id}
                                                                checked={selectedSkill === skill.skill_id}
                                                                onChange={() => skill.skill_id && setSelectedSkill(skill.skill_id)}
                                                                className="justify-between bottom-2 right-2"
                                                            />
                                                        )}
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
                                                                    sub-category: {skill.sub_category}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {showSkillRadios && selectedSkill === skill.skill_id && (
                                                            <Button className="bg-green-400 text-white hover:bg-green-500 mt-2 w-full" onClick={(e) => {
                                                                e.stopPropagation();

                                                                const payload = {
                                                                    industry: sessionData.orgType,
                                                                    department: jobRole.department,
                                                                    jobrole: jobRole.jobrole,
                                                                    description: jobRole.description,
                                                                    selected_skill: {
                                                                        skillName: skill.SkillName,
                                                                        category: skill.category,
                                                                        sub_category: skill.sub_category,
                                                                        proficiency_level: skill.proficiency_level,
                                                                        description: skill.description,
                                                                        skill_id: skill.skill_id
                                                                    },
                                                                    knowledge: mapKabaItems(knowledgeItems),
                                                                    ability: mapKabaItems(abilityItems),
                                                                    attitude: mapKabaItems(attitudeItems),
                                                                    behaviour: mapKabaItems(behaviourItems),
                                                                };

                                                                // ✅ CONSOLE LOG ON CONFIG CLICK
                                                                console.log("🟢 Configuration Payload (Skill):",
                                                                    JSON.stringify(payload, null, 2)
                                                                );

                                                                onConfig(payload);
                                                            }}>
                                                                Configuration
                                                            </Button>
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

                    {/*Competencies */}
                    <Card className="mt-6">
                        <CardHeader className="flex flex-row items-center justify-between w-full px-4">
                            <CardTitle className="text-lg font-bold">Competencies</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingKaba ? (
                                <div className="text-center py-4">Loading KABA data...</div>
                            ) : (
                                <div className="space-y-6 text-sm">

                                    {/* Knowledge */}
                                    <CompetencySection
                                        title="Knowledge"
                                        items={knowledgeItems}
                                    />

                                    {/* Ability */}
                                    <CompetencySection
                                        title="Ability"
                                        items={abilityItems}
                                    />

                                    {/* Attitude */}
                                    <CompetencySection
                                        title="Attitude"
                                        items={attitudeItems}
                                    />

                                    {/* Behaviour */}
                                    <CompetencySection
                                        title="Behaviour"
                                        items={behaviourItems}
                                    />

                                </div>
                            )}
                        </CardContent>

                    </Card>
                </div>
            </div>


            {/* // In your JobDescriptionModal.tsx, update the ViewSkill usage: */}

            {/* {isViewSkillOpen && selectedSkillId && (
        <ViewSkill
          skillId={selectedSkillId}
          formType="user"
          onClose={handleCloseViewSkill}
          onSuccess={() => { }}
          viewMode="kaab-only" // ✅ This will show only KAAB data with proficiency levels
        />
      )} */}
        </>
    );
}
