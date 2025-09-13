"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

type Department = {
    id: number;
    name: string;
};

export default function JobroleTaxonomy() {
    const [departments, setDepartments] = useState<Department[]>([
        {
            id: 1,
            name: "Technical/Operational",
        },
        {
            id: 2,
            name: "Customer-Facing",
        },
        {
            id: 3,
            name: "Managerial",
        },
        {
            id: 4,
            name: "Creative/Strategic",
        },
        {
            id: 5,
            name: "Compliance-Heavy",
        },
    ]);

    const [showForm, setShowForm] = useState(false);
    const [newDeptName, setNewDeptName] = useState("");

    const handleAddDepartment = () => {
        if (!newDeptName.trim()) return;

        const newDepartment: Department = {
            id: Date.now(),
            name: newDeptName.trim(),
        };

        setDepartments((prev) => [...prev, newDepartment]);
        setNewDeptName("");
        setShowForm(false);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Jobrole Taxonomy</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                    Add Jobrole category
                </button>
            </div>

            {/* Add Department Form */}
            {showForm && (
                <div className="bg-gray-100 p-4 rounded mb-6">
                    <h3 className="font-medium mb-2">Add New Jobrole Category</h3>
                    <input
                        type="text"
                        placeholder="Jobrole Category Name"
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        className="w-full p-2 border rounded mb-3"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 border rounded hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddDepartment}
                            className="px-4 py-2 bg-black text-white rounded"
                        >
                            Add 
                        </button>
                    </div>
                </div>
            )}

            {/* Department List */}
            <div className="space-y-4">
                {departments.map((dept) => (
                    <div
                        key={dept.id}
                        className="border rounded p-4 shadow-sm bg-white"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-lg">{dept.name}</h3>
                            </div>
                            <button className="text-gray-500 hover:text-black">
                                <span
                                    className="mdi mdi-pencil cursor-pointer"

                                ></span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
