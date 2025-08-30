// import React, { useState } from "react";

// // Define proper types for your data
// interface AttributeItem {
//   attribute_name?: string;
//   attribute_overall_description?: string;
// }

// interface LorData {
//   level?: string;
//   guiding_phrase?: string;
//   essence_level?: string;
//   guidance_note?: string;
//   Attributes?: Record<string, AttributeItem>;
//   Business_skills?: Record<string, AttributeItem>;
// }

// export interface SelLORProps {
//   SelLOR?: LorData | {};
// }

// export default function Index({ SelLOR }: SelLORProps) {
//   const [activeSection, setActiveSection] = useState("description");

//   const sections = [
//     {
//       imgSrc:
//         "https://api.builder.io/api/v1/image/assets/TEMP/d6d290e6a7986c684c6a843ce15c54a1a37b52a2?width=160",
//       alt: "Web Note",
//       title: "Description / Guidance Note",
//       key: "description",
//     },
//     {
//       imgSrc:
//         "https://api.builder.io/api/v1/image/assets/TEMP/cb3ba31210d3bc25572fe2feb15e8134bdbc4c2b?width=200",
//       alt: "Leadership Graph",
//       title: "Responsibility Attributes",
//       key: "responsibility",
//     },
//     {
//       imgSrc:
//         "https://api.builder.io/api/v1/image/assets/TEMP/b3bc12a9b36725a87b7dc72b84e00bea75fba507?width=186",
//       alt: "Team Business Skills",
//       title: "Business Skills / Behavioral Factors",
//       key: "business",
//     },
//   ];

//   const dataLor: LorData = SelLOR || {};

//   const descriptionCards = [
//     {
//       title: "Description",
//       text: dataLor?.essence_level,
//     },
//     {
//       title: "Guidance notes",
//       text: dataLor?.guidance_note,
//     },
//   ].filter((card) => card.text && card.text.trim() !== ""); // ✅ filter out empty

//   return (
//     <div className="w-full flex flex-col items-center space-y-8 px-4 py-8">
//       {/* TOP SELECTION TABS */}
//       <div className="w-full max-w-6xl mx-auto">
//         <div
//           className="rounded-2xl border-4 border-blue-500/80 bg-[#f6faff] shadow-lg backdrop-blur-lg"
//           style={{
//             boxShadow: "2px 3px 8px 6px rgba(193, 193, 193, 0.25)",
//           }}
//         >
//           <div className="flex flex-col md:flex-row justify-between items-center text-center px-6 md:px-8 py-5 space-y-10 md:space-y-0">
//             {sections.map((section, i) => (
//               <React.Fragment key={i}>
//                 <div
//                   onClick={() => setActiveSection(section.key)}
//                   className={`flex flex-col items-center space-y-3 px-4 cursor-pointer transition-transform hover:scale-105 ${
//                     activeSection === section.key ? "scale-105" : ""
//                   }`}
//                 >
//                   <img
//                     src={section.imgSrc}
//                     alt={section.alt}
//                     className="w-20 h-20 object-contain"
//                   />
//                   <h3 className="text-[#1f2e4c] font-semibold text-base md:text-lg">
//                     {section.title}
//                   </h3>
//                 </div>
//                 {i < sections.length - 1 && (
//                   <div className="hidden md:block h-32 w-[4px] bg-blue-400 rounded-full" />
//                 )}
//               </React.Fragment>
//             ))}
//           </div>
//         </div>

//         {/* LEVEL BADGE for Description */}
//         {activeSection === "description" && (
//           <div
//             className="w-120 max-w-xl h-24 md:h-14 rounded-2xl border-4 border-[#A4D0FF] flex items-center justify-start px-6 mt-6 shadow-sm"
//             style={{
//               background:
//                 "linear-gradient(90deg, #0575E6 0%, #56AAFF 50%, #0575E6 100%)",
//             }}
//           >
//             <span className="text-white font-bold text-3xl font-roboto">
//               Level {dataLor?.level}: {dataLor?.guiding_phrase}
//             </span>
//           </div>
//         )}
//       </div>

//       {/* DESCRIPTION SECTION */}
//       {/* {activeSection === "description" && (
//   <div className="flex justify-around w-full gap-10 mt-6">
//     {descriptionCards.map((card, index) => {
//       const marginTop = index === 1 ? "-123px" : "0px";
//       const wordCount = card.text?.split(/\s+/).length || 0;
//       const isLong = false;//  wordCount > 500;
      
