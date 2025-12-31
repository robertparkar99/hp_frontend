import React, { useState } from "react";

// Define proper types for your data
interface AttributeItem {
  attribute_name?: string;
  attribute_overall_description?: string;
}

interface LorData {
  level?: string;
  guiding_phrase?: string;
  essence_level?: string;
  guidance_note?: string;
  Attributes?: Record<string, AttributeItem>;
  Business_skills?: Record<string, AttributeItem>;
}

export interface SelLORProps {
  SelLOR?: LorData | {};
}

export default function Index({ SelLOR }: SelLORProps) {
  const [activeSection, setActiveSection] = useState("description");

  const sections = [
    {
      imgSrc:
        "https://api.builder.io/api/v1/image/assets/TEMP/d6d290e6a7986c684c6a843ce15c54a1a37b52a2?width=160",
      alt: "Web Note",
      title: "Description / Guidance Note",
      key: "description",
    },
    {
      imgSrc:
        "https://api.builder.io/api/v1/image/assets/TEMP/cb3ba31210d3bc25572fe2feb15e8134bdbc4c2b?width=200",
      alt: "Leadership Graph",
      title: "Responsibility Attributes",
      key: "responsibility",
    },
    {
      imgSrc:
        "https://api.builder.io/api/v1/image/assets/TEMP/b3bc12a9b36725a87b7dc72b84e00bea75fba507?width=186",
      alt: "Team Business Skills",
      title: "Business Skills / Behavioral Factors",
      key: "business",
    },
  ];

  const dataLor: LorData = SelLOR || {};

   const cleanText = (text?: string) => text?.replace(/in SFIA/g, "").trim() || "";

  const descriptionCards = [
    {
      title: "Description",
      text: cleanText(dataLor?.essence_level),
    },
    {
      title: "Guidance notes",
      text: cleanText(dataLor?.guidance_note),
    },
  ].filter((card) => card.text && card.text.trim() !== ""); // ✅ filter out empty

  return (
    <div className="w-full flex flex-col items-center space-y-8 px-4 py-8">
      {/* TOP SELECTION TABS */}
      <div className="w-full max-w-6xl mx-auto">
        <div
          className="rounded-2xl border-2 border-blue-500/80 bg-[#f6faff] shadow-lg backdrop-blur-lg"
          style={{
            boxShadow: "2px 3px 8px 6px rgba(193, 193, 193, 0.25)",
          }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center text-center px-6 md:px-8 py-5 space-y-10 md:space-y-0">
            {sections.map((section, i) => (
              <React.Fragment key={i}>
                <div
                  onClick={() => setActiveSection(section.key)}
                  className={`flex flex-col items-center space-y-3 px-4 cursor-pointer transition-transform hover:scale-105 ${
                    activeSection === section.key ? "scale-105" : ""
                  }`}
                >
                  <img
                    src={section.imgSrc}
                    alt={section.alt}
                    className="w-20 h-20 object-contain"
                  />
                  <h3 className="text-[#1f2e4c] font-semibold text-base md:text-lg">
                    {section.title}
                  </h3>
                </div>
                {i < sections.length - 1 && (
                  <div className="hidden md:block h-32 w-[4px] bg-blue-400 rounded-full" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* LEVEL BADGE shown in ALL sections */}
        {["description", "responsibility", "business"].includes(
          activeSection
        ) && (
          <div
            className="rounded-2xl border-2 border-[#A4D0FF] flex items-center justify-start px-4 py-2 mt-6 shadow-sm"
            style={{
              background:
                "linear-gradient(90deg, #0575E6 0%, #56AAFF 50%, #0575E6 100%)",
                width: "fit-content",
            }}
          >
            <span className="text-white font-bold text-3xl font-roboto">
              Level {dataLor?.level}: {cleanText(dataLor?.guiding_phrase)}
            </span>
          </div>
        )}
      </div>

      {/* DESCRIPTION SECTION */}
      {/* DESCRIPTION SECTION */}
{activeSection === "description" && (
  <div className="w-full max-w-6xl mx-auto mt-6 px-4">
    <div className="grid grid-cols-2 gap-6">
      {descriptionCards.map((card, index) => (
        <div
          key={index}
          className="relative w-full h-[300px] rounded-[18px] overflow-hidden text-justify"
        >
          {/* Background */}
          <div
            className="absolute inset-0 rounded-[16px] border-2 border-[#94BEFF]"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(71,160,255,0.35) 100%)",
              backdropFilter: "blur(2px)",
            }}
          />

          {/* Title */}
          <h3 className="relative mt-7 ml-5 text-[24px] font-bold text-[#0043CE] opacity-80">
            {card.title}
          </h3>

          {/* Divider */}
          <svg
            className="relative mt-2 ml-5 w-[90%] h-[12px]"
            viewBox="0 0 550 12"
          >
            <path
              d="M0.666667 6C0.666667 8.94552 3.05448 11.3333 6 11.3333C8.94552 11.3333 11.3333 8.94552 11.3333 6C11.3333 3.05448 8.94552 0.666667 6 0.666667C3.05448 0.666667 0.666667 3.05448 0.666667 6ZM540 7C540.552 7 541 6.55228 541 6C541 5.44772 540.552 5 540 5V7ZM6 6V7H540V6V5H6V6Z"
              fill="#A1A1A1"
            />
          </svg>

          {/* Content */}
          <div className="relative m-5 h-[150px] text-[15px] text-black whitespace-pre-line overflow-y-auto pr-2 hide-scrollbar">
            {card.text}
          </div>
        </div>
      ))}
    </div>
  </div>
)}


      {/* RESPONSIBILITY SECTION */}
      {activeSection === "responsibility" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl px-4 mt-4">
          {dataLor?.Attributes &&
            Object.entries(dataLor.Attributes)
              .filter(([_, item]) => cleanText(item?.attribute_overall_description)?.trim())
              .map(([key, item]: [string, AttributeItem]) => (
                <div
                  key={key}
                  className="bg-white border-2 border-blue-200 p-6 rounded-xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 duration-300"
                  style={{ height: "fit-content" }} // 👈 fit content
                >
                  <h3 className="inline-block bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-md mb-3 text-base">
                    {item.attribute_name || key}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                    {cleanText(item.attribute_overall_description)}
                  </p>
                </div>
              ))}
        </div>
      )}

      {/* BUSINESS SKILLS SECTION */}
      {activeSection === "business" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl px-4 mt-4">
          {dataLor?.Business_skills &&
            Object.entries(dataLor.Business_skills)
              .filter(([_, item]) => cleanText(item?.attribute_overall_description)?.trim())
              .map(([key, item]: [string, AttributeItem]) => (
                <div
                  key={key}
                  className="bg-white border-2 border-blue-200 p-6 rounded-xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 duration-300"
                  style={{ height: "fit-content" }} // 👈 fit content
                >
                  <h3 className="inline-block bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-md mb-3 text-base">
                    {item.attribute_name || key}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                    {cleanText(item.attribute_overall_description)}
                  </p>
                </div>
              ))}
        </div>
      )}
    </div>
  );
}