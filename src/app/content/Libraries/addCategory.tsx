import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Loading from "@/components/utils/loading";

const AddCategory = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [editingSubCategory, setEditingSubCategory] = useState<any>(null);
    const [newCategory, setNewCategory] = useState({ name: '' });
    const [newSubCategory, setNewSubCategory] = useState({ name: '' });
    const [editSubCategoryName, setEditSubCategoryName] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [sessionData, setSessionData] = useState({
        url: "",
        token: "",
        orgType: "",
        subInstituteId: "",
        userId: "",
        userProfile: "",
        syear: "",
    });

    useEffect(() => {
        const userData = localStorage.getItem("userData");
        if (userData) {
            const { APP_URL, token, org_type, sub_institute_id, user_id, user_profile_name, syear } = JSON.parse(userData);
            setSessionData({
                url: APP_URL,
                token,
                orgType: org_type,
                subInstituteId: sub_institute_id,
                userId: user_id,
                userProfile: user_profile_name,
                syear: syear,
            });
        }
    }, []);

    useEffect(() => {
        if (sessionData.url && sessionData.token) {
            fetchInitialData();
        }
    }, [sessionData.url, sessionData.token]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${sessionData.url}/search_data?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&org_type=${sessionData.orgType}&searchType=skillTaxonomy&searchWord=skillTaxonomy`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setLoading(false);
            setCategories(data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleCRUDCategory = async () => {
        // Validate inputs
        if (!newCategory.name) {
            alert('Please enter a category name');
            return;
        }

        if (editingCategory && newSubCategory.name && !newSubCategory.name.trim()) {
            alert('Please enter a valid subcategory name');
            return;
        }

        try {
            const formData = new FormData();

            if (editingCategory) {
                // Case 1: Editing category (updating category name)
                formData.append('old_category_name', editingCategory.category_name);
                formData.append('new_category_name', newCategory.name);
                formData.append('sub_institute_id', sessionData.subInstituteId);
                formData.append('user_id', sessionData.userId);
                formData.append('org_type', sessionData.orgType);

                // Case 2: Adding subcategory to existing category
                if (newSubCategory.name) {
                    formData.append('subcategory_name', newSubCategory.name);
                    formData.append('formType', 'sub_category');
                } else {
                    formData.append('formType', 'category');
                }

                const endpoint = `${sessionData.url}/skill_library/add_category`;

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${sessionData.token}`,
                    },
                    body: formData
                });

                const result = await response.json();
                // console.log('result',result);
                alert(result.message);
                fetchInitialData();

            } else {
                // Case 3: Adding new category
                formData.append('category_name', newCategory.name);
                formData.append('old_category_name', editingCategory.category_name);
                formData.append('sub_institute_id', sessionData.subInstituteId);
                formData.append('org_type', sessionData.orgType);
                formData.append('formType', 'category');

                const response = await fetch(`${sessionData.url}/skill_library/add_category`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${sessionData.token}`,
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Failed to add category');
                }

                const result = await response.json();
                // console.log('result',result);
                alert(result.message);
                fetchInitialData();
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const handleEditCategory = (category: any) => {
        setEditingCategory(category);
        setNewCategory({ name: category.category_name });
        setNewSubCategory({ name: '' });
        setShowAddForm(true);
    };

    const handleEditSubCategory = (categoryName: string, subCategory: any) => {
        setEditingSubCategory({
            categoryName,
            ...subCategory
        });
        setEditSubCategoryName(subCategory.subCategory_name);
    };

    const handleUpdateSubCategory = async () => {
        if (!editingSubCategory || !editSubCategoryName) return;

        try {
            const formData = new FormData();
            formData.append('category_name', editingSubCategory.categoryName);
            formData.append('old_subcategory_name', editingSubCategory.subCategory_name);
            formData.append('new_subcategory_name', editSubCategoryName);
            formData.append('sub_institute_id', sessionData.subInstituteId);
            formData.append('org_type', sessionData.orgType);
            formData.append('user_id', sessionData.userId);
            formData.append('formType','update_subCategory');

            const response = await fetch(`${sessionData.url}/skill_library/add_category`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionData.token}`,
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to update subcategory');
            }

            const result = await response.json();
            alert(result.message);
            fetchInitialData();
            setEditingSubCategory(null);
        } catch (err) {
            console.error('Error updating subcategory:', err);
        }
    };

    const handleCancelSubCategoryEdit = () => {
        setEditingSubCategory(null);
        setEditSubCategoryName('');
    };

    return (
        <>
            {isLoading ? <Loading /> : (
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-foreground">Skill Taxonomy</h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setShowAddForm(true);
                                setEditingCategory(null);
                                setNewCategory({ name: '' });
                            }}
                        >
                            <span className="mdi mdi-plus"></span>
                            Add Category
                        </Button>
                    </div>

                    {(showAddForm || editingCategory) && (
                        <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
                            <h4 className="text-sm font-medium text-foreground mb-3">
                                {editingCategory ? 'Edit Category' : 'Add New Category'}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                    <Input
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        placeholder="Category Name"
                                    />
                                    {editingCategory && (
                                        <input type="hidden" name="old_category_name" value={editingCategory.category_name} />
                                    )}
                                    <input type="hidden" name="sub_institute_id" value={sessionData.subInstituteId} />
                                    <input type="hidden" name="org_type" value={sessionData.orgType} />
                                </div>
                                {editingCategory && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={newSubCategory.name}
                                                onChange={(e) => setNewSubCategory({ name: e.target.value })}
                                                placeholder="New Subcategory"
                                                className="flex-1"
                                            />
                                            <input type="hidden" name="formType" value={newSubCategory.name ? 'sub_category' : 'category'} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end space-x-3 mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setEditingCategory(null);
                                        setNewCategory({ name: '' });
                                        setNewSubCategory({ name: '' });
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleCRUDCategory}
                                >
                                    {editingCategory ? (newSubCategory.name ? 'Add Subcategory' : 'Update Category') : 'Add Category'}
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {categories.map((category, index) => (
                            <div key={index} className="border border-border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div><span className="mdi mdi-playlist-plus text-2xl text-[#1072c7]"></span></div>
                                        <div>
                                            <h4 className="font-medium text-foreground">{category.category_name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {category.total} Skills
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span
                                            className="mdi mdi-pencil cursor-pointer"
                                            onClick={() => handleEditCategory(category)}
                                        ></span>
                                    </div>
                                </div>

                                {category.subcategory?.length > 0 && (
                                    <div className="pl-6 border-l-2 border-border space-y-2">
                                        <h5 className="text-sm font-medium text-muted-foreground">
                                            <span className="mdi mdi-format-list-bulleted"></span> Sub-categories
                                        </h5>
                                        <div className="space-y-2 mt-2">
                                            {category.subcategory.map((sub: any, subIndex: number) => (
                                                <div key={subIndex} className="flex items-center justify-between p-2 bg-muted rounded">
                                                    {editingSubCategory?.subCategory_name === sub.subCategory_name ? (
                                                        <div className="flex items-center gap-2 w-full">
                                                            <Input
                                                                value={editSubCategoryName}
                                                                onChange={(e) => setEditSubCategoryName(e.target.value)}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateSubCategory()}
                                                                className="flex-1"
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={handleCancelSubCategoryEdit}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={handleUpdateSubCategory}
                                                                >
                                                                    Save
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div
                                                                className="flex items-center space-x-2 cursor-pointer"
                                                                onDoubleClick={() => handleEditSubCategory(category.category_name, sub)}
                                                            >
                                                                <span className="text-sm text-foreground">{sub.subCategory_name}</span>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {sub.total} Skills
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default AddCategory;