// "use client";

// import React from "react";

// interface Skill {
//   ability: any[];
//   category: string;
//   description: string;
//   jobrole: string;
//   jobrole_skill_id: number;
//   knowledge: any[];
//   behaviour: any[];
//   attitude: any[];
//   proficiency_level: string;
//   skill: string;
//   skill_id: number;
//   sub_category: string;
//   title: string;
// }

// interface JobroleSkilladd1Props {
//   skills: Skill[];
//   userRatedSkills : any; // Add userRatedSkills prop
// }

// export default function Page({ skills,userRatedSkills }: JobroleSkilladd1Props) {
//   return (
//     <main className="p-6 space-y-6">
//       {/* Top Stats */}
//       <div className="grid grid-cols-4 gap-4">
//         <div className="bg-white shadow rounded p-4">
//           <h3 className="text-sm font-medium text-gray-600">Overall Compliance</h3>
//           <p className="text-2xl font-bold text-green-600">94%</p>
//           <p className="text-xs text-gray-500">456 of 485 employees compliant</p>
//         </div>
//         <div className="bg-white shadow rounded p-4">
//           <h3 className="text-sm font-medium text-gray-600">Overdue Training</h3>
//           <p className="text-2xl font-bold text-orange-500">12</p>
//           <p className="text-xs text-gray-500">Employees past deadline</p>
//         </div>
//         <div className="bg-white shadow rounded p-4">
//           <h3 className="text-sm font-medium text-gray-600">Expiring Soon</h3>
//           <p className="text-2xl font-bold text-blue-600">23</p>
//           <p className="text-xs text-gray-500">Due within 7 days</p>
//         </div>
//         <div className="bg-white shadow rounded p-4">
//           <h3 className="text-sm font-medium text-gray-600">Not Started</h3>
//           <p className="text-2xl font-bold text-red-600">17</p>
//           <p className="text-xs text-gray-500">Haven't begun required training</p>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="grid grid-cols-2 gap-6">
//         {/* Non-Compliant Employees */}
//         <div className="bg-white shadow rounded p-4">
//           <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//             🚨 Skill List
//           </h2>
//           <div className="space-y-4">
//             {/* John Martinez */}
//             <div className="border rounded p-4">
//               <div className="flex justify-between items-center">
//                 <h3 className="font-semibold">John Martinez</h3>
//                 <span className="text-sm px-2 py-1 rounded bg-yellow-100 text-yellow-700">
//                   Medium
//                 </span>
//               </div>
//               <p className="text-red-600 font-medium">5 days overdue</p>
//               <div className="flex gap-2 mt-2">
//                 <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
//                   Data Security Training
//                 </span>
//                 <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
//                   Harassment Prevention
//                 </span>
//               </div>
//               <p className="text-xs text-gray-500 mt-2">Last reminder: 10/01/2024</p>
//               <div className="flex gap-3 mt-3">
//                 <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded">
//                   Send Reminder
//                 </button>
//                 <button className="px-3 py-1 text-sm bg-gray-200 rounded">
//                   View Details
//                 </button>
//               </div>
//             </div>

//             {/* Rachel Green */}
//             <div className="border rounded p-4">
//               <div className="flex justify-between items-center">
//                 <h3 className="font-semibold">Rachel Green</h3>
//                 <span className="text-sm px-2 py-1 rounded bg-red-100 text-red-700">
//                   High Risk
//                 </span>
//               </div>
//               <p className="text-red-600 font-medium">12 days overdue</p>
//               <div className="flex gap-2 mt-2">
//                 <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
//                   Compliance Basics
//                 </span>
//               </div>
//               <p className="text-xs text-gray-500 mt-2">Last reminder: 08/01/2024</p>
//               <div className="flex gap-3 mt-3">
//                 <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded">
//                   Send Reminder
//                 </button>
//                 <button className="px-3 py-1 text-sm bg-gray-200 rounded">
//                   View Details
//                 </button>
//               </div>
//             </div>

