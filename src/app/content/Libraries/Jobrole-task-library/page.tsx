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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // ✅ Popover
import { motion } from "framer-motion";
import TaskData from "@/components/jobroleComponent/tabComponent/taskData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaEdit, FaTrash } from "react-icons/fa";

type JobRoleTask = {
  id: number;
  sector: string;
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
  const [editData, setEditData] = useState<any>({});
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedJobrole, setSelectedJobrole] = useState<string>("");
  const [selectedFunction, setSelectedFunction] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isView, setView] = useState(false);
  const [viewData, setViewData] = useState<any>({});
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });
  const [selectedJobRole, setSelectedJobRole] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState({
    view: false,
    add: false,
    edit: false,
  });

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

  useEffect(() => {
    if (!sessionData.url || !sessionData.subInstituteId) return;
    fetchData();
  }, [sessionData]);

  const fetchData = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/table_data?table=s_user_jobrole_task&filters[sub_institute_id]=${sessionData.subInstituteId}&filters[sector]=${sessionData.orgType}&order_by[direction]=desc&group_by=task`,
        {
          headers: {
            Authorization: `Bearer ${sessionData.token}`,
          },
        }
      );
      const json: JobRoleTask[] = await res.json();
      setData(json);

      if (json.length > 0) {
        const depts = Array.from(new Set(json.map((d) => d.track || "")))
          .filter(Boolean)
          .sort();
        const defaultDept = depts[0] || "";

        const jobroles = Array.from(
          new Set(
            json
              .filter((d) => d.track === defaultDept)
              .map((d) => d.jobrole || "")
          )
        )
          .filter(Boolean)
          .sort();
        const defaultJobrole = jobroles[0] || "";

        const functions = Array.from(
          new Set(
            json
              .filter(
                (d) => d.track === defaultDept && d.jobrole === defaultJobrole
              )
              .map((d) => d.critical_work_function || "")
          )
        )
          .filter(Boolean)
          .sort();
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Atom color="#525ceaff" size="medium" text="" textColor="" />
      </div>
    );
  }

  const uniqueDepartments =
    data.length > 0
      ? Array.from(new Set(data.map((d) => d.track || "")))
          .filter(Boolean)
          .sort()
      : [];

  const uniqueJobroles =
    data.length > 0
      ? Array.from(
          new Set(
            data.filter((d) => d.track === selectedDept).map((d) => d.jobrole || "")
          )
        )
          .filter(Boolean)
          .sort()
      : [];

  const uniqueFunctions =
    data.length > 0
      ? Array.from(
          new Set(
            data
              .filter(
                (d) => d.track === selectedDept && d.jobrole === selectedJobrole
              )
              .map((d) => d.critical_work_function || "")
          )
        )
          .filter(Boolean)
          .sort()
      : [];

  const filteredData =
    data.length > 0
      ? data.filter(
          (item) =>
            item.track === selectedDept &&
            item.jobrole === selectedJobrole &&
            item.critical_work_function === selectedFunction
        )
      : [];

  const handleDepartmentChange = (val: string) => {
    setSelectedDept(val);
    const jobroles =
      data.length > 0
        ? Array.from(
            new Set(data.filter((d) => d.track === val).map((d) => d.jobrole || ""))
          )
            .filter(Boolean)
            .sort()
        : [];
    const firstJobrole = jobroles[0] || "";
    setSelectedJobrole(firstJobrole);

    const functions = Array.from(
      new Set(
        data
          .filter((d) => d.track === val && d.jobrole === firstJobrole)
          .map((d) => d.critical_work_function || "")
      )
    )
      .filter(Boolean)
      .sort();
    const firstFunc = functions[0] || "";
    setSelectedFunction(firstFunc);
  };

  const handleJobroleChange = (val: string) => {
    setSelectedJobrole(val);
    const functions = Array.from(
      new Set(
        data
          .filter((d) => d.track === selectedDept && d.jobrole === val)
          .map((d) => d.critical_work_function || "")
      )
    )
      .filter(Boolean)
      .sort();
    const firstFunc = functions[0] || "";
    setSelectedFunction(firstFunc);
  };

  return (
    <>
      <div className="min-h-screen p-4">
        {/* Top bar: Funnel + Popover */}
        <div className="flex justify-end mb-6">
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-3">
                <Funnel className="w-5 h-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-4 space-y-4" align="end">
              {/* Department */}
              <Select value={selectedDept} onValueChange={handleDepartmentChange}>
                <SelectTrigger className="w-full">
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
              <Select value={selectedJobrole} onValueChange={handleJobroleChange}>
                <SelectTrigger className="w-full">
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

              {/* Work Function */}
              <Select
                value={selectedFunction}
                onValueChange={setSelectedFunction}
              >
                <SelectTrigger className="w-full">
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
              
            </PopoverContent>
          </Popover>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="relative group overflow-hidden rounded-3xl shadow-lg border-2 border-blue-200 hover:border-blue-300 transition-all duration-300"
            >
              <div className="relative z-10 p-8">
                <h3
                  className="text-lg font-bold text-gray-900 mb-2 leading-tight truncate cursor-pointer"
                  title={item.critical_work_function}
                  onClick={() => {
                    setViewData(item);
                    setView(true);
                    setIsViewModalOpen(true);
                  }}
                >
                  {item.critical_work_function}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {item.task}
                </p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() =>
                      item.id && setIsEditModalOpen(true)
                    }
                  >
                    <FaEdit className="text-gray-500" />
                  </button>
                  <button
                    onClick={() =>
                      item.id && alert("Delete logic goes here")
                    }
                  >
                    <FaTrash className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CriticalWorkFunctionGrid;
