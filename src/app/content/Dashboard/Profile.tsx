import React from "react";
import EmployeeTable from "./EmployeeTable";

const Profile = () => {
  // Sample data
  const employees = [
    {
      id: "1",
      name: "Devanshi Vinaykumar Modi",
      email: "dmodi5956@gmail.com",
      role: "Admin",
      status: "Active" as const,
      joinDate: "November 30,2025",
      profileImage:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    },
    {
      id: "2",
      name: "Devanshi Vinaykumar Modi",
      email: "dmodi5956@gmail.com",
      role: "Admin",
      status: "Active" as const,
      joinDate: "November 30,2025",
      profileImage:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    },
    {
      id: "3",
      name: "Devanshi Vinaykumar Modi",
      email: "dmodi5956@gmail.com",
      role: "Admin",
      status: "Active" as const,
      joinDate: "November 30,2025",
      profileImage:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    },
    {
      id: "4",
      name: "Devanshi Vinaykumar Modi",
      email: "dmodi5956@gmail.com",
      role: "Admin",
      status: "Active" as const,
      joinDate: "November 30,2025",
      profileImage:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    },
    {
      id: "5",
      name: "Devanshi Vinaykumar Modi",
      email: "dmodi5956@gmail.com",
      role: "Admin",
      status: "Active" as const,
      joinDate: "November 30,2025",
      profileImage:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    },
    {
      id: "6",
      name: "Devanshi Vinaykumar Modi",
      email: "dmodi5956@gmail.com",
      role: "Admin",
      status: "Active" as const,
      joinDate: "November 30,2025",
      profileImage:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    },
    {
      id: "7",
      name: "Devanshi Vinaykumar Modi",
      email: "dmodi5956@gmail.com",
      role: "Admin",
      status: "Active" as const,
      joinDate: "November 30,2025",
      profileImage:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    },
    {
      id: "8",
      name: "Devanshi Vinaykumar Modi",
      email: "dmodi5956@gmail.com",
      role: "Admin",
      status: "Active" as const,
      joinDate: "November 30,2025",
      profileImage:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white">
      <EmployeeTable employees={employees} />
    </div>
  );
};

export default Profile;