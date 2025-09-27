"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Department = {
  id: number;
  name: string; // Jobrole task category name
};

export default function JobroleTaskTaxonomy() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Add form state
  const [showForm, setShowForm] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDeptName, setEditDeptName] = useState("");
  const [saving, setSaving] = useState(false);

  // Session data
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: "",
  });

  // Load session data from localStorage
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

  // Fetch job role tasks from API
  const fetchDepartments = async () => {
    if (!sessionData.url || !sessionData.token) return;

    try {
      const res = await fetch(
        `${sessionData.url}/api/job-role-tasks?type=API&sub_institute_id=${sessionData.subInstituteId}&token=${sessionData.token}`
      );

      if (!res.ok) throw new Error("Failed to fetch job role tasks");

      const data = await res.json();
      const mapped: Department[] = data.data.map((item: any) => ({
        id: item.id,
        name: item.task_category,
      }));

      setDepartments(mapped);
    } catch (err) {
      console.error("Error fetching job role tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionData.url) {
      fetchDepartments();
    }
  }, [sessionData.url, sessionData.subInstituteId]);

  // Add new jobrole task to API
  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) return;
    setAdding(true);

    try {
      await fetch(
        `${sessionData.url}/api/job-role-tasks?type=API&sub_institute_id=${sessionData.subInstituteId}&token=${sessionData.token}&task_category=${encodeURIComponent(
          newDeptName.trim()
        )}&user_id=${sessionData.userId}`,
        {
          method: "POST",
        }
      );

      await fetchDepartments();
      setNewDeptName("");
      setShowForm(false);
    } catch (err) {
      console.error("Error adding job role task:", err);
    } finally {
      setAdding(false);
    }
  };

  // Edit jobrole task in API
  const handleEditDepartment = async (dept: Department) => {
    if (!editDeptName.trim()) return;
    setSaving(true);

    try {
      const res = await fetch(
        `${sessionData.url}/api/job-role-tasks/${encodeURIComponent(
          dept.name
        )}?type=API&sub_institute_id=${sessionData.subInstituteId}&user_id=${sessionData.userId}&task_category=${encodeURIComponent(
          editDeptName.trim()
        )}&_method=PUT&token=${sessionData.token}`,
        {
          method: "POST", // Laravel style PUT via POST
        }
      );

      const data = await res.json();
      console.log("Update response:", data);

      if (!res.ok || data.status === "2" || data.message?.includes("Failed")) {
        alert(`Failed to update: ${data.message || "Unknown error"}`);
      } else {
        await fetchDepartments();
        setEditingId(null);
        setEditDeptName("");
      }
    } catch (err) {
      console.error("Error editing job role task:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Jobrole Task Taxonomy</h2>
        <Button variant="outline" onClick={() => setShowForm(true)}>
          Add Jobrole Task Category
        </Button>
      </div>

      {/* Add Department Form */}
      {showForm && (
        <div className="bg-gray-100 p-4 rounded mb-6">
          <h3 className="font-medium mb-2">Add New Jobrole Task Category</h3>
          <Input
            type="text"
            placeholder="Jobrole Task Category Name"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            className="mb-3"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDepartment} disabled={adding}>
              {adding ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
      )}

      {/* Department List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          departments.map((dept) => (
            <div
              key={dept.id}
              className="border rounded-xl p-4 shadow-sm bg-white"
            >
              {editingId === dept.id ? (
                <div className="flex flex-col gap-3">
                  <Input
                    type="text"
                    value={editDeptName}
                    onChange={(e) => setEditDeptName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        setEditDeptName("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleEditDepartment(dept)}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">{dept.name}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-black"
                      onClick={() => {
                        setEditingId(dept.id);
                        setEditDeptName(dept.name);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
