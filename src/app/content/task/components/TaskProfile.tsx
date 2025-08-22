"use client";

import React from "react";
import { X } from "lucide-react";

export default function TaskProfile({
  profile,
  onClose,
}: {
  profile: {
    task?: string;
    description?: string;
    employees?: { color?: string; image?: string }[];
  };
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
        <button
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100"
          onClick={onClose}
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Task Profile
        </h2>

        <div className="space-y-3">
          <div>
            <strong className="text-gray-700">Task:</strong>{" "}
            <span>{profile.task}</span>
          </div>
          <div>
            <strong className="text-gray-700">Description:</strong>{" "}
            <span>{profile.description}</span>
          </div>
          <div>
            <strong className="text-gray-700">Employees:</strong>
            <div className="flex gap-2 mt-2">
              {profile.employees?.map((e, idx) => (
                <div
                  key={idx}
                  className="w-10 h-10 rounded-full overflow-hidden border border-gray-200"
                  style={{ backgroundColor: e.color }}
                >
                  {e.image && (
                    <img
                      src={e.image}
                      alt="Employee"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




// "use client";

// import React, { useState } from "react";
// import { Plus, Check, Trash2 } from "lucide-react";

// type Quest = {
//   id: number;
//   title: string;
//   description: string;
//   reward: string;
//   type: "strength" | "intelligence" | "charisma" | "creativity" | "coins";
//   completed: boolean;
// };

// export default function TaskProfilePage() {
//   const [quests, setQuests] = useState<Quest[]>([
//     {
//       id: 1,
//       title: "Complete your first quest",
//       description: "Try adding and completing a new quest to earn rewards!",
//       reward: "+10 strength",
//       type: "strength",
//       completed: false,
//     },
//     {
//       id: 2,
//       title: "Collect 100 coins",
//       description: "Gather coins from completed tasks or quests.",
//       reward: "+10 coins",
//       type: "coins",
//       completed: false,
//     },
//     {
//       id: 3,
//       title: "Improve your intelligence",
//       description: "Read a book to gain +10 intelligence.",
//       reward: "+10 intelligence",
//       type: "intelligence",
//       completed: false,
//     },
//     {
//       id: 4,
//       title: "Help a friend",
//       description: "Assist a friend in completing their quest.",
//       reward: "+10 charisma",
//       type: "charisma",
//       completed: false,
//     },
//   ]);

//   const toggleComplete = (id: number) => {
//     setQuests((prev) =>
//       prev.map((q) =>
//         q.id === id ? { ...q, completed: !q.completed } : q
//       )
//     );
//   };

//   const removeQuest = (id: number) => {
//     setQuests((prev) => prev.filter((q) => q.id !== id));
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
//       <div className="flex gap-6 w-full max-w-5xl">
//         {/* Left Profile Card */}
//         <div className="bg-gray-800 rounded-lg p-6 w-72 flex-shrink-0">
//           <div className="flex flex-col items-center">
//             <img
//               src="https://i.pravatar.cc/100?img=12"
//               alt="avatar"
//               className="w-24 h-24 rounded-full border-4 border-purple-500"
//             />
//             <h2 className="mt-4 text-lg font-semibold">
//               Welcome, <span className="text-purple-400">Adventurer</span>
//             </h2>
//             <p className="text-sm text-gray-400">Level 0</p>
//             <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
//               <div className="bg-purple-500 h-2 w-0 rounded-full"></div>
//             </div>
//             <p className="text-xs mt-1 text-gray-400">XP: 0/100</p>
//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-2 gap-3 mt-6">
//             <div className="bg-gray-700 p-3 rounded-lg text-center">
//               <p className="text-yellow-400 font-bold">10</p>
//               <p className="text-xs">Strength</p>
//             </div>
//             <div className="bg-gray-700 p-3 rounded-lg text-center">
//               <p className="text-blue-400 font-bold">10</p>
//               <p className="text-xs">Intelligence</p>
//             </div>
//             <div className="bg-gray-700 p-3 rounded-lg text-center">
//               <p className="text-pink-400 font-bold">10</p>
//               <p className="text-xs">Charisma</p>
//             </div>
//             <div className="bg-gray-700 p-3 rounded-lg text-center">
//               <p className="text-green-400 font-bold">10</p>
//               <p className="text-xs">Creativity</p>
//             </div>
//           </div>
//         </div>

//         {/* Right Quests Section */}
//         <div className="bg-gray-800 flex-1 rounded-lg p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-semibold">Active Quests</h2>
//             <button className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-md flex items-center gap-1 text-sm">
//               <Plus className="w-4 h-4" /> New Quest
//             </button>
//           </div>

//           <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
//             {quests.map((quest) => (
//               <div
//                 key={quest.id}
//                 className="bg-gray-700 p-4 rounded-lg flex justify-between items-center"
//               >
//                 <div>
//                   <h3 className="font-semibold">{quest.title}</h3>
//                   <p className="text-sm text-gray-300">
//                     {quest.description}
//                   </p>
//                   <span className="inline-block mt-2 text-xs px-2 py-1 bg-purple-600 rounded-md">
//                     {quest.reward}
//                   </span>
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => toggleComplete(quest.id)}
//                     className={`p-2 rounded-md ${
//                       quest.completed
//                         ? "bg-green-600"
//                         : "bg-gray-600 hover:bg-green-500"
//                     }`}
//                   >
//                     <Check className="w-4 h-4" />
//                   </button>
//                   <button
//                     onClick={() => removeQuest(quest.id)}
//                     className="p-2 rounded-md bg-red-600 hover:bg-red-700"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
