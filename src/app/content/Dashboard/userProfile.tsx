import { ArrowLeft, Plus, ChevronDown, Calendar } from "lucide-react";
// Example content of addOrgDetails.tsx
const userProfile = () => {
  return (
    <div className="w-full max-w-[1180px] min-h-[800px] relative bg-white rounded-[15px] shadow-[0px_0px_8px_0px_rgba(225,226,229,1.00)] overflow-hidden mx-auto">
      {/* Header Section */}
      <div className="w-full relative pb-[100px] md:pb-[50px] lg:pb-0 lg:h-[277px]">
        {/* Blue background */}
        <div className="w-full h-[200px] bg-[#B3D4FF]"></div>

        {/* Back button */}
        <div className="absolute left-4 sm:left-[30px] top-[20px] w-[30px] h-[30px] flex items-center justify-center">
          <ArrowLeft className="text-black" size={22} />
        </div>

        {/* Profile image */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-[35px] w-[180px] md:w-[230px] h-auto">
          <div className="w-[180px] h-[180px] md:w-[230px] md:h-[230px] mx-auto rounded-full overflow-hidden border-4 border-white">
            <img
              src="https://storage.googleapis.com/tempo-public-images/figma-exports%2Fgithub%7C180614638-1746011309228-node-950%3A997-1746011301987.png"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-10 flex items-center justify-center">
            <div className="bg-white rounded-full p-1 shadow-md">
              <Plus className="text-[#007BE5]" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="w-full px-4 md:px-6 lg:px-8 py-4 mt-16 md:mt-0">
        {/* First row */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-2 md:mb-4">
          <button className="h-10 px-3 md:px-[22px] py-[9px] bg-[#358788] rounded-lg text-white text-sm md:text-lg font-normal font-inter whitespace-nowrap">
            Personal Information
          </button>
          <button className="h-10 px-3 md:px-[22px] py-[9px] rounded-lg border border-[#007be5] text-[#007be5] text-sm md:text-lg font-normal font-inter whitespace-nowrap">
            Account & Login
          </button>
        </div>

        {/* Second row */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-2 md:mb-4">
          <button className="h-10 px-3 md:px-[22px] py-[9px] rounded-lg border border-[#007be5] text-[#007be5] text-sm md:text-lg font-normal font-inter whitespace-nowrap">
            Educational Details
          </button>
          <button className="h-10 px-3 md:px-[22px] py-[9px] rounded-lg border border-[#007be5] text-[#007be5] text-sm md:text-lg font-normal font-inter whitespace-nowrap">
            Job & Department
          </button>
          <button className="h-10 px-3 md:px-[22px] py-[9px] rounded-lg border border-[#007be5] text-[#007be5] text-sm md:text-lg font-normal font-inter whitespace-nowrap">
            Employment
          </button>
          <button className="h-10 px-3 md:px-[22px] py-[9px] rounded-lg border border-[#007be5] text-[#007be5] text-sm md:text-lg font-normal font-inter whitespace-nowrap">
            Leave
          </button>
        </div>

        {/* Third row */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          <button className="h-10 px-3 md:px-[22px] py-[9px] rounded-lg border border-[#007be5] text-[#007be5] text-sm md:text-lg font-normal font-inter whitespace-nowrap">
            Payroll
          </button>
          <button className="h-10 px-3 md:px-[22px] py-[9px] rounded-lg border border-[#007be5] text-[#007be5] text-sm md:text-lg font-normal font-inter whitespace-nowrap">
            Academic
          </button>
          <button className="h-10 px-3 md:px-[22px] py-[9px] rounded-lg border border-[#007be5] text-[#007be5] text-sm md:text-lg font-normal font-inter whitespace-nowrap">
            Attendance
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="w-full px-4 md:px-8 lg:px-16 py-6 md:py-8">
        {/* User Name */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center">
            <label className="text-[#393939] text-base md:text-lg font-normal font-inter mb-2 md:mb-0 md:w-[250px]">
              User Name :
            </label>
            <div className="w-full md:w-[450px] h-10 pl-[30px] pr-[30px] py-[9px] bg-white rounded-lg shadow-[inset_4px_4px_4px_0px_rgba(71,160,255,0.45)] border border-[#47a0ff] flex items-center">
              <input
                type="text"
                placeholder="Enter Your Full Name"
                className="w-full text-[#686868] text-base md:text-lg font-normal font-inter bg-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Gender */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center">
            <label className="text-[#393939] text-base md:text-lg font-normal font-inter mb-2 md:mb-0 md:w-[250px]">
              Gender:
            </label>
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <span className="text-[#393939] text-base md:text-lg font-normal font-inter">
                  Male
                </span>
                <div className="w-[30px] h-[30px] bg-[#d9d9d9] rounded-[5px]"></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#393939] text-base md:text-lg font-normal font-inter">
                  Female
                </span>
                <div className="w-[30px] h-[30px] bg-[#d9d9d9] rounded-[5px]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Date of Birth */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center">
            <label className="text-[#393939] text-base md:text-lg font-normal font-inter mb-2 md:mb-0 md:w-[250px]">
              Date Of Birth:
            </label>
            <div className="w-full md:w-[350px] h-10 pl-[30px] pr-[13px] py-2 bg-white rounded-lg shadow-[inset_4px_4px_4px_0px_rgba(71,160,255,0.45)] border border-[#47a0ff] flex justify-between items-center">
              <input
                type="text"
                placeholder="Enter Your Date Of Birth"
                className="w-full text-[#686868] text-base md:text-lg font-normal font-inter bg-transparent outline-none"
              />
              <Calendar size={18} className="text-[#686868] flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Mobile Number */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center">
            <label className="text-[#393939] text-base md:text-lg font-normal font-inter mb-2 md:mb-0 md:w-[250px]">
              Mobile Number:
            </label>
            <div className="w-full md:w-[450px] h-10 pl-[30px] pr-[30px] py-[9px] bg-white rounded-lg shadow-[inset_4px_4px_4px_0px_rgba(71,160,255,0.45)] border border-[#47a0ff] flex items-center">
              <input
                type="text"
                placeholder="Enter Your Mobile Number"
                className="w-full text-[#686868] text-base md:text-lg font-normal font-inter bg-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Email Address */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center">
            <label className="text-[#393939] text-base md:text-lg font-normal font-inter mb-2 md:mb-0 md:w-[250px]">
              Email Address:
            </label>
            <div className="w-full md:w-[450px] h-10 pl-[30px] pr-[30px] py-[9px] bg-white rounded-lg shadow-[inset_4px_4px_4px_0px_rgba(71,160,255,0.45)] border border-[#47a0ff] flex items-center">
              <input
                type="email"
                placeholder="Enter Your Email Address"
                className="w-full text-[#686868] text-base md:text-lg font-normal font-inter bg-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center">
            <label className="text-[#393939] text-base md:text-lg font-normal font-inter mb-2 md:mb-0 md:w-[250px]">
              Address:
            </label>
            <div className="w-full md:w-[450px] h-10 pl-[30px] pr-[30px] py-[9px] bg-white rounded-lg shadow-[inset_4px_4px_4px_0px_rgba(71,160,255,0.45)] border border-[#47a0ff] flex items-center">
              <input
                type="text"
                placeholder="Enter Your Address"
                className="w-full text-[#686868] text-base md:text-lg font-normal font-inter bg-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* State, City, Pincode */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div>
            <label className="block text-[#393939] text-base md:text-lg font-normal font-inter mb-2">
              State:
            </label>
            <div className="w-full h-10 pl-5 pr-5 py-[9px] bg-white rounded-lg shadow-[inset_4px_4px_4px_0px_rgba(71,160,255,0.45)] border border-[#47a0ff] flex items-center">
              <select className="w-full text-[#686868] text-base md:text-lg font-normal font-inter bg-transparent outline-none appearance-none">
                <option value="" disabled selected>
                  Select State
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#393939] text-base md:text-lg font-normal font-inter mb-2">
              City:
            </label>
            <div className="w-full h-10 pl-5 pr-5 py-[9px] bg-white rounded-lg shadow-[inset_4px_4px_4px_0px_rgba(71,160,255,0.45)] border border-[#47a0ff] flex items-center">
              <select className="w-full text-[#686868] text-base md:text-lg font-normal font-inter bg-transparent outline-none appearance-none">
                <option value="" disabled selected>
                  Select City
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#393939] text-base md:text-lg font-normal font-inter mb-2">
              Pincode:
            </label>
            <div className="w-full h-10 pl-5 pr-5 py-[9px] bg-white rounded-lg shadow-[inset_4px_4px_4px_0px_rgba(71,160,255,0.45)] border border-[#47a0ff] flex items-center">
              <input
                type="text"
                placeholder="Add Pincode"
                className="w-full text-[#686868] text-base md:text-lg font-normal font-inter bg-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button className="px-8 py-2 bg-[#007be5] rounded-[10px] text-white text-xl md:text-[28px] font-normal font-inter hover:bg-[#0069c2] transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
export default userProfile;
