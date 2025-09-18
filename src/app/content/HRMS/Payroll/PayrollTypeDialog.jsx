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
//     dayWiseCount: false,
//   });
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   // Pre-fill when editing
//   useEffect(() => {
//     if (editingPayroll && open) {
//       setFormData({
//         type: editingPayroll.type === "Earning" ? "Earning" : "Deduction",
//         amountType: editingPayroll.amountType === "Fixed" ? "Fixed" : "Percentage",
//         payrollName: editingPayroll.name || "",
//         payroll_percentage: editingPayroll.payroll_percentage?.toString() || "",
//         status: editingPayroll.status || "Active",
//         sortOrder: editingPayroll.sort_order?.toString() || "",
//         dayWiseCount: editingPayroll.dayWiseCount || false,
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
//         dayWiseCount: false,
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
//     data.append("day_wise_count", formData.dayWiseCount ? "1" : "0");

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
//         // 🔹 Show different alerts for Add vs Edit
//         if (editingPayroll && editingPayroll.id) {
//           alert("Payroll Type updated successfully ✅");
//         } else {
//           alert("Payroll Type added successfully 🎉");
//         }
//         onSave(); // This should trigger the refresh in the parent component
//         onOpenChange(false);
//       } else {
//         throw new Error(result.message || "Unknown error occurred");
//       }
//     } catch (err) {
//       console.error("Error saving payroll type:", err);
//       alert("Error: " + (err.message || "Something went wrong")); // Uncommented this line
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

//         <div className="flex flex-col space-y-4">
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
//                  formData.amountType === "Percentage" ? "Percentage (%) *" : 
//                  "Amount/Percentage *"}
//               </Label>
//               <Input
//                 id="payroll_percentage"
//                 type="number"
//                 value={formData.payroll_percentage}
//                 onChange={(e) => handleChange("payroll_percentage", e.target.value)}
//                 placeholder={
//                   formData.amountType === "Fixed" ? "Enter fixed amount" :
//                   formData.amountType === "Percentage" ? "Enter percentage" :
//                   "Select amount type first"
//                 }
//                 disabled={!formData.amountType}
//                 min={formData.amountType === "Percentage" ? "0" : undefined}
//                 max={formData.amountType === "Percentage" ? "100" : undefined}
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
//                 id="dayWiseCount"
//                 checked={formData.dayWiseCount}
//                 onCheckedChange={(checked) => handleChange("dayWiseCount", checked)}
//               />
//               <Label htmlFor="dayWiseCount" className="cursor-pointer">Day Wise Count</Label>
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
//                 ? "Update Payroll Type"
//                 : "Add Payroll Type"}
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
    sortOrder: "",
    day_count: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Pre-fill when editing
  useEffect(() => {
    if (editingPayroll && open) {
      setFormData({
        type: editingPayroll.type === "Earning" ? "Earning" : "Deduction",
        amountType: editingPayroll.amountType === "Fixed" ? "Fixed" : "Percentage",
        payrollName: editingPayroll.name || "",
        payroll_percentage: editingPayroll.payroll_percentage?.toString() || "",
        status: editingPayroll.status || "Active",
        sortOrder: editingPayroll.sort_order?.toString() || "",
        day_count: editingPayroll.day_count === "no" ? true : false,
      });
    } else if (open) {
      // Reset form when opening for new entry
      setFormData({
        type: "",
        amountType: "",
        payrollName: "",
        payroll_percentage: "",
        status: "Active",
        sortOrder: "",
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

    if (formData.sortOrder) {
      data.append("sort_order", formData.sortOrder);
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
        // Close dialog immediately

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
            <div className="space-y-2">
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
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => handleChange("sortOrder", e.target.value)}
                placeholder="Enter sort order"
                min="0"
              />
            </div>

            {/* Day Wise Count */}
            {/* <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="day_count"
                checked={formData.day_count}
                onCheckedChange={(checked) => handleChange("day_count", checked)}
              />
              <Label htmlFor="day_count" className="cursor-pointer">Day Wise Count</Label>
            </div> */}
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="day_count"
                checked={formData.day_count}
                onCheckedChange={(checked) =>
                  handleChange("day_count", checked)
                }
              />
              <Label htmlFor="day_count" className="cursor-pointer">
                Day Wise Count
              </Label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2"
            >
              {loading
                ? "Saving..."
                : editingPayroll
                  ? "Update Payroll Type"
                  : "Add Payroll Type"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PayrollTypeDialog;