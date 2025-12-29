'use client';

import React, { useEffect, useMemo, useState } from 'react';

const LevelResponsibility = () => {
  const [sessionData, setSessionData] = useState<any>({});
  const [levelsData, setLevelsData] = useState<any[]>([]);
  const [attrData, setAttrData] = useState<{ [key: string]: any }>({});
  const [activeLevel, setActiveLevel] = useState('');
  const [activeSection, setActiveSection] = useState<'description' | 'responsibility' | 'business'>('description');

 const cleanText = (text?: string) => text?.replace(/in SFIA/g, "").trim() || "";

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const { APP_URL, token, org_type, sub_institute_id, user_id, user_profile_name } = JSON.parse(userData);
        setSessionData({
          url: APP_URL,
          token,
          org_type,
          sub_institute_id,
          user_id,
          user_profile_name,
        });
      }
    }
  }, []);

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchData();
    }
  }, [sessionData.url, sessionData.token]);

  const fetchData = async () => {
    try {
      const res = await fetch(
        `${sessionData.url}/level_of_responsibility?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}&org_type=${sessionData.org_type}`
      );
      const data = await res.json();
      setLevelsData(data.levelsData || []);
      setAttrData(data.attrData || {});
      if (data.levelsData[0]) {
        setActiveLevel(data.levelsData[0]?.level);
      }
    } catch (e) {
      console.error('Failed to fetch data', e);
    }
  };

  const activeData = levelsData.find((l) => l.level === activeLevel);
  const levelAttributes = useMemo(() => {
    return attrData && attrData[activeLevel] ? attrData[activeLevel] : null;
  }, [attrData, activeLevel]);

  const tabs = [
    {
      key: 'description',
      label: 'Description / Guidance Note',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/d6d290e6a7986c684c6a843ce15c54a1a37b52a2?width=160',
    },
    {
      key: 'responsibility',
      label: 'Responsibility Attributes',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/cb3ba31210d3bc25572fe2feb15e8134bdbc4c2b?width=200',
    },
    {
      key: 'business',
      label: 'Business Skills / Behavioral Factors',
      icon: 'https://api.builder.io/api/v1/image/assets/TEMP/b3bc12a9b36725a87b7dc72b84e00bea75fba507?width=186',
    },
  ];

  return (
    <div className="w-full flex flex-col bg-background rounded-xl items-center space-y-8 px-4 py-8">
      {/* LEVEL SELECTOR BUTTONS */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        {levelsData.map((level) => (
          <button
            key={level.level}
            onClick={() => {
              setActiveLevel(level.level);
              setActiveSection('description');
            }}
            className={`px-4 py-2 rounded-full font-semibold border shadow transition-all ${activeLevel === level.level
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-blue-800 border-blue-300 hover:bg-blue-100'
              }`}
          >
            Level {level.level}
          </button>
        ))}
      </div>

      {/* TOP TAB SWITCHER */}
      <div className="w-full max-w-6xl mx-auto">
        <div className="border-2 border-blue-400 bg-[#f6faff] rounded-2xl shadow-md overflow-hidden">
          <div className="flex flex-row justify-between items-stretch text-center">
            {tabs.map((tab, index) => (
              <React.Fragment key={tab.key}>
                <div
                  onClick={() => setActiveSection(tab.key as any)}
                  className={`flex-1 flex flex-col items-center justify-center py-4 cursor-pointer transition-all ${activeSection === tab.key
                    ? 'bg-[#ACD4FF]'
                    : 'hover:bg-[#eef6ff]'
                    }`}
                >
                  <img src={tab.icon} alt={tab.label} className="w-16 h-16 object-contain mb-2" />
                  <h3 className="text-[#1f2e4c] font-semibold text-sm md:text-base">{tab.label}</h3>
                </div>

                {/* Divider line between tabs */}
                {index < tabs.length - 1 && (
                  <div className="w-[5px] bg-blue-300 h-auto" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* LEVEL BADGE - Show for all sections, aligned to start (left) */}
      <div className="w-full flex justify-start mt-6">
        <div
          className="px-6 py-3 rounded-2xl border-2 border-[#A4D0FF] shadow max-w-xl"
          style={{
            background: "linear-gradient(90deg, #0575E6 0%, #56AAFF 50%, #0575E6 100%)",
          }}
        >
          <div className="text-white font-bold text-xl lg:text-2xl font-roboto">
            Level {activeLevel}: {levelsData.find((item) => item.level === activeLevel)?.guiding_phrase || ""}
          </div>
        </div>
      </div>

      
  {/* DESCRIPTION SECTION */}
{activeSection === 'description' && activeData && (
  <div className="w-full max-w-6xl mx-auto mt-6 px-4">
    <div className="grid grid-cols-2 gap-8">
      
      {/* Description Card */}
      <div
        className="relative w-full h-[300px] rounded-2xl border-2 border-[#94BEFF] shadow-sm
                   transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-200"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(71,160,255,0.35) 100%)",
        }}
      >
        <h3 className="mt-6 ml-5 text-[#0043CE] text-[24px] font-bold opacity-80">
          Description
        </h3>

        <hr className="mx-5 my-3 border border-gray-400" />

        <div className="mx-5 h-[150px] overflow-y-auto pr-2 text-[15px] whitespace-pre-line hide-scrollbar">
          {cleanText(activeData.essence_level)}
        </div>
      </div>

      {/* Guidance Notes Card */}
      <div
        className="relative w-full h-[300px] rounded-2xl border-2 border-[#94BEFF] shadow-sm
                   transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-200"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(71,160,255,0.35) 100%)",
        }}
      >
        <h3 className="mt-6 ml-5 text-[#0043CE] text-[24px] font-bold opacity-80">
          Guidance Notes
        </h3>

        <hr className="mx-5 my-3 border border-gray-400" />

        <div className="mx-5 h-[150px] overflow-y-auto pr-2 text-[15px] whitespace-pre-line hide-scrollbar">
          {cleanText(activeData.attribute_guidance_notes)}
        </div>
      </div>

    </div>
  </div>
)}


      {/* RESPONSIBILITY ATTRIBUTES SECTION */}
      {activeSection === 'responsibility' && levelAttributes?.Attributes && (
        <div className="w-full max-w-6xl px-4 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(levelAttributes.Attributes).map(([key, attr]: [string, any]) => (
              <div
                key={key}
                className="p-4 rounded-xl border border-3 border-blue-300 bg-white transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-200"
              >
                <h4 className="inline-block bg-[#c9dcf8] px-3 py-1 rounded-md font-bold text-blue-800 mb-2">
                  {key}
                </h4>
                <p className="text-sm text-black">{cleanText(attr.attribute_description)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BUSINESS SKILLS SECTION */}
      {activeSection === 'business' && levelAttributes?.Business_skills && (
        <div className="w-full max-w-6xl px-4 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(levelAttributes.Business_skills).map(([key, attr]: [string, any]) => (
              <div
                key={key}
                className="p-4 rounded-xl border border-3 border-blue-300 bg-white transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-200"
              >
                <h4 className="inline-block bg-[#c9dcf8] px-3 py-1 rounded-md font-bold text-blue-800 mb-2">
                  {key}
                </h4>
                <p className="text-sm text-black">{cleanText(attr.attribute_description)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelResponsibility;