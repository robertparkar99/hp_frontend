import React, { useState } from "react";

type SettingsState = {
  sandwichLeave: string;
  casualLeaveDays: string;
  earnedLeaveDays: string;
  halfDayType: string;
  saturdayCutoff: string;
  parentCommunication: string;
  displayAllTeachersCreating: string;
  displayAllTeachersAI: string;
  threeMonthDiscount: string;
  discountPercentage: string;
  studentNameFormat: string;
  allowPreviousYearAdmission: string;
};

const defaultState: SettingsState = {
  sandwichLeave: "No",
  casualLeaveDays: "0",
  earnedLeaveDays: "0",
  halfDayType: "On Duty Leave",
  saturdayCutoff: "0",
  parentCommunication: "Class Teacher wise",
  displayAllTeachersCreating: "No",
  displayAllTeachersAI: "Teacher wise",
  threeMonthDiscount: "No",
  discountPercentage: "0",
  studentNameFormat: "Last Name First",
  allowPreviousYearAdmission: "No",
};

export default function GeneralSettings() {
  const [state, setState] = useState<SettingsState>(defaultState);

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // For demo purposes we'll just log. Replace with API call.
    console.log("General settings saved:", state);
    alert("Settings submitted (check console)");
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-700">
          <h2 className="text-2xl md:text-3xl font-bold text-white">General Settings</h2>
          <p className="text-blue-100 mt-1">Configure your institution's general preferences</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* grid layout: label left, control right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Row 1 */}
            <div className="md:col-span-7 py-4 border-b border-gray-100">
              <span className="text-gray-700 font-medium">Are you applying for sandwich leave in your institute?</span>
            </div>
            <div className="md:col-span-5 py-4 border-b border-gray-100 flex justify-end">
              <div className="w-full md:w-3/4">
                <div className="relative">
                  <select
                    value={state.sandwichLeave}
                    onChange={(e) => update("sandwichLeave", e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                  >
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="md:col-span-7 py-4 border-b border-gray-100">
              <span className="text-gray-700 font-medium">How Many days allowed for casual leave at one time?</span>
            </div>
            <div className="md:col-span-5 py-4 border-b border-gray-100 flex justify-end">
              <div className="w-full md:w-3/4">
                <div className="relative">
                  <select
                    value={state.casualLeaveDays}
                    onChange={(e) => update("casualLeaveDays", e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                  >
                    {Array.from({ length: 11 }).map((_, i) => (
                      <option key={i}>{i}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="md:col-span-7 py-4 border-b border-gray-100">
              <span className="text-gray-700 font-medium">How Many days allowed for Earned Leave at one time?</span>
            </div>
            <div className="md:col-span-5 py-4 border-b border-gray-100 flex justify-end">
              <div className="w-full md:w-3/4">
                <div className="relative">
                  <select
                    value={state.earnedLeaveDays}
                    onChange={(e) => update("earnedLeaveDays", e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                  >
                    {Array.from({ length: 11 }).map((_, i) => (
                      <option key={i}>{i}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4 */}
            <div className="md:col-span-7 py-4 border-b border-gray-100">
              <span className="text-gray-700 font-medium">How Many days allowed for Half day Leave at one time?</span>
            </div>
            <div className="md:col-span-5 py-4 border-b border-gray-100 flex justify-end">
              <div className="w-full md:w-3/4">
                <div className="relative">
                  <select
                    value={state.halfDayType}
                    onChange={(e) => update("halfDayType", e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                  >
                    <option>select Type</option>
                    <option>On Duty Leave</option>
                    <option>Medical Half Day</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 5 */}
            <div className="md:col-span-7 py-4 border-b border-gray-100">
              <span className="text-gray-700 font-medium">HRMS. 2nd Saturday Late Arrival - Day Cutoff Policy</span>
            </div>
            <div className="md:col-span-5 py-4 border-b border-gray-100 flex justify-end">
              <div className="w-full md:w-3/4">
                <div className="relative">
                  <select
                    value={state.saturdayCutoff}
                    onChange={(e) => update("saturdayCutoff", e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                  >
                    {Array.from({ length: 11 }).map((_, i) => (
                      <option key={i}>{i}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 6 */}
            <div className="md:col-span-7 py-4 border-b border-gray-100">
              <span className="text-gray-700 font-medium">System to display parent communication class-teacher wise</span>
            </div>
            <div className="md:col-span-5 py-4 border-b border-gray-100 flex justify-end">
              <div className="w-full md:w-3/4">
                <div className="relative">
                  <select
                    value={state.parentCommunication}
                    onChange={(e) => update("parentCommunication", e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                  >
                    <option>Class Teacher wise</option>
                    <option>Admin wise</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 7 */}
            <div className="md:col-span-7 py-4 border-b border-gray-100">
              <span className="text-gray-700 font-medium">Display all teachers in creating timetable?</span>
            </div>
            <div className="md:col-span-5 py-4 border-b border-gray-100 flex justify-end">
              <div className="w-full md:w-3/4">
                <div className="relative">
                  <select
                    value={state.displayAllTeachersCreating}
                    onChange={(e) => update("displayAllTeachersCreating", e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                  >
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 8 */}
            <div className="md:col-span-7 py-4 border-b border-gray-100">
              <span className="text-gray-700 font-medium">Display all teachers in AI timetable?</span>
            </div>
            <div className="md:col-span-5 py-4 border-b border-gray-100 flex justify-end">
              <div className="w-full md:w-3/4">
                <div className="relative">
                  <select
                    value={state.displayAllTeachersAI}
                    onChange={(e) => update("displayAllTeachersAI", e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                  >
                    <option>Teacher wise</option>
                    <option>Subject wise</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 9 - Discount question with two controls */}
            <div className="md:col-span-7 py-4 border-b border-gray-100">
              <span className="text-gray-700 font-medium">If students pay 3 months fees at once, should we give a discount? And if yes, how much should we give?</span>
            </div>
            <div className="md:col-span-5 pl-28 py-4 p border-b border-gray-100 flex justify-end items-center space-x-4">
              <div className="w-1/2">
                <div className="relative">
                  Select Discount
                  <select
                    value={state.threeMonthDiscount}
                    onChange={(e) => update("threeMonthDiscount", e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                  >
                    
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="w-1/2">
                <div className="relative">
                  Discount Percentage
              <input
                type="number"
                value={state.discountPercentage}
                onChange={(e) => update("discountPercentage", e.target.value)}
                className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                min={0}
                max={100}
                placeholder="Percentage"
              />
              </div>
        </div>
            </div>

            {/* Row 10 */}
            <div className="md:col-span-7 py-4 border-b border-gray-100">
              <span className="text-gray-700 font-medium">Student Name display format</span>
            </div>
            <div className="md:col-span-5 py-4 border-b border-gray-100 flex justify-end">
              <div className="w-full md:w-3/4">
                <div className="relative">
                  <select
                    value={state.studentNameFormat}
                    onChange={(e) => update("studentNameFormat", e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                  >
                    <option>Last Name First</option>
                    <option>First Name First</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 11 */}
            <div className="md:col-span-7 py-4 border-b border-gray-100">
              <span className="text-gray-700 font-medium">Allow Previous Year Admission</span>
            </div>
            <div className="md:col-span-5 py-4 border-b border-gray-100 flex justify-end">
              <div className="w-full md:w-3/4">
                <div className="relative">
                  Select Discount
                  <select
                    value={state.allowPreviousYearAdmission}
                    onChange={(e) => update("allowPreviousYearAdmission", e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                  >
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-3 rounded-lg shadow-md transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}