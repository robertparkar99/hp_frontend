import { AlignJustify } from "lucide-react";

export default function Index() {
  const sections = [
    {
      imgSrc:
        "https://api.builder.io/api/v1/image/assets/TEMP/d6d290e6a7986c684c6a843ce15c54a1a37b52a2?width=160",
      alt: "Web Note",
      title: "Description / Guidance Note",
    },
    {
      imgSrc:
        "https://api.builder.io/api/v1/image/assets/TEMP/cb3ba31210d3bc25572fe2feb15e8134bdbc4c2b?width=200",
      alt: "Leadership Graph",
      title: "Responsibility Attributes",
    },
    {
      imgSrc:
        "https://api.builder.io/api/v1/image/assets/TEMP/b3bc12a9b36725a87b7dc72b84e00bea75fba507?width=186",
      alt: "Team Business Skills",
      title: "Business Skills / Behavioral Factors",
    },
  ];

  const cards = [
    {
      title: "Description",
      text: `Essence of the level: Operates at the highest organizational level,
      determines overall organizational vision and strategy, and assumes
      accountability for overall success.`,
    },
    {
      title: "Guidance notes",
      text: `Levels represent levels of responsibility in the workplace. Each
      successive level describes increasing impact, responsibility and
      accountability. Autonomy, influence and complexity are generic
      attributes that indicate the level of responsibility. Business
      skills and behavioral factors describe the behaviors required to be
      effective at each level.

      The knowledge attribute defines the depth and breadth of
      understanding required to perform and influence work effectively.
      Understanding these attributes will help you get the most out of
      levels. They are critical to understanding and applying the levels
      described in skill descriptions.`,
    },
  ];

  return (
    <div className="w-full flex flex-col items-center space-y-8">
      {/* TOP SECTION */}
      <div className="w-full max-w-6xl mx-auto p-3">
        <div
          className="relative rounded-2xl border-4 border-blue-500/80 bg-gradient-to-r from-blue-500/5 to-blue-600/5 shadow-lg backdrop-blur-sm"
          style={{
            boxShadow: "2px 3px 8px 6px rgba(193, 193, 193, 0.25)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:p-4 relative">
            {sections.map((section, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="w-20 h-20 flex items-center justify-center">
                  <img
                    src={section.imgSrc}
                    alt={section.alt}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-[#23395B] font-inter text-lg md:text-lg font-bold leading-normal">
                  {section.title}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* LEVEL BADGE */}
        <div
          className="w-120 max-w-xl h-24 md:h-14 rounded-2xl border-4 border-[#A4D0FF] flex items-center justify-start px-6 mt-6 shadow-sm"
          style={{
            background:
              "linear-gradient(90deg, #0575E6 0%, #56AAFF 50%, #0575E6 100%)",
          }}
        >
          <span className="text-white font-bold text-3xl font-roboto">
            Level:4
          </span>
        </div>
      </div>

      {/* CARDS */}
      <div className="flex justify-center items-start gap-8 mt-6 flex-wrap ml-[-35px]">
        {cards.map((card, index) => {
          const cardHeight = index === 1 ? "415px" : "284px";
          const marginTop = index === 1 ? "-123px" : "0px";
          const cardWidth = index === 1 ? "590px" : "480px"; // ✅ wider second card

          return (
            <div
              key={index}
              className="relative"
              style={{
                width: cardWidth,
                height: cardHeight,
                borderRadius: "18px",
                marginTop: marginTop,
              }}
            >
              {/* Background */}
              <div
                className="absolute inset-0"
                style={{
                  borderRadius: "16px",
                  border: "4px solid #94BEFF",
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(71,160,255,0.35) 100%)",
                }}
              />

              {/* Title */}
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

              {/* Line */}
              <svg
                style={{
                  position: "absolute",
                  top: "73px",
                  left: "34px",
                  width: cardWidth === "590px" ? "500px" : "430px", // adjust line width
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

              {/* Text */}
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
                  alignContent: "Justify",
                }}
              >
                {card.text}
              </p>

              {/* Circle */}
              <svg
                style={{
                  position: "absolute",
                  top: index === 1 ? "320px" : "178px",
                  left: cardWidth === "590px" ? "500px" : "380px",
                  width: "130px",
                  height: "130px",
                }}
                viewBox="0 0 130 130"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="74"
                  cy="74"
                  r="54"
                  fill="#8EC5FF"
                  stroke="#47A0FF"
                  strokeWidth="2"
                />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}
