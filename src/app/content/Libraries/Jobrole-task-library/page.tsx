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
// added by uma on 10-09-2025 for edit and delete
import TaskData from "@/components/jobroleComponent/tabComponent/taskData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FaEdit, FaTrash } from "react-icons/fa";

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
  const [editData, setEditData] = useState<any>({});
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedJobrole, setSelectedJobrole] = useState<string>("");
  const [selectedFunction, setSelectedFunction] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isView,setView] = useState(false);
  const [viewData, setViewData] = useState<any>({});
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });
  // added by uma on 10-09-2025 for edit and delete
  const [selectedJobRole, setSelectedJobRole] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState({
    view: false,
    add: false,
    edit: false,
  });
  // added by uma on 10-09-2025 for edit and delete end

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
    fetchData();
  }, [sessionData]);

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
        const depts = Array.from(new Set(json.map((d) => d.sector || "")))
          .filter(Boolean)
          .sort();
        const defaultDept = depts[0] || "";

        const jobroles = Array.from(
          new Set(
            json
              .filter((d) => d.sector === defaultDept)
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
                (d) => d.sector === defaultDept && d.jobrole === defaultJobrole
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

  // ✅ Unique filters (sorted alphabetically)
  const uniqueDepartments = Array.from(new Set(data.map((d) => d.sector || "")))
    .filter(Boolean)
    .sort();

  const uniqueJobroles = Array.from(
    new Set(
      data.filter((d) => d.sector === selectedDept).map((d) => d.jobrole || "")
    )
  )
    .filter(Boolean)
    .sort();

  const uniqueFunctions = Array.from(
    new Set(
      data
        .filter(
          (d) => d.sector === selectedDept && d.jobrole === selectedJobrole
        )
        .map((d) => d.critical_work_function || "")
    )
  )
    .filter(Boolean)
    .sort();

  // ✅ Filtered grid data
  const filteredData = data.filter(
    (item) =>
      item.sector === selectedDept &&
      item.jobrole === selectedJobrole &&
      item.critical_work_function === selectedFunction
  );

  const handleDepartmentChange = (val: string) => {
    setSelectedDept(val);
    const jobroles = Array.from(
      new Set(data.filter((d) => d.sector === val).map((d) => d.jobrole || ""))
    )
      .filter(Boolean)
      .sort();
    const firstJobrole = jobroles[0] || "";
    setSelectedJobrole(firstJobrole);

    const functions = Array.from(
      new Set(
        data
          .filter((d) => d.sector === val && d.jobrole === firstJobrole)
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
          .filter((d) => d.sector === selectedDept && d.jobrole === val)
          .map((d) => d.critical_work_function || "")
      )
    )
      .filter(Boolean)
      .sort();
    const firstFunc = functions[0] || "";
    setSelectedFunction(firstFunc);
  };
  // added by uma on 10-09-2025 for edit and delete
  const handleCloseModel = () => {
    setDialogOpen({ ...dialogOpen, edit: false });
    fetchData();
  };
  const handleEditClick = (id: number, jobrole: string) => {
    setSelectedJobRole(id);
    fetchEditData(id, jobrole);
    setDialogOpen({ ...dialogOpen, edit: true });
  };

  async function fetchEditData(id: number, jobrole: string) {
    const jobroleResponse = await fetch(
      `${sessionData.url}/table_data?table=s_user_jobrole&filters[jobrole]=${jobrole}&filters[sub_institute_id]=${sessionData.subInstituteId}`
    );
    const jobroleData = await jobroleResponse.json();
    console.log("jobroleData", jobroleData[0].id);
    if (jobroleData[0].id) {
      const res = await fetch(
        `${sessionData.url}/jobrole_library/${jobroleData[0].id}/edit?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&formType=user`
      );
      const data = await res.json();
      setEditData(data.editData || {});
      setIsEditModalOpen(true);
    }
  }

  const handleDeleteClick = async (id: number) => {
    if (!id) return;

    if (window.confirm("Are you sure you want to delete this job role task?")) {
      try {
        const res = await fetch(
          `${sessionData.url}/jobrole_library/${id}?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&user_id=${sessionData.userId}&formType=tasks`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${sessionData.token}`,
            },
          }
        );

        const data = await res.json();
        alert(data.message);
        fetchData();
      } catch (error) {
        console.error("Error deleting job role:", error);
        alert("Error deleting job role");
      }
    }
  };

  return (
    <>
      <div className="min-h-screen p-4">
        {/* Top bar: Filters + Funnel */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center gap-4">
            {/* Filters with animation */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="flex flex-col md:flex-row gap-4"
                >
                  {/* Department */}
                  <Select
                    value={selectedDept}
                    onValueChange={handleDepartmentChange}
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
                    onValueChange={handleJobroleChange}
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
                    onValueChange={setSelectedFunction}
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
                  onClick={() => {setViewData(item); setView(true); setIsViewModalOpen(true);}}
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
                <div className="divFooter text-center">
                  <div className="flex justify-end space-x-2">
                    {/* <button
                      onClick={() =>
                        item.id && handleEditClick(item.id, item.jobrole)
                      }
                      className="text-gray text-xs py-1 px-2 rounded"
                    >
                      <span
                        className="mdi mdi-pencil"
                        data-titleHead="Edit Jobrole"
                      ></span>
                    </button>
                    <button
                      onClick={() => item.id && handleDeleteClick(item.id)}
                      className="bg-red-500 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
                    >
                      <span
                        className="mdi mdi-trash-can"
                        data-titleHead="Delete Jobrole"
                      ></span>
                    </button> */}
                    <button
                      onClick={() =>
                        item.id && handleEditClick(item.id, item.jobrole)
                      }
                    >
                      <FaEdit className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => item.id && handleDeleteClick(item.id)}
                    >
                      <FaTrash className="text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {dialogOpen.edit && selectedJobRole && (
        <Dialog
          open={isEditModalOpen}
          onOpenChange={(open) => {
            setIsEditModalOpen(open);
            if (!open) {
              fetchData();
            }
          }}
        >
          <DialogContent className="max-w-5xl max-h-[95vh] bg-[#f1fbff] overflow-y-auto hide-scroll">
            <DialogHeader>
              <DialogTitle>Edit Task Assignment</DialogTitle>
            </DialogHeader>
            <TaskData
              editData={editData}
              selectedDept={selectedDept}
              selectedJobrole={selectedJobrole}
              selectedFunction={selectedFunction}
            />
          </DialogContent>
        </Dialog>
      )}
      {isView && viewData && (
        <Dialog
          open={isViewModalOpen}
          onOpenChange={(open) => {
            setIsViewModalOpen(open);
          }}
        >
          <DialogContent className="max-w-4xl max-h-[95vh] bg-[#f1fbff] overflow-y-auto hide-scroll">
            <DialogHeader>
              <DialogTitle className="border-b-2 pb-2">{viewData?.task}</DialogTitle>
            </DialogHeader>
            <ul>
              <li className="my-2 py-1 border-1 rounded-full"><span className="bg-[#6fc7ff] p-2 rounded-full">Critical Work Function</span> <span className="p-1">{viewData?.critical_work_function}</span></li>
              <li className="my-2 py-1 border-1 rounded-full"><span className="bg-[#fcf38d] p-2 rounded-full">Department</span> <span className="p-1">{viewData?.sector}</span></li>
              <li className="my-2 py-1 border-1 rounded-full"><span className="bg-[#fcb0b0] p-2 rounded-full">Sub Department</span>   <span className="p-1">{viewData?.track}</span></li>
              <li className="my-2 py-1 border-1 rounded-full"><span className="bg-[#8dd39c] p-2 rounded-full">Jobrole</span>  <span className="p-1">{viewData?.jobrole}</span></li>
            </ul>
          </DialogContent>
        </Dialog>
      )}
      );
    </>
  );
};

export default CriticalWorkFunctionGrid;
