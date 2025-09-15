"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface PayrollType {
  id: number;
  type: string;
  name: string;
  amountType: string;
  amount?: number | null; // ✅ Added for Fixed amount
  percentage: number | null;
  status: "Active" | "Inactive";
  dayWiseCount: boolean;
}

interface PayrollTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPayroll: PayrollType | null;
  formData: Omit<PayrollType, "id">;
  onFormChange: (field: string, value: any) => void;
  onSave: (formData: Omit<PayrollType, "id">) => void;
}

export function PayrollTypeDialog({
  open,
  onOpenChange,
  editingPayroll,
  formData,
  onFormChange,
  onSave,
}: PayrollTypeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingPayroll ? "Edit Payroll Type" : "Add Payroll Type"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {editingPayroll
              ? "Update the details for this payroll type."
              : "Fill in the details to add a new payroll type."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              {/* Payroll Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => onFormChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Earning">Earning</SelectItem>
                    <SelectItem value="Deduction">Deduction</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Type */}
              <div className="space-y-2">
                <Label htmlFor="amountType">Amount Type</Label>
                <Select
                  value={formData.amountType}
                  onValueChange={(value) => onFormChange("amountType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select amount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed">Flat</SelectItem>
                    <SelectItem value="Percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Day Wise Count */}
              <div className="space-y-2">
                <Label htmlFor="dayWiseCount">Day Wise Count</Label>
                <div className="flex items-center space-x-3 pt-2">
                  <Switch
                    id="dayWiseCount"
                    checked={formData.dayWiseCount}
                    onCheckedChange={(checked) =>
                      onFormChange("dayWiseCount", checked)
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    {formData.dayWiseCount ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Payroll Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => onFormChange("name", e.target.value)}
                  placeholder="Enter payroll name"
                />
              </div>

              {/* Percentage input */}
              {formData.amountType === "Percentage" && (
                <div className="space-y-2">
                  <Label htmlFor="percentage">Percentage (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    value={formData.percentage || ""}
                    onChange={(e) =>
                      onFormChange("percentage", Number(e.target.value))
                    }
                    placeholder="Enter percentage"
                  />
                </div>
              )}

              {/* Fixed amount input */}
              {formData.amountType === "Fixed" && (
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount || ""}
                    onChange={(e) =>
                      onFormChange("amount", Number(e.target.value))
                    }
                    placeholder="Enter fixed amount"
                  />
                </div>
              )}

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => onFormChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave(formData)}
            disabled={!formData.name || !formData.type || !formData.amountType}
          >
            {editingPayroll ? "Update" : "Add"} Payroll Type
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
