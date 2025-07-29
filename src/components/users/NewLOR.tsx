import React, { useState } from "react";

export default function Index() {
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

  const descriptionCards = [
    {
      title: "Description",
      text: `Essence of the level: Operates at the highest organizational level, determines overall organizational vision and strategy, and assumes accountability for overall success.`,
    },
    {
      title: "Guidance notes",
      text: `Levels represent levels of responsibility in the workplace. Each successive level describes increasing impact, responsibility and accountability. Autonomy, influence and complexity are generic attributes that indicate the level of responsibility.

Business skills and behavioral factors describe the behaviors required to be effective at each level.

The knowledge attribute defines the depth and breadth of understanding required to perform and influence work effectively. Understanding these attributes will help you get the most out of levels. They are critical to understanding and applying the levels described in skill descriptions.`,
    },
  ];

  const responsibilityCards = [
    {
      title: "Autonomy",
      text: `Defines and leads the organisation's vision and strategy within over-arching business objectives. Is fully accountable for actions taken and decisions made, both by self and others to whom responsibilities have been assigned. Delegates authority and responsibility for strategic business objectives.`,
    },
    {
      title: "Influence",
      text: `Directs, influences and inspires the strategic direction and development of the organisation. Has an extensive leadership level of contact with internal colleagues and external contacts. Authorises the appointment of required resources.`,
    },
    {
      title: "Complexity",
      text: `Performs extensive strategic leadership in delivering business value through vision, governance and executive management.`,
    },
    {
      title: "Knowledge",
      text: `Applies strategic and broad-based knowledge to shape organisational strategy, anticipate future industry trends, and prepare the organisation to adapt and lead.`,
    },
  ];

  const businessCards = [
    {
      title: "Collaboration",
      text: "Drives collaboration, engaging with leadership stakeholders ensuring alignment to corporate vision and strategy. Builds strong, influential relationships with customers, partners and industry leaders.",
    },
    {
      title: "Communication",
      text: "Communicates to audiences at all levels within own organisation and engages with industry. Presents compelling arguments and ideas authoritatively and convincingly to achieve business objectives.",
    },
    {
      title: "Improvement mindset",
      text: "Defines and communicates the organisational approach to continuous improvement. Cultivates a culture of ongoing enhancement. Evaluates the impact of improvement initiatives on organisational success.",
    },
    {
      title: "Creativity",
      text: "Champions creativity and innovation in driving strategy development to enable business opportunities.",
    },
    {
      title: "Decision-making",
      text: "Uses judgement in making decisions critical to the organisational strategic direction and success. Escalates when business executive management input is required through established governance structures.",
    },
    {
      title: "Digital mindset",
      text: "Leads the development of the organisation’s digital culture and the transformational vision...",
    },
    {
      title: "Leadership",
      text: "Leads strategic management. Applies the highest level of leadership to the formulation and implementation of strategy.",
    },
    {
      title: "Learning and development",
      text: "Inspires a learning culture to align with business objectives. Maintains strategic insight into emerging industry landscapes.",
    },
    {
      title: "Planning",
      text: "Plans and leads at the highest level of authority over all aspects of a significant area of work.",
    },
    {
      title: "Problem-solving",
      text: "Manages inter-relationships between impacted parties and strategic imperatives.",
    },
    {
      title: "Adaptability",
      text: "Champions organisational agility and resilience. Embeds adaptability into organisational culture and strategic planning.",
    },
    {
      title: "Security, privacy and ethics",
      text: "Provides clear direction and strategic leadership for embedding compliance, organisational culture, and working practices.",
    },
  ];

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

        {/* LEVEL BADGE for Description */}
        {activeSection === "description" && (
          <div
            className="w-120 max-w-xl h-24 md:h-14 rounded-2xl border-4 border-[#A4D0FF] flex items-center justify-start px-6 mt-6 shadow-sm"
            style={{
              background:
                "linear-gradient(90deg, #0575E6 0%, #56AAFF 50%, #0575E6 100%)",
            }}
          >
            <span className="text-white font-bold text-3xl font-roboto">
              Level: 4
            </span>
          </div>
        )}
      </div>

      {/* DESCRIPTION SECTION */}
      {activeSection === "description" && (
        <div className="flex justify-center items-start gap-8 mt-6 flex-wrap ml-[-35px]">
          {descriptionCards.map((card, index) => {
            const cardHeight = index === 1 ? "415px" : "284px";
            const marginTop = index === 1 ? "-123px" : "0px";
            const cardWidth = index === 1 ? "590px" : "480px";

            return (
              <div
                key={index}
                className="relative"
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  borderRadius: "18px",
                  marginTop,
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    borderRadius: "16px",
                    border: "4px solid #94BEFF",
                    background:
                      "linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(71,160,255,0.35) 100%)",
                  }}
                />
                <h3
                  style={{
                    position: "absolute",
                    top: "30px",
                    left: "50px",
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
                    position: "absolute",
                    top: "73px",
                    left: "34px",
                    width: cardWidth === "590px" ? "500px" : "430px",
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
                <p
                  style={{
                    position: "absolute",
                    top: "99px",
                    left: "50px",
                    width: cardWidth === "590px" ? "470px" : "400px",
                    fontSize: "15px",
                    fontFamily: "Inter, sans-serif",
                    color: "#000",
                    whiteSpace: "pre-line",
                  }}
                >
                  {card.text}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* RESPONSIBILITY SECTION */}
      {activeSection === "responsibility" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl px-4 mt-4">
          {responsibilityCards.map((item, index) => (
            <div
              key={index}
              className="bg-white border-2 border-blue-200 p-6 rounded-xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 duration-300"
            >
              <h3 className="inline-block bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-md mb-3 text-base">
                {item.title}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* BUSINESS SKILLS SECTION */}
      {activeSection === "business" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl px-4 mt-4">
          {businessCards.map((item, index) => (
            <div
              key={index}
              className="bg-white border-2 border-blue-200 p-6 rounded-xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 duration-300"
            >
              <h3 className="inline-block bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-md mb-3 text-base">
                {item.title}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
