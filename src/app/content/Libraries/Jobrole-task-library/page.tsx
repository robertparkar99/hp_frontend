"use client";
import React from "react";

const CriticalWorkFunctionGrid = () => {
  const cardData = {
    title: "General critical work function",
    description:
      "Schedule appointments for sales representatives to meet with prospective customers or for customers to attend sales presentations.",
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="relative group overflow-hidden rounded-3xl shadow-lg border-2 border-blue-200 hover:border-blue-300 transition-all duration-300"
          >
            {/* Animated sweeping circle */}
            <div className="absolute z-[10] right-0 bottom-0 w-[1px] h-[1px] bg-[#B7DAFF] rounded-[0px_50px_0px_15px] transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:rounded-[15px] group-hover:opacity-[0.5]"></div>

            {/* Content */}
            <div className="relative z-10 p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                {cardData.title}
              </h3>

              {/* Decorative line */}
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="flex-1 h-0.5 bg-gray-300"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>

              <p className="text-gray-700 text-sm leading-relaxed">
                {cardData.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CriticalWorkFunctionGrid;
