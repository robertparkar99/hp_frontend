"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loading from "@/components/utils/loading";

const AddCategory = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);

  // Edit states
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<any>(null);

  // Form inputs
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubCategoryName, setNewSubCategoryName] = useState("");
  const [oldSubCategoryName, setOldSubCategoryName] = useState("");

  // UI control
  const [showAddForm, setShowAddForm] = useState(false);

  // Session
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    orgType: "",
    subInstituteId: "",
    userId: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const {
        APP_URL,
        token,
        org_type,
        sub_institute_id,
        user_id,
      } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        orgType: org_type,
        subInstituteId: sub_institute_id,
        userId: user_id,
      });
    }
  }, []);

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchCategories();
    }
  }, [sessionData.url, sessionData.token]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=skillTaxonomy&searchWord=skillTaxonomy`
      );
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrEditCategory = async (isEdit: boolean) => {
    if (!newCategoryName.trim()) {
      alert("Please enter category name");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("type", "API");
      formData.append("sub_institute_id", sessionData.subInstituteId);
      formData.append("token", sessionData.token);
      formData.append("user_id", sessionData.userId);

      if (isEdit && editingCategory) {
        formData.append("formType", "edit category");
        formData.append("category", newCategoryName);
        formData.append("old_category", editingCategory.category_name);
        if (newSubCategoryName.trim()) {
          formData.append("sub_category", newSubCategoryName);
        }
      } else {
        formData.append("formType", "add category");
        formData.append("category", newCategoryName);
      }

      const res = await fetch(
        `${sessionData.url}/skill_library/add_category`,
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await res.json();
      alert(result.message);

      if (!isEdit) {
        setCategories((prev) => [
          {
            category_name: newCategoryName,
            total: 0,
            subcategory: [],
          },
          ...prev,
        ]);
        setShowAddForm(false);
      } else {
        fetchCategories();
        setEditingCategory(null);
      }

      setNewCategoryName("");
      setNewSubCategoryName("");
    } catch (err) {
      console.error("Error adding/editing category:", err);
    }
  };

  const handleEditSubCategory = async () => {
    if (!newSubCategoryName.trim()) {
      alert("Please enter subcategory name");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("type", "API");
      formData.append("sub_institute_id", sessionData.subInstituteId);
      formData.append("token", sessionData.token);
      formData.append("user_id", sessionData.userId);
      formData.append("formType", "edit sub_category");
      formData.append("category", editingSubCategory.category_name);
      formData.append("old_sub_category", oldSubCategoryName);
      formData.append("sub_category", newSubCategoryName);

      const res = await fetch(
        `${sessionData.url}/skill_library/add_category`,
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await res.json();
      alert(result.message);
      fetchCategories();
      setEditingSubCategory(null);
      setNewSubCategoryName("");
      setOldSubCategoryName("");
    } catch (err) {
      console.error("Error editing subcategory:", err);
    }
  };

  const startEditCategory = (category: any) => {
    setEditingCategory(category);
    setNewCategoryName(category.category_name);
    setNewSubCategoryName("");
  };

  const startEditSubCategory = (category: any, subcategory: any) => {
    setEditingSubCategory(category);
    setOldSubCategoryName(subcategory.subCategory_name);
    setNewSubCategoryName(subcategory.subCategory_name);
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Skill Taxonomy</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingCategory(null);
                setEditingSubCategory(null);
                setNewCategoryName("");
                setNewSubCategoryName("");
                setShowAddForm(true);
              }}
            >
              <span className="mdi mdi-plus"></span> Add Category
            </Button>
          </div>

          {/* Add Category Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-muted rounded-lg border">
              <h4 className="text-sm font-medium mb-3">Add Category</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Category Name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={() => handleAddOrEditCategory(false)}>
                  Add Category
                </Button>
              </div>
            </div>
          )}

          {/* Category List */}
          <div className="space-y-4">
            {categories.map((cat, i) => (
              <React.Fragment key={i}>
                {/* Edit Category Form Inline */}
                {editingCategory?.category_name === cat.category_name && (
                  <div className="mb-6 p-4 bg-muted rounded-lg border">
                    <h4 className="text-sm font-medium mb-3">Edit Category</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Category Name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                      <Input
                        placeholder="New Subcategory (optional)"
                        value={newSubCategoryName}
                        onChange={(e) =>
                          setNewSubCategoryName(e.target.value)
                        }
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCategory(null)}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleAddOrEditCategory(true)}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}

                {/* Category Card */}
                <div className="border p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{cat.category_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {cat.total} Skills
                      </p>
                    </div>
                    <span
                      className="mdi mdi-pencil cursor-pointer"
                      onClick={() => startEditCategory(cat)}
                    ></span>
                  </div>

                  {cat.subcategory?.length > 0 && (
                    <div className="pl-4 border-l space-y-1 subcategory-scrollable">
                      {cat.subcategory.map((sub: any, si: number) => (
                        <div key={si}>
                          {editingSubCategory?.category_name === cat.category_name &&
                          oldSubCategoryName === sub.subCategory_name ? (
                            <div className="flex gap-2 p-2 bg-muted rounded">
                              <Input
                                placeholder="Edit Subcategory"
                                value={newSubCategoryName}
                                onChange={(e) =>
                                  setNewSubCategoryName(e.target.value)
                                }
                              />
                              <Button size="sm" onClick={handleEditSubCategory}>
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingSubCategory(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div
                              className="flex justify-between bg-muted p-2 rounded cursor-pointer"
                              onDoubleClick={() => startEditSubCategory(cat, sub)}
                              title="Double-click to edit"
                            >
                              <span>{sub.subCategory_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {sub.total} Skills
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .subcategory-scrollable {
          max-height: 12rem;
          overflow-y: auto;
        }
        .subcategory-scrollable::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default AddCategory;