//       return (
//         <div
//           key={index}
//           className="relative"
//           style={{
//             width: "480px",
//             height:  isLong ? "490px" : "fit-content", // 👈 height condition
//             borderRadius: "18px",
//             marginTop,
//             overflow: isLong ? "scroll" : "visible", // clip inner, scroll only text
//           }}
//         >
//             <div
//               className="absolute inset-0 "
//               style={{
//                 borderRadius: "16px",
//                 border: "4px solid #94BEFF",
//                 background:
//                   "linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(71,160,255,0.35) 100%)",
//                 backdropFilter: "blur(2px)",
//               }}
//             />
//           <h3
//             style={{
//               position: "relative",
//               marginTop: "30px",
//               marginLeft: "50px",
//               fontSize: "28px",
//               fontWeight: "700",
//               fontFamily: "Inter, sans-serif",
//               color: "#0043CE",
//               opacity: 0.8,
//             }}
//           >
//             {card.title}
//           </h3>
//           <svg
//             style={{
//               position: "relative",
//               marginTop: "20px",
//               marginLeft: "34px",
//               width: "430px",
//               height: "12px",
//             }}
//             viewBox="0 0 550 12"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               d="M0.666667 6C0.666667 8.94552 3.05448 11.3333 6 11.3333C8.94552 11.3333 11.3333 8.94552 11.3333 6C11.3333 3.05448 8.94552 0.666667 6 0.666667C3.05448 0.666667 0.666667 3.05448 0.666667 6ZM540 7C540.552 7 541 6.55228 541 6C541 5.44772 540.552 5 540 5V7ZM6 6V7H540V6V5H6V6Z"
//               fill="#A1A1A1"
//             />
//           </svg>
//           <p
//             style={{
//               position: "relative",
//               marginTop: "20px",
//               marginLeft: "50px",
//               marginBottom: "30px",
//               width: "400px",
//               fontSize: "15px",
//               fontFamily: "Inter, sans-serif",
//               color: "#000",
//               whiteSpace: "pre-line",
//               maxHeight: isLong ? "400px" : "none", // 👈 ensure scrolling text area fits inside
//               overflowY: isLong ? "auto" : "visible", // 👈 enable scroll only for long text
//               paddingRight: isLong ? "10px" : "0px", // avoid scrollbar overlap
//             }}
//           >
//             {card.text}
//           </p>
//         </div>
//       );
//     })}
//   </div>
// )} */}

// {/* DESCRIPTION SECTION */}
// {activeSection === "description" && (
//   <div className="flex justify-around w-full gap-2 mt-6 flex-wrap">
//     {descriptionCards.map((card, index) => (
//       <div
//         key={index}
//         className="relative"
//         style={{
//           width: "500px",
//           height: "300px", // 👈 fixed equal height
//           borderRadius: "18px",
//           overflow: "hidden", // prevent outer expansion
//         textAlign: "justify", // ensure text is justified
//         }}
//       >
//         {/* Decorative background */}
//         <div
//           className="absolute inset-0"
//           style={{
//             borderRadius: "16px",
//             border: "4px solid #94BEFF",
//             background:
//               "linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(71,160,255,0.35) 100%)",
//             backdropFilter: "blur(2px)",
//           }}
//         />

//         {/* Title */}
//         <h3
//           style={{
//             position: "relative",
//             margin: "30px 0px 0px 20px",
//             fontSize: "28px",
//             fontWeight: "700",
//             fontFamily: "Inter, sans-serif",
//             color: "#0043CE",
//             opacity: 0.8,
//           }}
//         >
//           {card.title}
//         </h3>

//         {/* Divider */}
//         <svg
//           style={{
//             position: "relative",
//             marginTop: "10px",
//             marginLeft: "22px",
//             width: "460px",
//             height: "12px",
//           }}
//           viewBox="0 0 550 12"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <path
//             d="M0.666667 6C0.666667 8.94552 3.05448 11.3333 6 11.3333C8.94552 11.3333 11.3333 8.94552 11.3333 6C11.3333 3.05448 8.94552 0.666667 6 0.666667C3.05448 0.666667 0.666667 3.05448 0.666667 6ZM540 7C540.552 7 541 6.55228 541 6C541 5.44772 540.552 5 540 5V7ZM6 6V7H540V6V5H6V6Z"
//             fill="#A1A1A1"
//           />
//         </svg>

//         {/* Scrollable content */}
//         <div
//           style={{
//             position: "relative",
//             margin: "20px",
//             width: "460px",
//             height: "150px", // 👈 area for scroll
//             fontSize: "15px",
//             fontFamily: "Inter, sans-serif",
//             color: "#000",
//             whiteSpace: "pre-line",
//             overflowY: "auto", // 👈 scrolling enabled
//             paddingRight: "10px",
//           }}
//           className="hide-scrollbar" // 👈 custom class to hide scrollbar
//         >
//           {card.text}
//         </div>
//       </div>
//     ))}
//   </div>
// )}


