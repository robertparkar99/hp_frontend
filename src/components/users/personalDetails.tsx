"use client";

import React, { useEffect, useState, useMemo } from 'react';


const personalDetails: React.FC = () => {

    // New states for table control
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(100);

    return (
        <div className='bg-[#fff] mx-2 rounded-sm'>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name Suffix</label>
                    <select name="nameSuffix" className="block w-full inset-shadow-sm inset-shadow-[#9ccdf7] border-[#9ccdf7] px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option>Mr.</option>
                        <option>Ms.</option>
                        <option>Mrs.</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input type="text" name="firstName" value="Employee" className="mt-1 inset-shadow-sm inset-shadow-[#9ccdf7] border-[#9ccdf7] block w-full px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                    <input type="text" name="middleName" value="System" className="mt-1 inset-shadow-sm inset-shadow-[#9ccdf7] border-[#9ccdf7] block w-full px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input type="text" name="lastName" value="User" className="mt-1 inset-shadow-sm inset-shadow-[#9ccdf7] border-[#9ccdf7] block w-full px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
                    <input type="text" name="userName" value="employee@triz.co.in" className="mt-1 inset-shadow-sm inset-shadow-[#9ccdf7] border-[#9ccdf7] block w-full px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" value="employee@triz.co.in" className="mt-1 inset-shadow-sm inset-shadow-[#9ccdf7] border-[#9ccdf7] block w-full px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                    <input type="text" name="mobile" value="9876543210" className="mt-1 inset-shadow-sm inset-shadow-[#9ccdf7] border-[#9ccdf7] block w-full px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
                    <select name="jobRole" className="block w-full inset-shadow-sm inset-shadow-[#9ccdf7] border-[#9ccdf7] px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option>Quantitative Trader</option>
                        <option>Software Engineer</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level of Responsibility</label>
                    <select name="responsibilityLevel" className="block w-full inset-shadow-sm inset-shadow-[#9ccdf7] border-[#9ccdf7] px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option>4 Enable</option>
                        <option>Manager</option>
                    </select>
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <div className="flex space-x-4">
                        <div className="flex items-center">
                            <input name="gender" type="radio" checked className="focus:ring-blue-500 h-4 w-4 text-blue-600 " />
                            <span className="ml-2 block text-sm text-gray-900">Male</span>
                        </div>
                        <div className="flex items-center">
                            <input name="gender" type="radio" className="focus:ring-blue-500 h-4 w-4 text-blue-600 " />
                            <span className="ml-2 block text-sm text-gray-900">Female</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">user_address</label>
                    <input type="text" name="userAddress" value="123 Admin Street" className="mt-1 inset-shadow-sm inset-shadow-[#9ccdf7] border-[#9ccdf7] block w-full px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">user_city</label>
                    <input type="text" name="userCity" value="AdminState" className="mt-1 inset-shadow-sm inset-shadow-[#9ccdf7] border-[#9ccdf7] block w-full px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">user_state</label>
                    <input type="text" name="userState" value="AdminCity" className="mt-1 inset-shadow-sm inset-shadow-[#9ccdf7] border-[#9ccdf7] block w-full px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">user_pincode</label>
                    <input type="text" name="userPincode" value="123456" className="mt-1 inset-shadow-sm inset-shadow-[#9ccdf7] border-[#9ccdf7] block w-full px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User Profile</label>
                    <select name="userProfile" className="block w-full inset-shadow-sm inset-shadow-[#9ccdf7] border-[#9ccdf7] px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option>Employee</option>
                        <option>Admin</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Join Year</label>
                    <input type="text" name="joinYear" value="2020" className="mt-1 inset-shadow-sm inset-shadow-[#9ccdf7] border-[#9ccdf7] block w-full px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" name="password" value="*****" className="mt-1 inset-shadow-sm inset-shadow-[#9ccdf7] border-[#9ccdf7] block w-full px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Birthdate</label>
                    <input type="text" name="birthdate" value="01/01/1990" className="mt-1 inset-shadow-sm inset-shadow-[#9ccdf7] border-[#9ccdf7] block w-full px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inactive Status</label>
                    <select name="inactiveStatus" className="block w-full inset-shadow-sm inset-shadow-[#9ccdf7] border-[#9ccdf7] px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option>No</option>
                        <option>Yes</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User Image</label>
                    <div className="flex items-center space-x-2">
                        <input type="file" name="userImage" className="w-[150px] inset-shadow-sm inset-shadow-[#9ccdf7] border-[#9ccdf7] inline-flex items-center px-4 py-2 border  rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer" />
                       
                        <span className="text-sm text-gray-500">No file chosen</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <select name="jobTitle" className="block w-full inset-shadow-sm inset-shadow-[#9ccdf7] border-[#9ccdf7] px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option>Select Title</option>
                    </select>
                </div>

            </div>
        </div>
    )
};

export default personalDetails;