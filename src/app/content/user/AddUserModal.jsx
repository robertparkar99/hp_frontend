"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

export default function AddUserModal({
  isOpen,
  setIsOpen,
  sessionData,
  userJobroleLists = [],
  userLOR = [],
  userProfiles = [],
  userLists = [],
}) {
    console.log('Session Data:', sessionData);

  const [formData, setFormData] = useState({
    personal: {
      name_suffix: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      email: "",
      plain_password: "",
      birthdate: "",
      mobile: "",
      jobrole: "",
      responsibility_level: "",
      gender: "M",
      user_profile_id: "",
      join_year: "",
      status: "1",
      imageFile: null,
      imagePreview: "",
      image: "",
    },
    address: {
      user_address: "",
      user_address2: "",
      user_city: "",
      user_state: "",
      user_pincode: "",
    },
    reporting: {
      subordinate: "",
      employee_name: "",
      reporting_method: "",
    },
    attendance: {
      working_days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      monday_in: "",
      monday_out: "",
      tuesday_in: "",
      tuesday_out: "",
      wednesday_in: "",
      wednesday_out: "",
      thursday_in: "",
      thursday_out: "",
      friday_in: "",
      friday_out: "",
      saturday_in: "",
      saturday_out: "",
    },
    deposit: {
      bank_name: "",
      branch_name: "",
      account: "",
      ifsc: "",
      amount: "",
      transfer_type: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleCheckboxChange = (day) => {
    const currentDays = [...formData.attendance.working_days];
    const index = currentDays.indexOf(day);

    if (index === -1) {
      currentDays.push(day);
    } else {
      currentDays.splice(index, 1);
    }

    handleInputChange("attendance", "working_days", currentDays);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      handleInputChange("personal", "imageFile", file);
      const previewURL = URL.createObjectURL(file);
      handleInputChange("personal", "imagePreview", previewURL);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("type", "API");
      formDataToSend.append("sub_institute_id", sessionData.sub_institute_id || "");
      formDataToSend.append("user_id", sessionData.user_id || "");
      formDataToSend.append("_token", sessionData.token || "");
      formDataToSend.append("created_by", sessionData.user_id || "");

      formDataToSend.append("name_suffix", formData.personal.name_suffix);
      formDataToSend.append("user_name", formData.personal.first_name); // required
      formDataToSend.append("first_name", formData.personal.first_name);

      formDataToSend.append("middle_name", formData.personal.middle_name);
      formDataToSend.append("last_name", formData.personal.last_name);
      formDataToSend.append("email", formData.personal.email);
      formDataToSend.append("password", formData.personal.plain_password);
      formDataToSend.append("birthdate", formData.personal.birthdate);
      formDataToSend.append("mobile", formData.personal.mobile);
      formDataToSend.append("allocated_standards", formData.personal.jobrole);
      formDataToSend.append("subject_ids", formData.personal.responsibility_level);
      formDataToSend.append("gender", formData.personal.gender);
      formDataToSend.append("user_profile_id", formData.personal.user_profile_id); // required
      formDataToSend.append("join_year", formData.personal.join_year);
      formDataToSend.append("status", formData.personal.status);

      if (formData.personal.imageFile) {
        formDataToSend.append("user_image", formData.personal.imageFile);
      } else if (formData.personal.image) {
        formDataToSend.append("user_image_path", formData.personal.image);
      }

      formDataToSend.append("address", formData.address.user_address);
      formDataToSend.append("address_2", formData.address.user_address2);
      formDataToSend.append("city", formData.address.user_city);
      formDataToSend.append("state", formData.address.user_state);
      formDataToSend.append("pincode", formData.address.user_pincode);

      formDataToSend.append("supervisor_opt", formData.reporting.subordinate);
      formDataToSend.append("employee_id", formData.reporting.employee_name);
      formDataToSend.append("reporting_method", formData.reporting.reporting_method);

      formDataToSend.append("monday", formData.attendance.working_days.includes("Mon") ? "1" : "0");
      formDataToSend.append("tuesday", formData.attendance.working_days.includes("Tue") ? "1" : "0");
      formDataToSend.append("wednesday", formData.attendance.working_days.includes("Wed") ? "1" : "0");
      formDataToSend.append("thursday", formData.attendance.working_days.includes("Thu") ? "1" : "0");
      formDataToSend.append("friday", formData.attendance.working_days.includes("Fri") ? "1" : "0");
      formDataToSend.append("saturday", formData.attendance.working_days.includes("Sat") ? "1" : "0");
      formDataToSend.append("sunday", "0");

      formDataToSend.append("monday_in_date", formData.attendance.monday_in);
      formDataToSend.append("monday_out_date", formData.attendance.monday_out);
      formDataToSend.append("tuesday_in_date", formData.attendance.tuesday_in);
      formDataToSend.append("tuesday_out_date", formData.attendance.tuesday_out);
      formDataToSend.append("wednesday_in_date", formData.attendance.wednesday_in);
      formDataToSend.append("wednesday_out_date", formData.attendance.wednesday_out);
      formDataToSend.append("thursday_in_date", formData.attendance.thursday_in);
      formDataToSend.append("thursday_out_date", formData.attendance.thursday_out);
      formDataToSend.append("friday_in_date", formData.attendance.friday_in);
      formDataToSend.append("friday_out_date", formData.attendance.friday_out);
      formDataToSend.append("saturday_in_date", formData.attendance.saturday_in);
      formDataToSend.append("saturday_out_date", formData.attendance.saturday_out);

      formDataToSend.append("bank_name", formData.deposit.bank_name);
      formDataToSend.append("branch_name", formData.deposit.branch_name);
      formDataToSend.append("account_no", formData.deposit.account);
      formDataToSend.append("ifsc_code", formData.deposit.ifsc);
      formDataToSend.append("amount", formData.deposit.amount);
      formDataToSend.append("transfer_type", formData.deposit.transfer_type);

      formDataToSend.append("jobtitle_id", "0");
      formDataToSend.append("load", "6");
      formDataToSend.append("department_id", "1");
      formDataToSend.append("submit", "Update");

      const response = await fetch(
        `${sessionData.APP_URL}/user/add_user?token=${sessionData.token}`,
        {
          method: "POST",
          body: formDataToSend,
          headers: { Accept: "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to add user");

      const result = await response.json();
      alert(result.message || "User added successfully!");
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl overflow-y-auto max-h-[95vh]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <section>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Suffix</Label>
                <Select
                  value={formData.personal.name_suffix}
                  onValueChange={(val) =>
                    handleInputChange("personal", "name_suffix", val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mr. / Ms. / Dr." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr.">Mr.</SelectItem>
                    <SelectItem value="Mrs.">Mrs.</SelectItem>
                    <SelectItem value="Ms.">Ms.</SelectItem>
                    <SelectItem value="Dr.">Dr.</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>First Name *</Label>
                <Input
                  placeholder="Enter First Name"
                  value={formData.personal.first_name}
                  onChange={(e) =>
                    handleInputChange("personal", "first_name", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <Label>Middle Name</Label>
                <Input
                  placeholder="Enter Middle Name"
                  value={formData.personal.middle_name}
                  onChange={(e) =>
                    handleInputChange("personal", "middle_name", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Last Name *</Label>
                <Input
                  placeholder="Enter Last Name"
                  value={formData.personal.last_name}
                  onChange={(e) =>
                    handleInputChange("personal", "last_name", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="example@domain.com"
                  value={formData.personal.email}
                  onChange={(e) =>
                    handleInputChange("personal", "email", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <Label>Password *</Label>
                <Input
                  type="password"
                  placeholder="Password"
                  value={formData.personal.plain_password}
                  onChange={(e) =>
                    handleInputChange("personal", "plain_password", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <Label>Birthdate</Label>
                <Input
                  type="date"
                  value={formData.personal.birthdate}
                  onChange={(e) =>
                    handleInputChange("personal", "birthdate", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Mobile *</Label>
                <Input
                  placeholder="Mobile Number"
                  value={formData.personal.mobile}
                  onChange={(e) =>
                    handleInputChange("personal", "mobile", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <Label>Job Role</Label>
                <Select
                  value={formData.personal.jobrole}
                  onValueChange={(val) =>
                    handleInputChange("personal", "jobrole", val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Jobrole" />
                  </SelectTrigger>
                  <SelectContent>
                    {userJobroleLists.map((jobrole) => (
                      <SelectItem key={jobrole.id} value={jobrole.id}>
                        {jobrole.name || jobrole.jobrole} {/* safe fallback */}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Responsibility Level</Label>
                <Select
                  value={formData.personal.responsibility_level}
                  onValueChange={(val) =>
                    handleInputChange("personal", "responsibility_level", val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {userLOR.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Gender</Label>
                <RadioGroup
                  value={formData.personal.gender}
                  onValueChange={(val) =>
                    handleInputChange("personal", "gender", val)
                  }
                  className="flex space-x-4 mt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="M" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="F" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>User Profile</Label>
                <Select
                  value={formData.personal.user_profile_id}
                  onValueChange={(val) =>
                    handleInputChange("personal", "user_profile_id", val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {userProfiles.length > 0 ? (
                      userProfiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name || profile.profile_name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem disabled value="no-profiles">
                        No profiles found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Joining Year</Label>
                <Input
                  type="text"
                  placeholder="YYYY"
                  value={formData.personal.join_year}
                  onChange={(e) =>
                    handleInputChange("personal", "join_year", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={formData.personal.status}
                  onValueChange={(val) =>
                    handleInputChange("personal", "status", val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label>User Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="max-w-xs"
                />
                {formData.personal.imagePreview && (
                  <div className="mt-2">
                    <img
                      src={formData.personal.imagePreview}
                      alt="Preview"
                      className="h-24 w-24 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Address Information */}
          <section>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">
              Address Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Address</Label>
                <Input
                  placeholder="Enter Address"
                  value={formData.address.user_address}
                  onChange={(e) =>
                    handleInputChange("address", "user_address", e.target.value)
                  }
                />
              </div>

              <div className="col-span-2">
                <Label>Temporary Address</Label>
                <Input
                  placeholder="Enter Temporary Address"
                  value={formData.address.user_address2}
                  onChange={(e) =>
                    handleInputChange("address", "user_address2", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>City</Label>
                <Input
                  placeholder="Enter City"
                  value={formData.address.user_city}
                  onChange={(e) =>
                    handleInputChange("address", "user_city", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>State</Label>
                <Input
                  placeholder="Enter State"
                  value={formData.address.user_state}
                  onChange={(e) =>
                    handleInputChange("address", "user_state", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Pincode</Label>
                <Input
                  placeholder="Enter Pincode"
                  value={formData.address.user_pincode}
                  onChange={(e) =>
                    handleInputChange("address", "user_pincode", e.target.value)
                  }
                />
              </div>
            </div>
          </section>

          {/* Reporting Information */}
          <section>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">
              Reporting Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Supervisor / Subordinate</Label>
                <Select
                  value={formData.reporting.subordinate}
                  onValueChange={(val) =>
                    handleInputChange("reporting", "subordinate", val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="Subordinate">Subordinate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Employee Name</Label>
                <Select
                  value={formData.reporting.employee_name}
                  onValueChange={(val) =>
                    handleInputChange("reporting", "employee_name", val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {userLists.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {`${user.first_name} ${user.last_name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Reporting Method</Label>
                <Select
                  value={formData.reporting.reporting_method}
                  onValueChange={(val) =>
                    handleInputChange("reporting", "reporting_method", val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Direct">Direct</SelectItem>
                    <SelectItem value="Indirect">Indirect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Attendance Information */}
          <section>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">
              Attendance Information
            </h2>

            <div className="mb-4">
              <Label>Working Days</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={formData.attendance.working_days.includes(day)}
                      onCheckedChange={() => handleCheckboxChange(day)}
                    />
                    <Label htmlFor={day}>{day}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { day: "Monday", in: "monday_in", out: "monday_out" },
                { day: "Tuesday", in: "tuesday_in", out: "tuesday_out" },
                { day: "Wednesday", in: "wednesday_in", out: "wednesday_out" },
                { day: "Thursday", in: "thursday_in", out: "thursday_out" },
                { day: "Friday", in: "friday_in", out: "friday_out" },
                { day: "Saturday", in: "saturday_in", out: "saturday_out" },
              ].map((item) => (
                <React.Fragment key={item.day}>
                  <div>
                    <Label>{item.day} In Time</Label>
                    <Input
                      type="time"
                      onChange={(e) =>
                        handleInputChange("attendance", item.in, e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label>{item.day} Out Time</Label>
                    <Input
                      type="time"
                      onChange={(e) =>
                        handleInputChange("attendance", item.out, e.target.value)
                      }
                    />
                  </div>
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* Deposit Information */}
          <section>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">
              Deposit Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Bank Name</Label>
                <Input
                  placeholder="Enter Bank Name"
                  value={formData.deposit.bank_name}
                  onChange={(e) =>
                    handleInputChange("deposit", "bank_name", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Branch Name</Label>
                <Input
                  placeholder="Enter Branch Name"
                  value={formData.deposit.branch_name}
                  onChange={(e) =>
                    handleInputChange("deposit", "branch_name", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Account Number</Label>
                <Input
                  placeholder="Enter Account Number"
                  value={formData.deposit.account}
                  onChange={(e) =>
                    handleInputChange("deposit", "account", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>IFSC Code</Label>
                <Input
                  placeholder="Enter IFSC Code"
                  value={formData.deposit.ifsc}
                  onChange={(e) =>
                    handleInputChange("deposit", "ifsc", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter Amount"
                  value={formData.deposit.amount}
                  onChange={(e) =>
                    handleInputChange("deposit", "amount", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Transfer Type</Label>
                <Select
                  value={formData.deposit.transfer_type}
                  onValueChange={(val) =>
                    handleInputChange("deposit", "transfer_type", val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Direct">Direct</SelectItem>
                    <SelectItem value="Indirect">Indirect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