//             {/* Tom Wilson */}
//             <div className="border rounded p-4">
//               <div className="flex justify-between items-center">
//                 <h3 className="font-semibold">Tom Wilson</h3>
//                 <span className="text-sm px-2 py-1 rounded bg-blue-100 text-blue-700">
//                   Low Risk
//                 </span>
//               </div>
//               <p className="text-red-600 font-medium">2 days overdue</p>
//               <div className="flex gap-2 mt-2">
//                 <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
//                   Safety Training
//                 </span>
//                 <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
//                   GDPR Compliance
//                 </span>
//               </div>
//               <p className="text-xs text-gray-500 mt-2">Last reminder: 14/01/2024</p>
//               <div className="flex gap-3 mt-3">
//                 <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded">
//                   Send Reminder
//                 </button>
//                 <button className="px-3 py-1 text-sm bg-gray-200 rounded">
//                   View Details
//                 </button>
//               </div>
//             </div>

//             {/* Maria Lopez */}
//             <div className="border rounded p-4">
//               <div className="flex justify-between items-center">
//                 <h3 className="font-semibold">María Lopez</h3>
//                 <span className="text-sm px-2 py-1 rounded bg-yellow-100 text-yellow-700">
//                   Medium
//                 </span>
//               </div>
//               <p className="text-red-600 font-medium">8 days overdue</p>
//               <div className="flex gap-2 mt-2">
//                 <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
//                   Leadership Ethics
//                 </span>
//               </div>
//               <p className="text-xs text-gray-500 mt-2">Last reminder: 09/01/2024</p>
//               <div className="flex gap-3 mt-3">
//                 <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded">
//                   Send Reminder
//                 </button>
//                 <button className="px-3 py-1 text-sm bg-gray-200 rounded">
//                   View Details
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Upcoming Deadlines */}
//         <div className="bg-white shadow rounded p-4">
//           <h2 className="text-lg font-semibold text-gray-800 mb-4">📅 Upcoming Deadlines</h2>
//           <div className="space-y-5">
//             {/* Annual Security Review */}
//             <div>
//               <h3 className="font-semibold">Annual Security Review</h3>
//               <p className="text-sm text-gray-500">All Department</p>
//               <div className="w-full bg-gray-200 rounded h-2 mt-2">
//                 <div className="bg-blue-500 h-2 rounded" style={{ width: "73%" }}></div>
//               </div>
//               <div className="flex justify-between text-xs mt-1">
//                 <span>Completion: 73%</span>
//                 <span className="text-red-600">At Risk</span>
//               </div>
//               <p className="text-xs text-gray-500">Due: 25/01/2024</p>
//             </div>

//             {/* Sales Compliance Update */}
//             <div>
//               <h3 className="font-semibold">Sales Compliance Update</h3>
//               <p className="text-sm text-gray-500">Sales Department</p>
//               <div className="w-full bg-gray-200 rounded h-2 mt-2">
//                 <div className="bg-blue-500 h-2 rounded" style={{ width: "58%" }}></div>
//               </div>
//               <div className="flex justify-between text-xs mt-1">
//                 <span>Completion: 58%</span>
//                 <span className="text-red-600">At Risk</span>
//               </div>
//               <p className="text-xs text-gray-500">Due: 22/01/2024</p>
//             </div>

//             {/* Engineering Safety Protocols */}
//             <div>
//               <h3 className="font-semibold">Engineering Safety Protocols</h3>
//               <p className="text-sm text-gray-500">Engineering Department</p>
//               <div className="w-full bg-gray-200 rounded h-2 mt-2">
//                 <div className="bg-blue-500 h-2 rounded" style={{ width: "98%" }}></div>
//               </div>
//               <div className="flex justify-between text-xs mt-1">
//                 <span>Completion: 98%</span>
//                 <span className="text-green-600">On Track</span>
//               </div>
//               <p className="text-xs text-gray-500">Due: 28/01/2024</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }

"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Skill {
  ability: any[];
  category: string;
  description: string;
  jobrole: string;
  jobrole_skill_id: number;
  knowledge: any[];
  behaviour: any[];
  attitude: any[];
  proficiency_level: string;
  skill: string;
  skill_id: number;
  sub_category: string;
  title: string;
}

interface JobroleSkilladd1Props {
  skills: Skill[];
  userRatedSkills: any;
}

export default function Page({ skills: initialSkills, userRatedSkills: initialUserRatedSkills }: JobroleSkilladd1Props) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills || []);
  const [userRatedSkills, setUserRatedSkills] = useState<any>(initialUserRatedSkills || {});
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const attrArray = [
    { title: "knowledge", icon: "mdi-book-open-page-variant" },
    { title: "ability", icon: "mdi-lightbulb-on" },
    { title: "behaviour", icon: "mdi-account-group" },
    { title: "attitude", icon: "mdi-emoticon-happy-outline" },
  ];

  if (!initialSkills || initialSkills.length === 0) {
    return (
      <main className="p-6 space-y-6">
        <div className="flex justify-center items-center h-64">
          <p>No skills data available</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-4 bg-grey shadow">
        <div className="bg-blue shadow rounded p-4">
          <h3 className="text-sm font-medium text-gray-600">Total Skills</h3>
          <p className="text-2xl font-bold text-green-600">{skills.length}</p>
          <p className="text-xs text-gray-500">Skills in the system</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-sm font-medium text-gray-600">Technical Skills</h3>
          <p className="text-2xl font-bold text-orange-500">
            {skills.filter(skill => skill.category === "Technical Skills").length}
          </p>
          <p className="text-xs text-gray-500">Technical skills</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-sm font-medium text-gray-600">Above 50%</h3>
          <p className="text-2xl font-bold text-blue-600">
            {userRatedSkills.filter((ratedSkill: RatedSkill) => {
              // Extract the level number from skill_level (e.g., "Level 1" -> 1)
              const levelMatch = ratedSkill.skill_level?.match(/\d+/);
              const level = levelMatch ? parseInt(levelMatch[0]) : 0;
              // Level 5 or higher means 50% or more (since each level is 20%)
              return level >= 5;
            }).length}
          </p>
          <p className="text-xs text-gray-500">Skills above 50% proficiency</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-sm font-medium text-gray-600">Below 50%</h3>
          <p className="text-2xl font-bold text-red-600">
            {userRatedSkills.filter((ratedSkill: RatedSkill) => {
              // Extract the level number from skill_level (e.g., "Level 1" -> 1)
              const levelMatch = ratedSkill.skill_level?.match(/\d+/);
              const level = levelMatch ? parseInt(levelMatch[0]) : 0;
              // Level below 5 means less than 50% (since each level is 20%)
              return level < 5;
            }).length}
          </p>
          <p className="text-xs text-gray-500">Skills below 50% proficiency</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-2 gap-6 h-[calc(100vh-12rem)] overflow-y-auto hide-scroll">
        {/* Skill List */}
        <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            <span className="mr-2" role="img" aria-label="warning">🚨</span>
            Skill List
          </h2>
          <div className="space-y-4 h-[calc(100%-3rem)] overflow-y-auto hide-scroll">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <div key={skill.jobrole_skill_id} className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">{skill.title || skill.skill}</h3>
                    <span className="text-sm px-2 py-1 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">
                      Level {skill.proficiency_level}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mt-1">{skill.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded border border-blue-200">
                      {skill.category}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded border border-green-200">
                      {skill.sub_category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Job Role: {skill.jobrole}</p>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => {
                        setSelectedSkill(skill);
                        setIsEditModalOpen(true);
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      View More
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600">No skills found</p>
              </div>
            )}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto hide-scroll">
                <DialogHeader>
                  <DialogTitle>
                    <span className="mdi mdi-brain"></span>{" "}
                    {selectedSkill?.skill ?? "Skill Details"}
                  </DialogTitle>
                </DialogHeader>
                <hr className="m-0 mx-2" />

                {selectedSkill ? (
                  <div className="w-full">
                    {/* Top Info */}
                    <div className="flex gap-4 px-4">
                      <div className="w-1/4 bg-[#eaf7ff] p-2 rounded-md">
                        <span className="mdi mdi-briefcase"></span>&nbsp;
                        <label className="text-bold">Jobrole</label>
                        <hr className="my-2" />
                        {selectedSkill.jobrole}
                      </div>
                      <div className="w-1/4 bg-[#eaf7ff] p-2 rounded-md">
                        <span className="mdi mdi-tag-multiple"></span>&nbsp;
                        <label className="text-bold">Category</label>
                        <hr className="my-2" />
                        {selectedSkill.category}
                      </div>
                      <div className="w-1/4 bg-[#eaf7ff] p-2 rounded-md">
                        <span className="mdi mdi-tag"></span>&nbsp;
                        <label className="text-bold">Sub-Category</label>
                        <hr className="my-2" />
                        {selectedSkill.sub_category}
                      </div>
                      <div className="w-1/4 bg-[#eaf7ff] p-2 rounded-md">
                        <span className="mdi mdi-chart-bar"></span>&nbsp;
                        <label className="text-bold">Proficiency</label>
                        <hr className="my-2" />
                        {selectedSkill.proficiency_level}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="px-4 mt-4">
                      <div className="w-full bg-[#eaf7f2] p-2 rounded-md">
                        <span className="mdi mdi-information-variant-circle"></span>
                        &nbsp;
                        <label className="text-bold">Description</label>
                        <hr className="my-2" />
                        {selectedSkill.description}
                      </div>
                    </div>

                    {/* Knowledge & Ability */}
                    <div className="flex gap-4 px-4 mt-4">
                      {attrArray.map((attr, key) => (
                        <div
                          key={key}
                          className="w-1/2 bg-blue-100 flex rounded-2xl shadow p-2"
                        >
                          <div className="py-2 w-full">
                            <h4 className="font-semibold mb-2">
                              <span className={`mdi ${attr.icon} text-xl`}></span>{" "}
                              {attr.title.charAt(0).toUpperCase() +
                                attr.title.slice(1)}
                            </h4>
                            <hr className="mb-2" />
                            <div className="w-full h-[calc(40vh)] overflow-y-auto hide-scrollbar">
                              {(selectedSkill[attr.title as keyof Skill] as any[])?.map(
                                (item: any, index: number) => (
                                  <div
                                    key={index}
                                    className="w-full bg-white p-2 rounded-lg mb-2"
                                  >
                                    <p className="text-sm">{item}</p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p>No Skill details found</p>
                )}

                <DialogFooter>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Close
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* User Rated Skills */}
        <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            <span className="mr-2" role="img" aria-label="calendar">📅</span>
            User Rated Skills
          </h2>
          <div className="space-y-5 h-[calc(100%-3rem)] overflow-y-auto">
            {userRatedSkills && userRatedSkills.length > 0 ? (
              userRatedSkills.slice(0, 3).map((ratedSkill: any) => {
                // Calculate a completion percentage based on skill_level
                const completionPercentage = ratedSkill.skill_level
                  ? parseInt(ratedSkill.skill_level.replace("Level ", "")) * 20
                  : 50; // Default to 50% if no level

                // Determine status based on completion percentage
                const status = completionPercentage >= 80 ? "On Track" :
                  completionPercentage >= 60 ? "Medium Risk" : "At Risk";
                const statusColor = completionPercentage >= 80 ? "text-green-700" :
                  completionPercentage >= 60 ? "text-yellow-700" : "text-red-700";

                // Format date if available, otherwise use a default
                const created_at = ratedSkill.created_at
                  ? new Date(ratedSkill.created_at).toLocaleDateString()
                  : "N/A";

                return (
                  <div key={ratedSkill.id} className="border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-sm">
                    <h3 className="font-semibold text-gray-800">{ratedSkill.title || "Untitled Skill"}</h3>
                    <p className="text-sm text-gray-600">
                      {ratedSkill.category || "General"} • {ratedSkill.sub_category || "Uncategorized"}
                    </p>
                    <div className="w-full bg-gray-300 rounded h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-700">Completion: {completionPercentage}%</span>
                      <span className={statusColor}>{status}</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      • Updated: {created_at}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600">No user rated skills found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
