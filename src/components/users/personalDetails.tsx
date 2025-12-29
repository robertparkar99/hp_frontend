"use client";

import React, { useEffect, useState, useMemo } from "react";
import "../../app/content/Dashboard/UserProfile.css";
import Loading from "../../components/utils/loading";

interface userDetailsprops {
  userDetails: any | [];
  userdepartment: any | [];
  userJobroleLists: any | [];
  userLOR: any | [];
  userProfiles: any | [];
  userLists: any | [];
  sessionData: any | [];
  fullJobroleData?: any;
  onUpdate?: () => void;
}
type TabId = "personal" | "address" | "reporting" | "attendance" | "deposit";

const PersonalDetails: React.FC<userDetailsprops> = ({
  userDetails,
  userdepartment,
  userJobroleLists,
  userLOR,
  userProfiles,
  userLists,
  sessionData,
  fullJobroleData,
  onUpdate,
}) => {
  // Form state
  const [isLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    personal: {
      name_suffix: userDetails?.name_suffix || "",
      first_name: userDetails?.first_name || "",
      middle_name: userDetails?.middle_name || "",
      last_name: userDetails?.last_name || "",
      email: userDetails?.email || "",
      plain_password: userDetails?.plain_password || "",
      birthdate: userDetails?.birthdate
        ? new Date(userDetails.birthdate).toISOString().split("T")[0]
        : "",
      mobile: userDetails?.mobile || "",
     department: userDetails?.department_id || "",
      jobrole: userDetails?.allocated_standards || "",
      responsibility_level: userDetails?.subject_ids || "",
      gender: userDetails?.gender || "M",
      user_profile_id: userDetails?.user_profile_id || "",
      join_year: userDetails?.join_year || "",
      status: userDetails?.status,
      image: userDetails?.image || "",
      imageFile: null as File | null, // Add this field to store the file object
    },
    address: {
      user_address: userDetails?.address || "",
      user_address2: userDetails?.address_2 || "",
      user_city: userDetails?.city || "",
      user_state: userDetails?.state || "",
      user_pincode: userDetails?.pincode || "",
    },
    reporting: {
      subordinate: userDetails?.supervisor_opt || "",
      employee_name: userDetails?.employee_id || "",
      reporting_method: userDetails?.reporting_method || "",
    },
    attendance: {
      working_days: userDetails?.working_days || [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
      ],
      monday_in: userDetails?.monday_in_date || "",
      monday_out: userDetails?.monday_out_date || "",
      tuesday_in: userDetails?.tuesday_in_date || "",
      tuesday_out: userDetails?.tuesday_out_date || "",
      wednesday_in: userDetails?.wednesday_in_date || "",
      wednesday_out: userDetails?.wednesday_out_date || "",
      thursday_in: userDetails?.thursday_in_date || "",
      thursday_out: userDetails?.thursday_out_date || "",
      friday_in: userDetails?.friday_in_date || "",
      friday_out: userDetails?.friday_out_date || "",
      saturday_in: userDetails?.saturday_in_date || "",
      saturday_out: userDetails?.saturday_out_date || "",
    },
    deposit: {
      bank_name: userDetails?.bank_name || "",
      branch_name: userDetails?.branch_name || "",
      account: userDetails?.account_no || "",
      ifsc: userDetails?.ifsc_code || "",
      amount: userDetails?.amount || "",
      transfer_type: userDetails?.transfer_type || "",
    },
  });

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<TabId>("personal");
  const [toggleState, setToggleState] = useState(false);

  // Check if user can edit department and jobrole
  const isReadOnly = sessionData?.userProfile?.toLowerCase() !== "admin";

  // Collect all jobroles from all departments
  const allJobroles = fullJobroleData ? Object.values(fullJobroleData).flat().map((r: any) =>
    typeof r === "string" ? { id: r, jobrole: r } : r
  ) : [];

  // Compute filtered jobroles based on selected department
  const filteredJobroles = useMemo(() => {
    if (!fullJobroleData) {
      return [];
    }

    const selectedDeptId = formData.personal.department;

    if (!selectedDeptId) {
      return [];
    }

    // STEP 1: find department_name from API using department_id
    let departmentName = "";

    Object.keys(fullJobroleData).forEach((deptName) => {
      const first = fullJobroleData[deptName][0];
      if (first.department_id == selectedDeptId) {
        departmentName = deptName;
      }
    });

    // STEP 2: get job roles for that department
    if (departmentName && fullJobroleData[departmentName]) {
      const roles = fullJobroleData[departmentName];

      const normalized = roles.map((r: any) =>
        typeof r === "string" ? { id: r, jobrole: r } : r
      );

      return normalized;
    } else {
      return [];
    }
  }, [formData.personal.department, fullJobroleData]);


  


  const tabs = [
    {
      id: "personal",
      text: "Personal Details",
      href: null,
      icon: "mdi mdi-account-outline",
    },
    {
      id: "address",
      text: "Address",
      href: "#AdressSec",
      icon: "mdi mdi-map-marker-outline",
    },
    {
      id: "reporting",
      text: "Reporting",
      href: "#reportsec",
      icon: "mdi mdi-chart-bar",
    },
    {
      id: "attendance",
      text: "Attendance",
      href: "#attendance",
      icon: "mdi mdi-table-account",
    },
    {
      id: "deposit",
      text: "Direct Deposit",
      href: "#depositsec",
      icon: "mdi mdi-bank-outline",
    },
  ];

  const handleTabClick = (id: TabId, href: string | null) => {
    setActiveSection(id);
    if (href) {
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleInputChange = (section: TabId, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleCheckboxChange = (day: string) => {
    const currentDays = [...formData.attendance.working_days];
    const index = currentDays.indexOf(day);

    if (index === -1) {
      currentDays.push(day);
    } else {
      currentDays.splice(index, 1);
    }

    handleInputChange("attendance", "working_days", currentDays);
  };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setLoading(true);
  try {
    const formDataToSend = new FormData();
    formDataToSend.append("type", "API");
    formDataToSend.append("_method", "PUT");
    formDataToSend.append(
      "sub_institute_id",
      sessionData?.subInstituteId || ""
    );
    formDataToSend.append("user_id", sessionData?.userId || "");
    formDataToSend.append("_token", sessionData?.token || "");

    // Personal data - ensure department_id is the ID, not name
    formDataToSend.append("name_suffix", formData.personal.name_suffix);
    formDataToSend.append("first_name", formData.personal.first_name);
    formDataToSend.append("middle_name", formData.personal.middle_name);
    formDataToSend.append("last_name", formData.personal.last_name);
    formDataToSend.append("email", formData.personal.email);
    formDataToSend.append("mobile", formData.personal.mobile);
    
    // This is the critical fix - ensure department_id is the ID
    formDataToSend.append("department_id", formData.personal.department);
    
    formDataToSend.append("allocated_standards", formData.personal.jobrole);
    formDataToSend.append(
      "subject_ids",
      formData.personal.responsibility_level
    );
    formDataToSend.append("gender", formData.personal.gender);
    formDataToSend.append(
      "user_profile_id",
      formData.personal.user_profile_id
    );
    formDataToSend.append("join_year", formData.personal.join_year);
    formDataToSend.append("status", formData.personal.status);
    formDataToSend.append("password", formData.personal.plain_password);
    formDataToSend.append("birthdate", formData.personal.birthdate);

      // Only append the image file if it exists (new upload)
      if (formData.personal.imageFile) {
        formDataToSend.append("user_image", formData.personal.imageFile);
      }

      // Address data
      formDataToSend.append("address", formData.address.user_address);
      formDataToSend.append("address_2", formData.address.user_address2);
      formDataToSend.append("city", formData.address.user_city);
      formDataToSend.append("state", formData.address.user_state);
      formDataToSend.append("pincode", formData.address.user_pincode);

      // Reporting data
      formDataToSend.append("supervisor_opt", formData.reporting.subordinate);
      formDataToSend.append("employee_id", formData.reporting.employee_name);
      formDataToSend.append(
        "reporting_method",
        formData.reporting.reporting_method
      );

      // Attendance data
      formDataToSend.append(
        "monday",
        formData.attendance.working_days.includes("Mon") ? "1" : "0"
      );
      formDataToSend.append(
        "tuesday",
        formData.attendance.working_days.includes("Tue") ? "1" : "0"
      );
      formDataToSend.append(
        "wednesday",
        formData.attendance.working_days.includes("Wed") ? "1" : "0"
      );
      formDataToSend.append(
        "thursday",
        formData.attendance.working_days.includes("Thu") ? "1" : "0"
      );
      formDataToSend.append(
        "friday",
        formData.attendance.working_days.includes("Fri") ? "1" : "0"
      );
      formDataToSend.append(
        "saturday",
        formData.attendance.working_days.includes("Sat") ? "1" : "0"
      );
      formDataToSend.append("sunday", "0"); // Hardcoded as per your example

      formDataToSend.append("monday_in_date", formData.attendance.monday_in);
      formDataToSend.append("monday_out_date", formData.attendance.monday_out);
      formDataToSend.append("tuesday_in_date", formData.attendance.tuesday_in);
      formDataToSend.append(
        "tuesday_out_date",
        formData.attendance.tuesday_out
      );
      formDataToSend.append(
        "wednesday_in_date",
        formData.attendance.wednesday_in
      );
      formDataToSend.append(
        "wednesday_out_date",
        formData.attendance.wednesday_out
      );
      formDataToSend.append(
        "thursday_in_date",
        formData.attendance.thursday_in
      );
      formDataToSend.append(
        "thursday_out_date",
        formData.attendance.thursday_out
      );
      formDataToSend.append("friday_in_date", formData.attendance.friday_in);
      formDataToSend.append("friday_out_date", formData.attendance.friday_out);
      formDataToSend.append(
        "saturday_in_date",
        formData.attendance.saturday_in
      );
      formDataToSend.append(
        "saturday_out_date",
        formData.attendance.saturday_out
      );

      // Deposit data
      formDataToSend.append("bank_name", formData.deposit.bank_name);
      formDataToSend.append("branch_name", formData.deposit.branch_name);
      formDataToSend.append("account_no", formData.deposit.account);
      formDataToSend.append("ifsc_code", formData.deposit.ifsc);
      formDataToSend.append("amount", formData.deposit.amount);
      formDataToSend.append("transfer_type", formData.deposit.transfer_type);

      // Additional fields from your example
      // formDataToSend.append("jobtitle_id", formData.personal.jobrole); // For jobrole ID
      formDataToSend.append("department_id", formData.personal.department);
    
    formDataToSend.append("load", "6");
    formDataToSend.append("submit", "Update");

    const response = await fetch(
      `${sessionData?.url}/user/add_user/${userDetails?.id}`,
      {
        method: "POST",
        body: formDataToSend,
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    const result = await response.json();
    setLoading(false);
    alert(result.message);
    if (onUpdate) {
      onUpdate();
    }
    console.log("Update successful:", result);
  } catch (error) {
    console.error("Error updating user:", error);
    setLoading(false);
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Header Section */}
          <div className="header-ajit mb-8">
            <div className="header-section">
              <div className="h-full bg-[url('/Header.png')] bg-contain bg-no-repeat">
                <div className="rounded-lg">
                  {formData.personal.image.startsWith("blob:") ? (
                    <img
                      src={formData.personal.image}
                      alt="User icon"
                      style={{ transform: "translate(28%,21%)" }}
                      className="lg:w-[170px] lg:h-[170px] md:w-[120px] md:h-[120px] rounded-full relative object-cover border-[2px] shadow-lg border-white"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39";
                      }}
                    />
                  ) : (
                    <img
                      src={`https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${userDetails?.image}`}
                      alt="User icon"
                      style={{ transform: "translate(28%,21%)" }}
                      className="lg:w-[170px] lg:h-[170px] md:w-[120px] md:h-[120px] rounded-full relative object-cover border-[2px] shadow-lg border-white"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39";
                      }}
                    />
                  )}

                </div>
                <div
                  className="header-content"
                  style={{ transform: "translate(12%,-175%)" }}
                >
                  <span className="text-2xl font-bold">
                    {formData.personal.first_name}{" "}
                    {formData.personal.middle_name}{" "}
                    {formData.personal.last_name}
                  </span>
                </div>
                <div
                  className="header-content"
                  style={{ transform: "translate(12%,95%)" }}
                >
                  <span className="text-[20px]">
                    {userDetails?.userJobrole}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex mt-14">
            {/* Sidebar Menu */}
            <div className="sidebar-menu">
              {tabs.map((item) => (
                <div
                  key={item.id}
                  className={`cursor-pointer transition-colors duration-200 px-3 py-2 border-b-1 border-[1px solid rgba(71, 160, 255, 0.1)] ${activeSection === item.id
                    ? "bg-[#47a0ff]"
                    : "bg-white text-gray-600 hover:bg-blue-100"
                    }`}
                  onClick={() => handleTabClick(item.id as TabId, item.href)}
                >
                  <i
                    className={`${item.icon} ${activeSection === item.id ? "text-white" : "text-gray-600"
                      } w-5 h-5 mr-2`}
                  ></i>
                  <span
                    className={`${activeSection === item.id ? "text-white" : "text-gray-600"
                      }`}
                  >
                    {item.href ? (
                      <a href={item.href} onClick={(e) => e.preventDefault()}>
                        {item.text}
                      </a>
                    ) : (
                      item.text
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Content Sections */}
            <div className="content-area w-full ml-10 bg-white rounded-lg">
              {/* Form Content */}
              <div className="form-content">
                <h2 className="section-title">
                  {activeSection === "personal"
                    ? "Personal Information"
                    : activeSection === "address"
                      ? "Address Information"
                      : activeSection === "reporting"
                        ? "Reporting & Attendance Information"
                        : activeSection === "attendance"
                          ? "Attendance Information"
                          : activeSection === "deposit"
                            ? "Deposit Information"
                            : ""}
                </h2>
                <div className="title-underline"></div>

                {activeSection === "personal" && (
                  <div className="form-grid">
                    {/* Name Section */}
                    <div className="form-row">
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Suffix
                        </label>
                        <select
                          className="w-full h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter border-none outline-none shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)]"
                          value={formData.personal.name_suffix}
                          onChange={(e) =>
                            handleInputChange(
                              "personal",
                              "name_suffix",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select Suffix</option>
                          {["Mr.", "Mrs.", "Ms.", "Dr."].map((suffix) => (
                            <option key={suffix} value={suffix}>
                              {suffix}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          placeholder="First Name"
                          value={formData.personal.first_name}
                          onChange={(e) =>
                            handleInputChange(
                              "personal",
                              "first_name",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Middle Name
                        </label>
                        <input
                          type="text"
                          placeholder="Middle Name"
                          value={formData.personal.middle_name}
                          onChange={(e) =>
                            handleInputChange(
                              "personal",
                              "middle_name",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={formData.personal.last_name}
                          onChange={(e) =>
                            handleInputChange(
                              "personal",
                              "last_name",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Contact Section */}
                    <div className="form-row">
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={formData.personal.email}
                          onChange={(e) =>
                            handleInputChange(
                              "personal",
                              "email",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="input-field relative">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Password
                        </label>
                        <input
                          type={toggleState ? "text" : "password"}
                          placeholder="Password"
                          value={formData.personal.plain_password}
                          onChange={(e) =>
                            handleInputChange(
                              "personal",
                              "plain_password",
                              e.target.value
                            )
                          }
                        />
                        <i
                          className={`fa fa-eye${toggleState ? "-slash" : ""
                            } absolute right-3 top-8 cursor-pointer text-gray-500 hover:text-gray-700`}
                          onClick={() => setToggleState(!toggleState)}
                        ></i>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Birthdate
                        </label>
                        <input
                          type="date"
                          placeholder="01-01-2000"
                          value={formData.personal.birthdate}
                          onChange={(e) =>
                            handleInputChange(
                              "personal",
                              "birthdate",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Mobile
                        </label>
                        <input
                          type="tel"
                          placeholder="Mobile Number"
                          value={formData.personal.mobile}
                          onChange={(e) =>
                            handleInputChange(
                              "personal",
                              "mobile",
                              e.target.value
                            )
                          }
                          pattern="[0-9]{10}"
                        />
                      </div>
                    </div>

                    {/* Department Section */}
                    <div className="form-row">
  
<div className="input-field">
  <label className="block mb-1 text-sm font-medium text-gray-700">
    Department
  </label>
  <select
    className={`w-full h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter border-none outline-none shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)] ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
    value={formData.personal.department}
    disabled={isReadOnly}
    onChange={(e) =>
      handleInputChange("personal", "department", Number(e.target.value))
    }
  >

  <option value="">Select Department</option>

  {/* Build department dropdown from fullJobroleData */}
  {fullJobroleData &&
    Object.keys(fullJobroleData).map((deptName) => {
      const first = fullJobroleData[deptName][0]; // always contains department_id + name
      return (
        <option key={first.department_id} value={first.department_id}>
          {first.department_name}
        </option>
      );
    })}
</select>

</div>
                     <div className="input-field">
  <label className="block mb-1 text-sm font-medium text-gray-700">
    Job Role
  </label>
  <select
    className={`w-full h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter border-none outline-none shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)] ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
    value={formData.personal.jobrole}
    disabled={isReadOnly}
    onChange={(e) =>
      handleInputChange(
        "personal",
        "jobrole",
        e.target.value
      )
    }
  >
    <option value="">Select Jobrole</option>
    {filteredJobroles && filteredJobroles.length > 0 ? (
      filteredJobroles.map((jobrole: any) => (
        <option
          key={jobrole.id}
          value={jobrole.id}
        >
          {jobrole.jobrole}
        </option>
      ))
    ) : (
      <option value="" disabled>
        No job roles available
      </option>
    )}
  </select>
</div>
                    </div>

                    {/* Job Section */}
                    <div className="form-row">
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Responsibility Level
                        </label>
                        <select
                          className="w-full h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter border-none outline-none shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)]"
                          value={formData.personal.responsibility_level}
                          onChange={(e) =>
                            handleInputChange(
                              "personal",
                              "responsibility_level",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Level of Responsibility</option>
                          {userLOR && userLOR.length > 0 ? (
                            userLOR.map((level: any) => (
                              <option
                                key={level.id}
                                value={level.id}
                                selected={userDetails?.subject_ids == level.id}
                              >
                                {level.level}{" "}
                                {/* Assuming the field is called 'level' */}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              No levels available
                            </option>
                          )}
                        </select>
                      </div>
                      <div className="input-field">
                        <label className="block text-[#393939] text-[14px] font-normal font-inter mb-2">
                          Gender
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 w-fit h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)] cursor-pointer">
                            <input
                              type="radio"
                              name="gender"
                              value="M"
                              checked={formData.personal.gender === "M"}
                              onChange={() =>
                                handleInputChange("personal", "gender", "M")
                              }
                              className="accent-blue-500 no-shadow"

                            />
                            Male
                          </label>
                          <label className="flex items-center gap-2 w-fit h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)] cursor-pointer">
                            <input
                              type="radio"
                              name="gender"
                              value="F"
                              checked={formData.personal.gender === "F"}
                              onChange={() =>
                                handleInputChange("personal", "gender", "F")
                              }
                              className="accent-pink-500 no-shadow"
                            />
                            Female
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          User Profile
                        </label>
                        <select
                          className="w-full h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter border-none outline-none shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)]"
                          value={formData.personal.user_profile_id}
                          onChange={(e) =>
                            handleInputChange(
                              "personal",
                              "user_profile_id",
                              e.target.value
                            )
                          }
                        >
                          <option value="">User Profile</option>
                          {userProfiles && userProfiles.length > 0 ? (
                            userProfiles.map((userProfile: any) => (
                              <option
                                key={userProfile.id}
                                value={userProfile.id}
                                selected={
                                  userDetails?.user_profile_id == userProfile.id
                                }
                              >
                                {userProfile.name}{" "}
                                {/* Assuming the field is called 'level' */}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              No profiles available
                            </option>
                          )}
                        </select>
                      </div>
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Joining Year
                        </label>
                        <input
                          type="text"
                          placeholder="Joining Year"
                          value={formData.personal.join_year}
                          onChange={(e) =>
                            handleInputChange(
                              "personal",
                              "join_year",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Status Section */}
                    <div className="form-row">
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Inactive Status
                        </label>
                        <select
                          className="w-full h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter border-none outline-none shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)]"
                          value={formData.personal.status}
                          onChange={(e) =>
                            handleInputChange(
                              "personal",
                              "status",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Status</option>
                          <option
                            value="1"
                          >
                            Active
                          </option>
                          <option
                            value="0"
                          >
                            In-Active
                          </option>
                        </select>
                      </div>
                      <div className="input-field w-full">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          User Image
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="file"
                            accept="image/*"
                            className="file-input px-4 py-1 rounded-full shadow-[inset_0px_2px_8px_rgba(0,0,0,0.15)] bg-[#f4faff] text-sm text-[#393939]"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                const previewUrl = URL.createObjectURL(file);
                                handleInputChange(
                                  "personal",
                                  "image",
                                  previewUrl
                                );
                                handleInputChange(
                                  "personal",
                                  "imageFile",
                                  file
                                );
                              }
                            }}
                          />

                          {/* Image Preview */}
                          {formData.personal.image && (
                            <div className="relative">
                              {/* Check if image is a blob URL (new upload) or S3 URL */}
                              {formData.personal.image.startsWith("blob:") ? (
                                <img
                                  src={formData.personal.image}
                                  alt="Preview"
                                  className="h-12 w-12 object-cover rounded-full"
                                />
                              ) : (
                                <img
                                  src={`https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${formData.personal.image}`}
                                  alt="Preview"
                                  className="h-12 w-12 object-cover rounded-full"
                                  onError={(e) => {
                                    // If image fails to load (doesn't exist on S3), clear the preview
                                    handleInputChange("personal", "image", "");
                                  }}
                                />
                              )}

                              {/* Remove button */}
                              <button
                                type="button"
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                onClick={() =>
                                  handleInputChange("personal", "image", "")
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "address" && (
                  <div className="form-grid">
                    <div className="form-row">
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <input
                          type="text"
                          placeholder="Address"
                          value={formData.address.user_address}
                          onChange={(e) =>
                            handleInputChange(
                              "address",
                              "user_address",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          City
                        </label>
                        <input
                          type="text"
                          placeholder="City"
                          value={formData.address.user_city}
                          onChange={(e) =>
                            handleInputChange(
                              "address",
                              "user_city",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          State
                        </label>
                        <input
                          type="text"
                          placeholder="State"
                          value={formData.address.user_state}
                          onChange={(e) =>
                            handleInputChange(
                              "address",
                              "user_state",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Pincode
                        </label>
                        <input
                          type="text"
                          placeholder="Pincode"
                          value={formData.address.user_pincode}
                          onChange={(e) =>
                            handleInputChange(
                              "address",
                              "user_pincode",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="w-full">
                      <div className="input-field w-full">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Temporary address
                        </label>
                        <textarea
                          name="address_2"
                          id="address_2"
                          className="w-full"
                          value={formData.address.user_address2}
                          onChange={(e) =>
                            handleInputChange(
                              "address",
                              "user_address2",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "reporting" && (
                  <div className="form-grid">
                    <div className="form-row">
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Supervisor / Subordinate
                        </label>
                        <select
                          className="w-full h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter border-none outline-none shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)]"
                          value={formData.reporting.subordinate}
                          onChange={(e) =>
                            handleInputChange(
                              "reporting",
                              "subordinate",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select any one</option>
                          {[
                            { value: "Supervisor", label: "Supervisor" },
                            { value: "Subordinate", label: "Subordinate" },
                          ].map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                              selected={
                                userDetails?.supervisor_opt == option.value
                              }
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Employee Name
                        </label>
                        <select
                          className="w-full h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter border-none outline-none shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)]"
                          value={formData.reporting.employee_name}
                          onChange={(e) =>
                            handleInputChange(
                              "reporting",
                              "employee_name",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select Employee</option>
                          {userLists && userLists.length > 0 ? (
                            userLists.map((userList: any) => (
                              <option
                                key={userList.id}
                                value={userList.id}
                                selected={
                                  userDetails?.employee_id == userList.id
                                }
                              >
                                {userList.first_name} {userList.middle_name}{" "}
                                {userList.last_name}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              No employees available
                            </option>
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Reporting Method
                        </label>
                        <select
                          className="w-full h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter border-none outline-none shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)]"
                          value={formData.reporting.reporting_method}
                          onChange={(e) =>
                            handleInputChange(
                              "reporting",
                              "reporting_method",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select any one</option>
                          <option value="Direct">Direct</option>
                          <option value="Indirect">Indirect</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "attendance" && (
                  <div className="form-grid">
                    <div className="form-row">
                      <div className="input-field w-full">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Working Days
                        </label>
                        <div className="flex items-center gap-8">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                            (day, index) => (
                              <label
                                key={index}
                                className="flex items-center gap-2 text-sm font-medium text-gray-700"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.attendance.working_days.includes(
                                    day
                                  )}
                                  onChange={() => handleCheckboxChange(day)}
                                  className="no-shadow"
                                />
                                {day}
                              </label>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {[
                      {
                        day: "Monday",
                        inField: "monday_in",
                        outField: "monday_out",
                      },
                      {
                        day: "Tuesday",
                        inField: "tuesday_in",
                        outField: "tuesday_out",
                      },
                      {
                        day: "Wednesday",
                        inField: "wednesday_in",
                        outField: "wednesday_out",
                      },
                      {
                        day: "Thursday",
                        inField: "thursday_in",
                        outField: "thursday_out",
                      },
                      {
                        day: "Friday",
                        inField: "friday_in",
                        outField: "friday_out",
                      },
                      {
                        day: "Saturday",
                        inField: "saturday_in",
                        outField: "saturday_out",
                      },
                    ].map((item, index) => (
                      <div key={index} className="form-row">
                        <div className="input-field">
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            {item.day} In Time
                          </label>
                          <input
                            type="time"
                            className="w-full h-[35px] px-3 rounded-[10px] bg-[#f9f9f9] border border-gray-300 shadow-sm"
                            value={
                              formData.attendance[
                              item.inField as keyof typeof formData.attendance
                              ]
                            }
                            onChange={(e) =>
                              handleInputChange(
                                "attendance",
                                item.inField,
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="input-field">
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            {item.day} Out Time
                          </label>
                          <input
                            type="time"
                            className="w-full h-[35px] px-3 rounded-[10px] bg-[#f9f9f9] border border-gray-300 shadow-sm"
                            value={
                              formData.attendance[
                              item.outField as keyof typeof formData.attendance
                              ]
                            }
                            onChange={(e) =>
                              handleInputChange(
                                "attendance",
                                item.outField,
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === "deposit" && (
                  <div className="form-grid">
                    <div className="form-row">
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          placeholder="Test Bank"
                          className="w-full h-[35px] px-[12px] rounded-[10px] bg-[#f9f9f9] border border-gray-300 shadow-sm"
                          value={formData.deposit.bank_name}
                          onChange={(e) =>
                            handleInputChange(
                              "deposit",
                              "bank_name",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Branch Name
                        </label>
                        <input
                          type="text"
                          placeholder="Main Branch"
                          className="w-full h-[35px] px-[12px] rounded-[10px] bg-[#f9f9f9] border border-gray-300 shadow-sm"
                          value={formData.deposit.branch_name}
                          onChange={(e) =>
                            handleInputChange(
                              "deposit",
                              "branch_name",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Account
                        </label>
                        <input
                          type="text"
                          placeholder="1234567890"
                          className="w-full h-[35px] px-[12px] rounded-[10px] bg-[#f9f9f9] border border-gray-300 shadow-sm"
                          value={formData.deposit.account}
                          onChange={(e) =>
                            handleInputChange(
                              "deposit",
                              "account",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          IFSC
                        </label>
                        <input
                          type="text"
                          placeholder="TEST0001234"
                          className="w-full h-[35px] px-[12px] rounded-[10px] bg-[#f9f9f9] border border-gray-300 shadow-sm"
                          value={formData.deposit.ifsc}
                          onChange={(e) =>
                            handleInputChange("deposit", "ifsc", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Amount
                        </label>
                        <input
                          type="text"
                          placeholder="50000.00"
                          className="w-full h-[35px] px-[12px] rounded-[10px] bg-[#f9f9f9] border border-gray-300 shadow-sm"
                          value={formData.deposit.amount}
                          onChange={(e) =>
                            handleInputChange(
                              "deposit",
                              "amount",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="input-field">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Transfer Type
                        </label>
                        <select
                          className="w-full h-[35px] px-[14px] py-[6px] rounded-[18px] bg-[#eff7ff] text-[#393939] text-[14px] font-normal font-inter border-none outline-none shadow-[inset_0px_2px_8px_rgba(0,0,0,0.2)]"
                          value={formData.deposit.transfer_type}
                          onChange={(e) =>
                            handleInputChange(
                              "deposit",
                              "transfer_type",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Transfer Type</option>
                          <option value="Indirect">Indirect</option>
                          <option value="Direct">Direct</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center mt-8">
                  <button
                    type="submit"
                    className="px-8 py-2 rounded-full text-white font-medium transition duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-lg"
                  >
                    {isSubmitting ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default PersonalDetails;
