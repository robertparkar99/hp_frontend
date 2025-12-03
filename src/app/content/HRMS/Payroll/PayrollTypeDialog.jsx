// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";

// const PayrollTypeDialog = ({
//   open,
//   onOpenChange,
//   onSave,
//   editingPayroll,
//   sessionInfo,
// }) => {
//   const [formData, setFormData] = useState({
//     type: "",
//     amountType: "",
//     payrollName: "",
//     payroll_percentage: "",
//     status: "Active",
//     sortOrder: "",
//     day_count: false,
//   });
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   // Pre-fill when editing
//   useEffect(() => {
//     if (editingPayroll && open) {
//       console.log("Editing payroll data:", editingPayroll); // Debug log
      
//       // Determine day_count value - handle various possible formats
//       let dayCountValue = false;
//       if (editingPayroll.day_count === "1" || editingPayroll.day_count === 1 || 
//           editingPayroll.day_count === true || editingPayroll.day_count === "yes") {
//         dayCountValue = true;
//       }
      
//       // Determine sortOrder value
//       let sortOrderValue = "";
//       if (editingPayroll.sort_order !== undefined && editingPayroll.sort_order !== null) {
//         sortOrderValue = editingPayroll.sort_order.toString();
//       } else if (editingPayroll.sortOrder !== undefined && editingPayroll.sortOrder !== null) {
//         sortOrderValue = editingPayroll.sortOrder.toString();
//       }
      
//       setFormData({
//         type: editingPayroll.payroll_type === "1" || editingPayroll.type === "Earning" ? "Earning" : "Deduction",
//         amountType: editingPayroll.amount_type === "1" || editingPayroll.amountType === "Fixed" ? "Fixed" : "Percentage",
//         payrollName: editingPayroll.payroll_name || editingPayroll.name || "",
//         payroll_percentage: editingPayroll.payroll_percentage?.toString() || "",
//         status: editingPayroll.status || "Active",
//         sortOrder: sortOrderValue,
//         day_count: dayCountValue,
//       });
//     } else if (open) {
//       // Reset form when opening for new entry
//       setFormData({
//         type: "",
//         amountType: "",
//         payrollName: "",
//         payroll_percentage: "",
//         status: "Active",
//         sortOrder: "",
//         day_count: false,
//       });
//     }
//     setErrors({});
//   }, [editingPayroll, open]);

//   const handleChange = (field, value) => {
//     setFormData(prev => ({ ...prev, [field]: value }));

//     // Clear error when field is updated
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: "" }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.type) newErrors.type = "Type is required";
//     if (!formData.payrollName) newErrors.payrollName = "Name is required";
//     if (!formData.amountType) newErrors.amountType = "Amount type is required";

