"use client";
import React, { useEffect, useState } from "react";
import { Atom } from "react-loading-indicators";
import { Funnel } from "lucide-react"; // ✅ filter icon
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

type JobRoleTask = {
  id: number;
  sector: string; // Department
  track: string;
  jobrole: string;
  critical_work_function: string;
  task: string;
  task_type: string;
  sub_institute_id: number;
};

const CriticalWorkFunctionGrid = () => {
  const [data, setData] = useState<JobRoleTask[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedJobrole, setSelectedJobrole] = useState<string>("");
  const [selectedFunction, setSelectedFunction] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });

  // ✅ Load sessionData from localStorage
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

  // ✅ Fetch data after sessionData is loaded
  useEffect(() => {
    if (!sessionData.url || !sessionData.subInstituteId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `${sessionData.url}/table_data?table=s_user_jobrole_task&filters[sub_institute_id]=${sessionData.subInstituteId}&order_by[direction]=desc&group_by=task`,
          {
            headers: {
              Authorization: `Bearer ${sessionData.token}`,
            },
          }
        );
        const json: JobRoleTask[] = await res.json();
        setData(json);

        // ✅ Set defaults
        if (json.length > 0) {
          const depts = Array.from(new Set(json.map((d) => d.sector))).sort(
            (a, b) => a.localeCompare(b)
          );
          const defaultDept = depts[0] || "";

          const jobroles = Array.from(
            new Set(json.filter((d) => d.sector === defaultDept).map((d) => d.jobrole))
          ).sort((a, b) => a.localeCompare(b));
          const defaultJobrole = jobroles[0] || "";

          const functions = Array.from(
            new Set(
              json
                .filter((d) => d.sector === defaultDept && d.jobrole === defaultJobrole)
                .map((d) => d.critical_work_function)
            )
          ).sort((a, b) => a.localeCompare(b));
          const defaultFunc = functions[0] || "";

          setSelectedDept(defaultDept);
          setSelectedJobrole(defaultJobrole);
          setSelectedFunction(defaultFunc);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Atom color="#525ceaff" size="medium" text="" textColor="" />
      </div>
    );
  }

  // ✅ Unique filters (sorted alphabetically)
  const uniqueDepartments = Array.from(new Set(data.map((d) => d.sector))).sort(
    (a, b) => a.localeCompare(b)
  );

  const uniqueJobroles = Array.from(
    new Set(data.filter((d) => d.sector === selectedDept).map((d) => d.jobrole))
  ).sort((a, b) => a.localeCompare(b));

  const uniqueFunctions = Array.from(
    new Set(
      data
        .filter((d) => d.sector === selectedDept && d.jobrole === selectedJobrole)
        .map((d) => d.critical_work_function)
    )
  ).sort((a, b) => a.localeCompare(b));

  // ✅ Filtered grid data
  const filteredData = data.filter(
    (item) =>
      item.sector === selectedDept &&
      item.jobrole === selectedJobrole &&
      item.critical_work_function === selectedFunction
  );

  return (
    <div className="min-h-screen p-4">
      {/* Top bar: Filters + Funnel */}
      <div className="flex justify-end mb-6">
        <div className="flex items-center gap-4">
          {/* Filters with animation */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: 100 }} // slide from right
                animate={{ opacity: 1, x: 0 }} // visible
                exit={{ opacity: 0, x: 100 }} // slide back right
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex flex-col md:flex-row gap-4"
              >
                {/* Department */}
                <Select
                  value={selectedDept}
                  onValueChange={(val) => {
                    setSelectedDept(val);
                    const jobroles = Array.from(
                      new Set(data.filter((d) => d.sector === val).map((d) => d.jobrole))
                    ).sort((a, b) => a.localeCompare(b));
                    const firstJobrole = jobroles[0] || "";
                    setSelectedJobrole(firstJobrole);

                    const functions = Array.from(
                      new Set(
                        data
                          .filter((d) => d.sector === val && d.jobrole === firstJobrole)
                          .map((d) => d.critical_work_function)
                      )
                    ).sort((a, b) => a.localeCompare(b));
                    const firstFunc = functions[0] || "";
                    setSelectedFunction(firstFunc);
                  }}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueDepartments.map((dept, idx) => (
                      <SelectItem key={idx} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Jobrole */}
                <Select
                  value={selectedJobrole}
                  onValueChange={(val) => {
                    setSelectedJobrole(val);
                    const functions = Array.from(
                      new Set(
                        data
                          .filter((d) => d.sector === selectedDept && d.jobrole === val)
                          .map((d) => d.critical_work_function)
                      )
                    ).sort((a, b) => a.localeCompare(b));
                    const firstFunc = functions[0] || "";
                    setSelectedFunction(firstFunc);
                  }}
                >
                  <SelectTrigger className="w-[260px]">
                    <SelectValue placeholder="Select Jobrole" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueJobroles.map((role, idx) => (
                      <SelectItem key={idx} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Critical Work Function */}
                <Select
                  value={selectedFunction}
                  onValueChange={(val) => setSelectedFunction(val)}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select Work Function" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueFunctions.map((func, idx) => (
                      <SelectItem key={idx} value={func}>
                        {func}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Funnel Button */}
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="p-3"
          >
            <Funnel className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item) => (
          <div
            key={item.id}
            className="relative group overflow-hidden rounded-3xl shadow-lg border-2 border-blue-200 hover:border-blue-300 transition-all duration-300"
          >
            {/* Animated sweeping circle */}
            <div className="absolute z-[10] right-0 bottom-0 w-[1px] h-[1px] bg-[#B7DAFF] rounded-[0px_50px_0px_15px] transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:rounded-[15px] group-hover:opacity-[0.5]"></div>

            {/* Content */}
            <div className="relative z-10 p-8">
              <h3
                className="text-lg font-bold text-gray-900 mb-2 leading-tight truncate"
                title={item.critical_work_function}
              >
                {item.critical_work_function}
              </h3>

              {/* Decorative line */}
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="flex-1 h-0.5 bg-gray-300"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>

              <p className="text-gray-700 text-sm leading-relaxed">
                {item.task}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CriticalWorkFunctionGrid;
