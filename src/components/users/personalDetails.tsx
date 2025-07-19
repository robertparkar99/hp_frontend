import React from "react";

const ProfileInterface: React.FC = () => {
  return (
    <div className="relative w-full max-w-[1360px] mx-auto">
      {/* Header with Bottom-Left Circular Cutout */}
      <div className="relative w-full h-[220px] overflow-hidden rounded-2xl shadow-lg">
        <svg
          viewBox="0 0 1360 220"
          className="absolute top-0 left-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <clipPath id="circleNotchClip">
              <path
                d="
                  M0,0 
                  H1360 
                  V220 
                  H220 
                  A110,110 0 0 0 0,220 
                  Z
                "
              />
            </clipPath>
            <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#C9E3FF" />
              <stop offset="100%" stopColor="#47A0FF" />
            </linearGradient>
          </defs>

          <rect
            width="100%"
            height="100%"
            fill="url(#grad)"
            clipPath="url(#circleNotchClip)"
            rx="30"
          />
        </svg>
      </div>

      {/* Profile Image Positioned in Bottom-Left Cutout */}
      <div
        className="absolute"
        style={{
          top: "70px",
          left: "40px",
          width: "220px",
          height: "220px",
        }}
      >
        <div className="w-full h-full rounded-full border-[6px] border-white shadow-2xl overflow-hidden bg-white">
          <img
            src="https://images.unsplash.com/photo-1494790108755-2616b612b882?w=400&h=400&fit=crop&crop=face"
            alt="Kavya Mehta"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Name + Line beside Image */}
      <div
        className="absolute"
        style={{
          top: "60px",
          left: "260px",
          right: "60px",
        }}
      >
        <h1 className="text-[48px] font-bold text-gray-800 mb-4">Kavya Mehta</h1>
        <div className="w-full h-[4px] bg-gray-800 rounded-full" />
      </div>
    </div>
  );
};

export default ProfileInterface;