//     if (!formData.payroll_percentage) {
//       newErrors.payroll_percentage = formData.amountType === "Fixed"
//         ? "Amount is required"
//         : "Percentage is required";
//     } else if (formData.amountType === "Percentage") {
//       const percentage = parseFloat(formData.payroll_percentage);
//       if (isNaN(percentage) || percentage < 0 || percentage > 100) {
//         newErrors.payroll_percentage = "Percentage must be between 0 and 100";
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const buildFormData = () => {
//     const data = new FormData();

//     // Static fields
//     data.append("type", "API");
//     data.append("status", formData.status === "Active" ? "1" : "0");

//     // From session
//     data.append("sub_institute_id", String(sessionInfo.sub_institute_id));
//     data.append("token", sessionInfo.token);
//     data.append("user_id", String(sessionInfo.user_id));

//     // Editable fields
//     data.append("payroll_type", formData.type === "Earning" ? "1" : "2");
//     data.append("payroll_name", formData.payrollName);
//     data.append("amount_type", formData.amountType === "Fixed" ? "1" : "2");
//     data.append("day_count", formData.day_count ? "1" : "0");

//     if (formData.sortOrder) {
//       data.append("sort_order", formData.sortOrder);
//     }

//     data.append("payroll_percentage", formData.payroll_percentage);

//     // Add ID if editing
//     if (editingPayroll && editingPayroll.id) {
//       data.append("id", editingPayroll.id.toString());
//     }

//     return data;
//   };

//   const handleSave = async () => {
//     if (!validateForm()) return;

//     try {
//       setLoading(true);

//       const formDataToSend = buildFormData();
//       const url = `${sessionInfo.APP_URL}/payroll-type/store`;

//       const res = await fetch(url, {
//         method: "POST",
//         body: formDataToSend,
//       });

//       if (!res.ok) {
//         const errorText = await res.text();
//         throw new Error(`Failed to save payroll type: ${errorText}`);
//       }

//       const result = await res.json();
      
//       if (result.success) {
//         onOpenChange(false);
        
//         // Show success message after dialog is closed
//         if (editingPayroll && editingPayroll.id) {
//           alert("Payroll Type updated successfully ✅");
//         } else {
//           alert("Payroll Type added successfully 🎉");
//         }

//         onSave(); // Trigger refresh in parent component
//       } else {
//         throw new Error(result.message || "Unknown error occurred");
//       }
//     } catch (err) {
//       console.error("Error saving payroll type:", err);
//       alert("" + (err.message || "Something went wrong"));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl w-full">
//         <DialogHeader>
//           <DialogTitle>
//             {editingPayroll ? "Edit Payroll Type" : "Add Payroll Type"}
//           </DialogTitle>
//         </DialogHeader>

//         <div className="flex flex-col space-y-4 max-h-[80vh] overflow-y-auto scrollbar-hide">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Payroll Type */}
//             <div className="space-y-2">
//               <Label htmlFor="type">Type *</Label>
//               <Select
//                 value={formData.type}
//                 onValueChange={(value) => handleChange("type", value)}
//               >
//                 <SelectTrigger id="type" className={errors.type ? "border-red-500" : ""}>
//                   <SelectValue placeholder="Select Type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Earning">Earning</SelectItem>
//                   <SelectItem value="Deduction">Deduction</SelectItem>
//                 </SelectContent>
//               </Select>
//               {errors.type && <p className="text-red-500 text-xs">{errors.type}</p>}
//             </div>

//             {/* Payroll Name */}
//             <div className="space-y-2">
//               <Label htmlFor="payrollName">Name *</Label>
//               <Input
//                 id="payrollName"
//                 type="text"
//                 value={formData.payrollName}
//                 onChange={(e) => handleChange("payrollName", e.target.value)}
//                 placeholder="Enter payroll name"
//                 className={errors.payrollName ? "border-red-500" : ""}
//               />
//               {errors.payrollName && <p className="text-red-500 text-xs">{errors.payrollName}</p>}
//             </div>

//             {/* Amount Type */}
//             <div className="space-y-2">
//               <Label htmlFor="amountType">Amount Type *</Label>
//               <Select
//                 value={formData.amountType}
//                 onValueChange={(value) => handleChange("amountType", value)}
//               >
//                 <SelectTrigger id="amountType" className={errors.amountType ? "border-red-500" : ""}>
//                   <SelectValue placeholder="Amount Type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Fixed">Flat</SelectItem>
//                   <SelectItem value="Percentage">Percentage</SelectItem>
//                 </SelectContent>
//               </Select>
//               {errors.amountType && <p className="text-red-500 text-xs">{errors.amountType}</p>}
//             </div>

//             {/* Amount / Percentage */}
//             <div className="space-y-2">
//               <Label htmlFor="payroll_percentage">
//                 {formData.amountType === "Fixed" ? "Amount *" :
//                   formData.amountType === "Percentage" ? "Percentage (%) *" :
//                     "Amount/Percentage *"}
//               </Label>
//               <Input
//                 id="payroll_percentage"
//                 type="number"
//                 value={formData.payroll_percentage}
//                 onChange={(e) => handleChange("payroll_percentage", e.target.value)}
//                 placeholder={
//                   formData.amountType === "Fixed" ? "Enter fixed amount" :
//                     formData.amountType === "Percentage" ? "Enter percentage" :
//                       "Select amount type first"
//                 }
//                 disabled={!formData.amountType}
//                 className={errors.payroll_percentage ? "border-red-500" : ""}
//               />
//               {errors.payroll_percentage && <p className="text-red-500 text-xs">{errors.payroll_percentage}</p>}
//             </div>

//             {/* Status */}
//             <div className="space-y-2">
//               <Label htmlFor="status">Status *</Label>
//               <Select
//                 value={formData.status}
//                 onValueChange={(value) => handleChange("status", value)}
//               >
//                 <SelectTrigger id="status">
//                   <SelectValue placeholder="Select Status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Active">Active</SelectItem>
//                   <SelectItem value="Inactive">Inactive</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Sort Order */}
//             <div className="space-y-2">
//               <Label htmlFor="sortOrder">Sort Order</Label>
//               <Input
//                 id="sortOrder"
//                 type="number"
//                 value={formData.sortOrder}
//                 onChange={(e) => handleChange("sortOrder", e.target.value)}
//                 placeholder="Enter sort order"
//                 min="0"
//               />
//             </div>

//             {/* Day Wise Count */}
//             <div className="flex items-center space-x-2 pt-6">
//               <Checkbox
//                 id="day_count"
//                 checked={formData.day_count}
//                 onCheckedChange={(checked) => handleChange("day_count", checked)}
//               />
//               <Label htmlFor="day_count" className="cursor-pointer">Day Wise Count</Label>
//             </div>
//           </div>

//           <div className="flex justify-end space-x-3 pt-4">
//             <Button
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//               disabled={loading}
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleSave}
//               disabled={loading}
//               className="px-4 py-2"
//             >
//               {loading
//                 ? "Saving..."
//                 : editingPayroll
//                   ? "Update Payroll Type"
//                   : "Add Payroll Type"}
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default PayrollTypeDialog;


"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const PayrollTypeDialog = ({
  open,
  onOpenChange,
  onSave,
  editingPayroll,
  sessionInfo,
}) => {
  const [formData, setFormData] = useState({
    type: "",
    amountType: "",
    payrollName: "",
    payroll_percentage: "",
    status: "Active",
    sort_order: "",
    day_count: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Pre-fill when editing
  useEffect(() => {
    if (editingPayroll && open) {
      console.log("Editing payroll data:", editingPayroll); // Debug log
      
      // Determine day_count value - handle various possible formats
      let dayCountValue = false;
      if (editingPayroll.day_count === "1" || editingPayroll.day_count === 1 || 
          editingPayroll.day_count === true || editingPayroll.day_count === "yes") {
        dayCountValue = true;
      }
      
      // Determine sortOrder value - check all possible field names
      let sort_order = "";
      
      // Check all possible field names for sort order
      if (editingPayroll.sort_order !== undefined && editingPayroll.sort_order !== null && editingPayroll.sort_order !== "") {
        sort_order = editingPayroll.sort_order.toString();
        console.log("Using sort_order field:", sort_order);
      } 
      else if (editingPayroll.sort_order !== undefined && editingPayroll.sort_order !== null && editingPayroll.sort_order !== "") {
        sort_order = editingPayroll.sort_order.toString();
        console.log("Using sort_order field:", sort_order);
      }
      else if (editingPayroll.sort !== undefined && editingPayroll.sort !== null && editingPayroll.sort !== "") {
        sort_order = editingPayroll.sort.toString();
        console.log("Using sort field:", sort_order);
      }
      else if (editingPayroll.order !== undefined && editingPayroll.order !== null && editingPayroll.order !== "") {
        sort_order = editingPayroll.order.toString();
        console.log("Using order field:", sort_order);
      }
      
      console.log("Final sort_order value:", sort_order);

      setFormData({
        type: editingPayroll.payroll_type === "1" || editingPayroll.type === "Earning" ? "Earning" : "Deduction",
        amountType: editingPayroll.amount_type === "1" || editingPayroll.amountType === "Fixed" ? "Fixed" : "Percentage",
        payrollName: editingPayroll.payroll_name || editingPayroll.name || "",
        payroll_percentage: editingPayroll.payroll_percentage?.toString() || editingPayroll.amount?.toString() || "",
        status: editingPayroll.status || "Active",
        sort_order: sort_order,
        day_count: dayCountValue,
      });

      // Log the final form data for debugging
      console.log("Form data after setting:", {
        type: editingPayroll.payroll_type === "1" || editingPayroll.type === "Earning" ? "Earning" : "Deduction",
        amountType: editingPayroll.amount_type === "1" || editingPayroll.amountType === "Fixed" ? "Fixed" : "Percentage",
        payrollName: editingPayroll.payroll_name || editingPayroll.name || "",
        payroll_percentage: editingPayroll.payroll_percentage?.toString() || editingPayroll.amount?.toString() || "",
        status: editingPayroll.status || "Active",
        sort_order: sort_order,
        day_count: dayCountValue,
      });
    } else if (open) {
      // Reset form when opening for new entry
      setFormData({
        type: "",
        amountType: "Fixed",
        payrollName: "",
        payroll_percentage: "",
        status: "Active",
        sort_order: "",
        day_count: false,
      });
    }
    setErrors({});
  }, [editingPayroll, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.type) newErrors.type = "Type is required";
    if (!formData.payrollName) newErrors.payrollName = "Name is required";
    if (!formData.amountType) newErrors.amountType = "Amount type is required";

    if (!formData.payroll_percentage) {
      newErrors.payroll_percentage = formData.amountType === "Fixed"
        ? "Amount is required"
        : "Percentage is required";
    } else if (formData.amountType === "Percentage") {
      const percentage = parseFloat(formData.payroll_percentage);
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        newErrors.payroll_percentage = "Percentage must be between 0 and 100";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildFormData = () => {
    const data = new FormData();

    // Static fields
    data.append("type", "API");
    data.append("status", formData.status === "Active" ? "1" : "0");

    // From session
    data.append("sub_institute_id", String(sessionInfo.sub_institute_id));
    data.append("token", sessionInfo.token);
    data.append("user_id", String(sessionInfo.user_id));

    // Editable fields
    data.append("payroll_type", formData.type === "Earning" ? "1" : "2");
    data.append("payroll_name", formData.payrollName);
    data.append("amount_type", formData.amountType === "Fixed" ? "1" : "2");
    data.append("day_count", formData.day_count ? "1" : "0");

    if (formData.sort_order) {
      data.append("sort_order", formData.sort_order);
    }

    data.append("payroll_percentage", formData.payroll_percentage);

    // Add ID if editing
    if (editingPayroll && editingPayroll.id) {
      data.append("id", editingPayroll.id.toString());
    }

    return data;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const formDataToSend = buildFormData();
      const url = `${sessionInfo.APP_URL}/payroll-type/store`;

      const res = await fetch(url, {
        method: "POST",
        body: formDataToSend,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to save payroll type: ${errorText}`);
      }

      const result = await res.json();
      onOpenChange(false);
      onSave();
      if (result.success) {
        onOpenChange(false);
        
        // Show success message after dialog is closed
        if (editingPayroll && editingPayroll.id) {
          alert("Payroll Type updated successfully ✅");
        } else {
          alert("Payroll Type added successfully 🎉");
        }

        onSave(); // Trigger refresh in parent component
      } else {
        throw new Error(result.message || "Unknown error occurred");
      }
    } catch (err) {
      console.error("Error saving payroll type:", err);
      alert("" + (err.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>
            {editingPayroll ? "Edit Payroll Type" : "Add Payroll Type"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 max-h-[80vh] overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payroll Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger id="type" className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Earning">Earning</SelectItem>
                  <SelectItem value="Deduction">Deduction</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-red-500 text-xs">{errors.type}</p>}
            </div>

            {/* Payroll Name */}
            <div className="space-y-2">
              <Label htmlFor="payrollName">Name *</Label>
              <Input
                id="payrollName"
                type="text"
                value={formData.payrollName}
                onChange={(e) => handleChange("payrollName", e.target.value)}
                placeholder="Enter payroll name"
                className={errors.payrollName ? "border-red-500" : ""}
              />
              {errors.payrollName && <p className="text-red-500 text-xs">{errors.payrollName}</p>}
            </div>

            {/* Amount Type */}
            {/* <div className="space-y-2">
              <Label htmlFor="amountType">Amount Type *</Label>
              <Select
                value={formData.amountType}
                onValueChange={(value) => handleChange("amountType", value)}
              >
                <SelectTrigger id="amountType" className={errors.amountType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Amount Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fixed">Flat</SelectItem>
                  <SelectItem value="Percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
              {errors.amountType && <p className="text-red-500 text-xs">{errors.amountType}</p>}
            </div> */}

            <div className="space-y-2">
  <Label htmlFor="amountType">Amount Type *</Label>
  <Select
    value={formData.amountType}
    onValueChange={(value) => handleChange("amountType", value)}
  >
    <SelectTrigger
      id="amountType"
      className={errors.amountType ? "border-red-500" : ""}
    >
      <SelectValue /> {/* ✅ no placeholder needed */}
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Fixed">Flat</SelectItem>
      <SelectItem value="Percentage">Percentage</SelectItem>
    </SelectContent>
  </Select>
  {errors.amountType && (
    <p className="text-red-500 text-xs">{errors.amountType}</p>
  )}
</div>


            {/* Amount / Percentage */}
            <div className="space-y-2">
              <Label htmlFor="payroll_percentage">
                {formData.amountType === "Fixed" ? "Amount *" :
                  formData.amountType === "Percentage" ? "Percentage (%) *" :
                    "Amount/Percentage *"}
              </Label>
              <Input
                id="payroll_percentage"
                type="number"
                value={formData.payroll_percentage}
                onChange={(e) => handleChange("payroll_percentage", e.target.value)}
                placeholder={
                  formData.amountType === "Fixed" ? "Enter fixed amount" :
                    formData.amountType === "Percentage" ? "Enter percentage" :
                      "Select amount type first"
                }
                disabled={!formData.amountType}
                className={errors.payroll_percentage ? "border-red-500" : ""}
              />
              {errors.payroll_percentage && <p className="text-red-500 text-xs">{errors.payroll_percentage}</p>}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => handleChange("sort_order", e.target.value)}
                placeholder="Enter sort order"
                min="0"
              />
              <p className="text-xs text-gray-500">Current value: {formData.sort_order || 'Empty'}</p>
            </div>

            {/* Day Wise Count */}
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="day_count"
                checked={formData.day_count}
                onCheckedChange={(checked) => handleChange("day_count", checked)}
              />
              <Label htmlFor="day_count" className="cursor-pointer">Day Wise Count</Label>
            </div>
          </div>

          <div className="flex justify-center space-x-3 pt-4">
            {/* <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button> */}
            <Button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 px-8 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700"
            >
              {loading
                ? "Saving..."
                : editingPayroll
                  ? "Update "
                  : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PayrollTypeDialog;