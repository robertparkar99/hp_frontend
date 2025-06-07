import * as React from "react";
import {useEffect} from "react"
import { useRouter } from 'next/navigation';

export const LogoSection: React.FC = () => {
   const router = useRouter();
 useEffect(() => {
  const userData = localStorage.getItem('userData');

    if (!userData) {
      router.push('/');
    }
    // console.log(JSON.parse(localStorage.getItem('userData')).org_logo);
  }, []);

  return (
    <div className="flex">
      <div className="iconDivs flex gap-4 items-center">
      <div className="searchIcon">
        <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#3B3B3B"
        width="16"
        height="16"
        className="w-6 h-6 text-black flex"
        >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M10.5 17a6.5 6.5 0 100-13 6.5 6.5 0 000 13z"
        />
        </svg>
      </div>
      <div className="settingIcon">
        <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#3B3B3B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 text-black"
        >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 
      1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51
      1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 
      1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1.51-1 
      1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9
      a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 
      1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9
      a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </div>
      <div className="notificationIcon pr-[10]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#3B3B3B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 text-black"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      </div>
      </div>

      <div className="flex gap-2">
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/6594c4f0452823c7c1dfb5f435da421ac958fed6?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
        alt="Divider"
        className="object-contain shrink-0 w-px aspect-[0.02]"
      />
    {JSON.parse(localStorage.getItem('userData') || '{}').org_logo ? (
            <img
          src={`https://erp.triz.co.in/admin_dep/images/${JSON.parse(localStorage.getItem('userData') || '{}').org_logo}`}
          alt="Logo"
          className="object-contain shrink-0 my-auto max-w-full aspect-[2.75] w-[80px]"
            />
          ) : (
            <div
          className="flex items-center justify-center shrink-0 my-auto mt-[10px] mb-[10px] w-[100px] h-[50px] text-[#51a2ff] font-bold text-lg"
          style={{ aspectRatio: '2.75' }}
            >
          {JSON.parse(localStorage.getItem('userData') || '{}').org_user || 'User'}
            </div>
          )}
      </div>
    </div>
  );
};
