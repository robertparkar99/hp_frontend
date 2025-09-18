"use client";
import { useState } from "react";
import { Send, RotateCcw, Calendar, User, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

const ApplyLeave = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    employeeName: "",
    employeeId: "",
    department: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    duration: "full-day",
    reason: "",
    contactDuringLeave: "",
  });

  const departments = [
    "Human Resources",
    "Information Technology",
    "Finance",
    "Marketing",
    "Operations",
    "Sales",
  ];

  const leaveTypes = [
    "Annual Leave",
    "Sick Leave",
    "Personal Leave",
    "Maternity Leave",
    "Paternity Leave",
    "Emergency Leave",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.employeeName || !formData.leaveType || !formData.startDate || !formData.endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Leave Application Submitted",
      description: "Your leave application has been submitted successfully and is pending approval.",
    });
    
    // Reset form
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      employeeName: "",
      employeeId: "",
      department: "",
      leaveType: "",
      startDate: "",
      endDate: "",
      duration: "full-day",
      reason: "",
      contactDuringLeave: "",
    });
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leave Application Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Employee Name *
                </Label>
                <Input
                  className="mt-2"
                  id="employeeName"
                  value={formData.employeeName}
                  onChange={(e) => handleInputChange("employeeName", e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange("employeeId", e.target.value)}
                  placeholder="Enter employee ID"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="department" className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4" />
                Department
              </Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your department" />
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

            {/* Leave Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Leave Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="leaveType">Leave Type *</Label>
                  <Select value={formData.leaveType} onValueChange={(value) => handleInputChange("leaveType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration</Label>
                  <RadioGroup
                    value={formData.duration}
                    onValueChange={(value) => handleInputChange("duration", value)}
                    className="flex flex-row space-x-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full-day" id="full-day" />
                      <Label htmlFor="full-day">Full Day</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="half-day" id="half-day" />
                      <Label htmlFor="half-day">Half Day</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Total Days</Label>
                  <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center">
                    <span className="text-foreground font-medium">
                      {calculateDays()} {calculateDays() === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>
              
              <div>
                <Label htmlFor="reason">Reason for Leave</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                  placeholder="Please provide a brief reason for your leave"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="contactDuringLeave">Contact During Leave</Label>
                <Input
                  id="contactDuringLeave"
                  value={formData.contactDuringLeave}
                  onChange={(e) => handleInputChange("contactDuringLeave", e.target.value)}
                  placeholder="Phone number or email (optional)"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button type="submit" className="btn-primary">
                <Send className="h-4 w-4 mr-2" />
                Submit Application
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplyLeave;