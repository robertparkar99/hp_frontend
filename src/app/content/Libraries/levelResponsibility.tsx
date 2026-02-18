'use client';

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import {
  initializeLORTour,
  isLORTourCompleted,
  setLORTourCompleted,
  resetLORTour
} from './LevelResponsibilityTour';
import LevelResponsibilityTour from '../Libraries/levelResponsibilyTourstart';

const LevelResponsibility = () => {
  const [sessionData, setSessionData] = useState<any>({});
  const [levelsData, setLevelsData] = useState<any[]>([]);
  const [attrData, setAttrData] = useState<{ [key: string]: any }>({});
  const [activeLevel, setActiveLevel] = useState('');
  const [activeSection, setActiveSection] = useState<'description' | 'responsibility' | 'business'>('description');
  const tourRef = useRef<Tour | null>(null);
  const tourStartedRef = useRef(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [showTour, setShowTour] = useState(false);

 const cleanText = (text?: string) => text?.replace(/in SFIA/g, "").trim() || "";
  // Check if tour should start (only when navigated from sidebar tour)
  useEffect(() => {
    const triggerTour = sessionStorage.getItem('triggerPageTour');
    console.log('[User] triggerPageTour value:', triggerTour);

    if (triggerTour === 'earning-object-repository') {
      console.log('[User] Starting page tour automatically');
      setShowTour(true);
      // Clean up the flag
      sessionStorage.removeItem('triggerPageTour');
    }
  }, []);

  // Check if first visit and show tour (disabled - now using sidebar trigger)
  const handleTourComplete = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('levelOfResponsibilityTourSeen', 'true');
    }
    setShowTour(false);
  }, []);

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

  // Section switcher for tour
  const switchSectionForTour = useCallback((section: 'description' | 'responsibility' | 'business') => {
    setActiveSection(section);
  }, []);

  // Initialize tour only when triggered via sidebar tour flow
  useEffect(() => {
    // Check if tour was triggered via sidebar tour flow
    const triggerTour = sessionStorage.getItem('triggerPageTour');

    // Only start tour if triggered via sidebar AND not already started
    const isFirstVisit = !isLORTourCompleted();

    console.log('[LOR Tour] triggerTour:', triggerTour);
    console.log('[LOR Tour] isFirstVisit:', isFirstVisit);
    console.log('[LOR Tour] tourStartedRef:', tourStartedRef.current);
    console.log('[LOR Tour] levelsData.length:', levelsData.length);

    // Start tour only if triggered via sidebar AND tour hasn't been completed
    if (triggerTour && isFirstVisit && !tourStartedRef.current && levelsData.length > 0) {
      console.log('[LOR Tour] Starting tour (triggered via sidebar)...');

      // Clear the trigger flag immediately to prevent re-triggering
      sessionStorage.removeItem('triggerPageTour');

      tourStartedRef.current = true;
      tourRef.current = initializeLORTour(switchSectionForTour);
      tourRef.current.start();
      setIsTourActive(true);

      // Handle tour completion
      tourRef.current.on('complete', () => {
        setLORTourCompleted();
        setIsTourActive(false);
        console.log('[LOR Tour] Tour completed');
      });

      // Handle tour cancel
      tourRef.current.on('cancel', () => {
        setIsTourActive(false);
        console.log('[LOR Tour] Tour cancelled');
      });
    } else if (triggerTour && isFirstVisit && !tourStartedRef.current && levelsData.length === 0) {
      // Wait for data to load then start tour
      console.log('[LOR Tour] Waiting for data to load...');

      const timer = setTimeout(() => {
        // Check trigger again (it might still be set)
        const triggerTour = sessionStorage.getItem('triggerPageTour');
        if (triggerTour && levelsData.length > 0 && !tourStartedRef.current) {
          console.log('[LOR Tour] Data loaded, starting tour...');
          // Clear the trigger flag
          sessionStorage.removeItem('triggerPageTour');

          tourStartedRef.current = true;
          tourRef.current = initializeLORTour(switchSectionForTour);
          tourRef.current.start();
          setIsTourActive(true);
        } else if (!triggerTour) {
          console.log('[LOR Tour] Trigger was cleared while waiting');
        }
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      console.log('[LOR Tour] Tour not started - either not triggered or already completed');
    }
  }, [levelsData.length, switchSectionForTour]);

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
      <div id="tour-level-selector" className="flex flex-wrap gap-3 mb-6 justify-center">
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
      <div id="tour-section-tabs" className="w-full max-w-6xl mx-auto">
        <div className="border-2 border-blue-400 bg-[#f6faff] rounded-2xl shadow-md overflow-hidden">
          <div className="flex flex-row justify-between items-stretch text-center">
            {tabs.map((tab, index) => (
              <React.Fragment key={tab.key}>
                <div
                  onClick={() => setActiveSection(tab.key as any)}
                  className={`flex-1 flex flex-col items-center justify-center py-4 cursor-pointer transition-all ${activeSection === tab.key
                    ? 'bg-[#ACD4FF] shadow-inner'
                    : 'hover:bg-[#eef6ff]'
                    } ${isTourActive && activeSection === tab.key ? 'ring-4 ring-blue-300 ring-opacity-70 animate-pulse' : ''}`}
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
      <div id="tour-level-badge" className="w-full flex justify-start mt-6">
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
        <div id="tour-description-section" className="w-full max-w-6xl mx-auto mt-6 px-4">
          <div className="grid grid-cols-2 gap-8">

            {/* Description Card */}
            <div
              id="tour-description-card"
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
              id="tour-guidance-card"
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
        <div id="tour-responsibility-section" className="w-full max-w-6xl px-4 mt-2">
          <div id="tour-attribute-cards" className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div id="tour-business-section" className="w-full max-w-6xl px-4 mt-2">
          <div id="tour-business-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Tour Component */}
      {showTour && <LevelResponsibilityTour onComplete={handleTourComplete} />}
    </div>



  );
};

export default LevelResponsibility;
