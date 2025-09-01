"use client";
import React from "react";

const Honeycomb: React.FC = () => {
  const items: string[] = [
    "Organization's policies, practices and procedures relating to feedback processes",
    "Considerations for data protection related to feedback collection",
    "Quality control policies and procedures of the organization",
    "Considerations for data protection related to feedback collection",
    "Types of significant accounting issues",
    "Client's business and its environment",
    "Client's business and its environment",
    "Professional standards and applicable legal and regulatory requirements",
    "Relevant methodologies and platforms used in collecting feedback",
    "Professional standards and applicable legal and regulatory requirements",
    "Types of significant accounting issues",
    "Organization's policies, practices and procedures relating to feedback processes",
    "Relevant methodologies and platforms used in collecting feedback",
  ];

  // Circle diameter
  const size = 160; // px → controls circle size
  const verticalSpacing = Math.floor(size * 0.95); // 86.6% of diameter
  const horizontalShift = Math.floor(size / 2);

  return (
    <div className="flex justify-center items-center font-sans ">
      <div className="relative">
        {items.map((text, index) => {
          const row = Math.floor(index / 4);
          const col = index % 4;

          const x = col * size + (row % 2 === 1 ? horizontalShift : 0);
          const y = row * verticalSpacing;

          return (
            <div
              key={index}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${x}px`,
                top: `${y}px`,
              }}
              className="absolute rounded-full bg-[#f6bc52] flex items-center justify-center text-center text-[11px] font-medium text-black p-3 hover:bg-[#f67232] hover:scale-110 transition duration-300"
            >
              {text}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Honeycomb;
