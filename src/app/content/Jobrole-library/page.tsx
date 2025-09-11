"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import AddDialog from "@/components/jobroleComponent/addDialouge";
import { Atom } from "react-loading-indicators" // Import the Loading component

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

export default function HomePage() {
    const [roles, setRoles] = useState<JobRole[]>([]);
    const [selected, setSelected] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState<string[]>([]);
    const [selectedDept, setSelectedDept] = useState<string>("All Departments");
    const [dialogOpen, setDialogOpen] = useState({
        view: false,
        add: false,
        edit: false,
    });
    const [sessionData, setSessionData] = useState({
        url: "",
        token: "",
        subInstituteId: "",
        orgType: "",
        userId: "",
    });

    // ✅ Load session data
    useEffect(() => {
        const userData = localStorage.getItem("userData");
        if (userData) {
            const { APP_URL, token, sub_institute_id, org_type, user_id } =
                JSON.parse(userData);
            setSessionData({
                url: APP_URL,
                token,
                subInstituteId: sub_institute_id,
                orgType: org_type,
                userId: user_id,
            });
        }
    }, []);

    // ✅ Fetch job roles
    useEffect(() => {
        if (!sessionData.url || !sessionData.subInstituteId) return;

        const fetchRoles = async () => {
            try {
                const res = await fetch(
                    `${sessionData.url}/table_data?table=s_user_jobrole&filters[sub_institute_id]=${sessionData.subInstituteId}`
                );
                const json = await res.json();
                console.log("✅ API Response:", json);

                let data: JobRole[] = [];
                if (Array.isArray(json)) {
                    data = json;
                } else if (json?.data) {
                    data = json.data;
                }

                setRoles(data);

                // ✅ Extract unique departments & sort alphabetically
                const uniqueDepts = Array.from(
                    new Set(data.map((r) => r.department).filter(Boolean))
                ).sort((a, b) => a.localeCompare(b));

                setDepartments(["All Departments", ...uniqueDepts]);
            } catch (error) {
                console.error("❌ Error fetching roles:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, [sessionData]);

    // ✅ Filter roles by department
    const filteredRoles =
        selectedDept === "All Departments"
            ? roles
            : roles.filter((role) => role.department === selectedDept);

    return (
        <div className="pt-6 sm:px-4 px-2">
            {/* 🔝 Top bar with dropdown + Add button */}
            <div className="flex justify-between items-center mb-4">
                {/* Department filter dropdown */}
                <div className="w-60">
                    <Select
                        onValueChange={(val) => {
                            setSelectedDept(val);
                            setSelected(null); // reset expanded card when filter changes
                        }}
                        defaultValue="All Departments"
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by department" />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                    {dept}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* ➕ Add Button */}
                <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center"
                    onClick={() => setDialogOpen({ ...dialogOpen, add: true })}
                    data-titlehead="Add New Jobrole"
                >
                    +
                </button>
            </div>

            {/* Add Dialog */}
            {dialogOpen.add && (
                <AddDialog
                    skillId={null}
                    onClose={() => setDialogOpen({ ...dialogOpen, add: false })}
                    onSuccess={() => {
                        setDialogOpen({ ...dialogOpen, add: false });
                    }}
                />
            )}

            {/* Loader / No Data / Cards */}
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <Atom color="#525ceaff" size="medium" text="" textColor="" />
                </div>
            ) : filteredRoles.length === 0 ? (
                <div className="text-center text-gray-600">No job roles found.</div>
            ) : (
                <div
                    className="
            grid gap-2.5 min-h-40 w-full
            sm:grid-cols-6 grid-cols-2 grid-flow-dense
            auto-rows-[110px]
          "
                >
                    {filteredRoles.map((role) => {
                        const isSelected = selected === role.id;
                        return (
                            <motion.div
                                key={role.id}
                                layout
                                transition={{
                                    layout: { duration: 0.4, ease: "easeInOut" },
                                }}
                                onClick={() => setSelected(isSelected ? null : role.id)}
                                className={`relative cursor-pointer 
                  bg-[#5E9DFF] rounded-[5px] hover:rounded-[20px] 
                  flex flex-col items-center justify-center text-center p-3
                  text-white
                  ${isSelected
                                        ? "sm:col-span-2 sm:row-span-2 col-span-2 row-span-2"
                                        : ""
                                    }
                `}
                            >
                                {/* Card Title */}
                                <motion.span layout className="text-[14px] font-semibold">
                                    {role.jobrole}
                                </motion.span>

                                {/* Expanded Content */}
                                {isSelected && (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute inset-0 z-10 flex items-center justify-center"
                                    >
                                        <div className="bg-white text-black rounded-md border border-gray-300 w-full h-full flex">
                                            {/* Left Blue Strip */}
                                            <div className="w-1 bg-[#5E9DFF] rounded-l-md"></div>

                                            {/* Content Area */}
                                            <div className="flex-1 p-4 flex flex-col">
                                                {/* Title */}
                                                <h3 className="text-base font-semibold text-center mb-2">
                                                    {role.jobrole}
                                                </h3>

                                                {/* Divider */}
                                                <div className="border-t border-gray-600 mb-3"></div>

                                                {/* Description */}
                                                <p
                                                    className="mb-3 line-clamp-3 overflow-hidden text-ellipsis"
                                                    title={role.description}
                                                >
                                                    <span className="font-bold">Description:</span>{" "}
                                                    {role.description}
                                                </p>

                                                {/* Expectation */}
                                                <p>
                                                    <span className="font-bold">
                                                        Performance Expectation:
                                                    </span>{" "}
                                                    {role.performance_expectation}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
