'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'
import { useEffect } from 'react'
// import userProfile from './user profile' // Ensure this file exists in the same directory



const topRowButtons = [
  { id: 1, text: 'Personal Information' },
  { id: 2, text: 'Account & Login Credentials' },
]

const middleRowButtons = [
  { id: 1, text: 'Educational & Qualification Details' },
  { id: 2, text: 'Job & Department Details' },
  { id: 3, text: 'Employment Lifecycle' },
  { id: 4, text: 'Leave Management' },
]

const bottomRowButtons = [
  { id: 1, text: 'Payroll & Financial Details' },
  { id: 2, text: 'Academic & Subject Allocation' },
  { id: 3, text: 'Attendance & Shift Timing' },
]

export default function EditProfilePage() {
    useEffect(() => {
            (window as any).__currentMainMenu = "Edit Profile";
            window.dispatchEvent(
              new CustomEvent("mainMenuSelected", { detail: "Edit Profile" })
            );
          }, []);
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="w-full bg-white">
      <div className="max-w-[1180px] mx-auto bg-white rounded-[15px] shadow-[0px_0px_8px_0px_rgba(225,226,229,1.00)] overflow-hidden">
        {/* Blue header with back button */}
        <div className="relative bg-[#47A0FF] h-20">
          <button
            onClick={handleGoBack}
            className="absolute top-4 left-4 text-black"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        {/* Profile image positioned overlapping the blue background */}
        <div className="flex justify-center -mt-16 mb-12 relative z-10">

            <Image
              src="/dashboard/image2.png"
              alt="Profile"
              fill
              className="rounded-full object-cover border-[4px] border-white"
            />
            <button
              className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white border border-gray-300 rounded-full p-1"
              aria-label="Add profile picture"
            >
              <Plus size={20} className="text-[#007be5]" />
            </button>
          </div>
        </div>

        {/* Button Rows */}
        <div className="flex justify-center flex-wrap gap-3 px-2 mb-4">
          {topRowButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => {
                console.log("Button clicked:", btn.text);
                const menu = "userProfile";
                (window as any).__currentMenuItem = menu;
                window.dispatchEvent(new CustomEvent("menuSelected", { detail: menu }));
              }}
              className="px-2 py-1 border border-[#007be5] text-[#007be5] rounded-full bg-white text-sm"
            >
              {btn.text}
            </button>
          ))}
        </div>

        <div className="flex justify-center flex-wrap gap-3 px-2 mb-4">
          {middleRowButtons.map((btn) => (
            <button
              key={btn.id}
              className="px-2 py-1 border border-[#007be5] text-[#007be5] rounded-full bg-white text-sm"
            >
              {btn.text}
            </button>
          ))}
        </div>

        <div className="flex justify-center flex-wrap gap-4 px-4 mb-6">
          {bottomRowButtons.map((btn) => (
            <button
              key={btn.id}
              className="px-2 py-1 border border-[#007be5] text-[#007be5] rounded-full bg-white text-sm"
            >
              {btn.text}
            </button>
          ))}
        </div>

        {/* Divider */}
      <div className="w-full h-[1px] bg-gray-300 mt-2" />
    </div>
  )
}