//       {/* RESPONSIBILITY SECTION */}
//       {activeSection === "responsibility" && (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl px-4 mt-4">
//           {dataLor?.Attributes &&
//             Object.entries(dataLor.Attributes)
//               .filter(([_, item]) => item?.attribute_overall_description?.trim()) // ✅ filter empty
//               .map(([key, item]: [string, AttributeItem]) => (
//                 <div
//                   key={key}
//                   className="bg-white border-2 border-blue-200 p-6 rounded-xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 duration-300"
//                 >
//                   <h3 className="inline-block bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-md mb-3 text-base">
//                     {item.attribute_name || key}
//                   </h3>
//                   <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
//                     {item.attribute_overall_description}
//                   </p>
//                 </div>
//               ))}
//         </div>
//       )}

//       {/* BUSINESS SKILLS SECTION */}
//       {activeSection === "business" && (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl px-4 mt-4">
//           {dataLor?.Business_skills &&
//             Object.entries(dataLor.Business_skills)
//               .filter(([_, item]) => item?.attribute_overall_description?.trim()) // ✅ filter empty
//               .map(([key, item]: [string, AttributeItem]) => (
//                 <div
//                   key={key}
//                   className="bg-white border-2 border-blue-200 p-6 rounded-xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 duration-300"
//                 >
//                   <h3 className="inline-block bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-md mb-3 text-base">
//                     {item.attribute_name || key}
//                   </h3>
//                   <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
//                     {item.attribute_overall_description}
//                   </p>
//                 </div>
//               ))}
//         </div>
//       )}
//     </div>
//   );
// }

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

  const descriptionCards = [
    {
      title: "Description",
      text: dataLor?.essence_level,
    },
    {
      title: "Guidance notes",
      text: dataLor?.guidance_note,
    },
  ].filter((card) => card.text && card.text.trim() !== ""); // ✅ filter out empty

  return (
    <div className="w-full flex flex-col items-center space-y-8 px-4 py-8">
      {/* TOP SELECTION TABS */}
      <div className="w-full max-w-6xl mx-auto">
        <div
          className="rounded-2xl border-4 border-blue-500/80 bg-[#f6faff] shadow-lg backdrop-blur-lg"
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
            className="w-120 max-w-xl h-24 md:h-14 rounded-2xl border-4 border-[#A4D0FF] flex items-center justify-start px-6 mt-6 shadow-sm"
            style={{
              background:
                "linear-gradient(90deg, #0575E6 0%, #56AAFF 50%, #0575E6 100%)",
                width: "fit-content",
            }}
          >
            <span className="text-white font-bold text-3xl font-roboto">
              Level {dataLor?.level}: {dataLor?.guiding_phrase}
            </span>
          </div>
        )}
      </div>

      {/* DESCRIPTION SECTION */}
      {activeSection === "description" && (
        <div className="flex justify-around w-full gap-2 mt-6 flex-wrap">
          {descriptionCards.map((card, index) => (
            <div
              key={index}
              className="relative"
              style={{
                width: "500px",
                height: "300px",
                borderRadius: "18px",
                overflow: "hidden",
                textAlign: "justify",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  borderRadius: "16px",
                  border: "4px solid #94BEFF",
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(71,160,255,0.35) 100%)",
                  backdropFilter: "blur(2px)",
                }}
              />

              <h3
                style={{
                  position: "relative",
                  margin: "30px 0px 0px 20px",
                  fontSize: "28px",
                  fontWeight: "700",
                  fontFamily: "Inter, sans-serif",
                  color: "#0043CE",
                  opacity: 0.8,
                }}
              >
                {card.title}
              </h3>

              <svg
                style={{
                  position: "relative",
                  marginTop: "10px",
                  marginLeft: "22px",
                  width: "460px",
                  height: "12px",
                }}
                viewBox="0 0 550 12"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.666667 6C0.666667 8.94552 3.05448 11.3333 6 11.3333C8.94552 11.3333 11.3333 8.94552 11.3333 6C11.3333 3.05448 8.94552 0.666667 6 0.666667C3.05448 0.666667 0.666667 3.05448 0.666667 6ZM540 7C540.552 7 541 6.55228 541 6C541 5.44772 540.552 5 540 5V7ZM6 6V7H540V6V5H6V6Z"
                  fill="#A1A1A1"
                />
              </svg>

              <div
                style={{
                  position: "relative",
                  margin: "20px",
                  width: "460px",
                  height: "150px",
                  fontSize: "15px",
                  fontFamily: "Inter, sans-serif",
                  color: "#000",
                  whiteSpace: "pre-line",
                  overflowY: "auto",
                  paddingRight: "10px",
                }}
                className="hide-scrollbar"
              >
                {card.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RESPONSIBILITY SECTION */}
      {activeSection === "responsibility" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl px-4 mt-4">
          {dataLor?.Attributes &&
            Object.entries(dataLor.Attributes)
              .filter(([_, item]) => item?.attribute_overall_description?.trim())
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
                    {item.attribute_overall_description}
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
              .filter(([_, item]) => item?.attribute_overall_description?.trim())
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
                    {item.attribute_overall_description}
                  </p>
                </div>
              ))}
        </div>
      )}
    </div>
  );
}
