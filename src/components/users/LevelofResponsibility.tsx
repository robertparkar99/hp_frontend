import Image from "next/image";
import { useState } from 'react';
import { FaRegFileAlt } from 'react-icons/fa';
import '../../app/globals.css';

export default function LevelofResponsibility() {
   const [selectedTab, setSelectedTab] = useState('description');

  const renderContent = () => {
    switch (selectedTab) {
      case 'description':
        return (
          <>
            <div className="shadow-md rounded-b-lg mb-3 me-8">
              <h3 className="text-xl font-bold mb-2 ps-2 bg-blue-400 text-white rounded-t-lg">Description</h3>
              <p className="ps-2">
                Essence of the level: Operates at the highest organizational level, determines overall
                organizational vision and strategy, and assumes accountability for overall success.
              </p>
            </div>
            
            <div className="shadow-md rounded-b-lg mb-3 me-8">
              <h3 className="text-xl font-bold mb-2 ps-2 bg-blue-400 text-white rounded-t-lg">Guidance notes</h3>
              <p className="ps-2 -mb-23">
              Levels represent levels of responsibility in the workplace. Each successive level describes increasing impact, responsibility and accountability. 
              -Autonomy, influence and complexity are generic attributes that indicate the level of responsibility.
              - Business skills and behavioral factors describe the behaviors required to be effective at each level.<br/>
              -The knowledge attribute defines the depth and breadth of understanding required to perform and influence work effectively. 
                Understanding these attributes will help you get the most out of levels.
                They are critical <br/> to understanding and applying the levels described in skill<br/> descriptions.
              </p>

              {/* Curved Cutout (bottom right) */}
                <div className="relative -bottom-3 left-115.5 w-26 h-26 bg-green-600 rounded-full shadow z-10 border-4 border-white items-center justify-center">
                    {/* Icon or image inside the circle */}
                    
                </div>
            </div>
            
          </>          
        );
      case 'skills':
        return (
          <div>
            <h2 className="text-purple-600 font-semibold text-lg mb-8">💠 Business Skill Data</h2>
            <div className="space-y-4">              
                <div className="bg-green-700 p-4 mb-10 rounded-lg shadow">
                  <div>
                    <h3 className="font-semibold bg-white inline p-2 z-1 rounded-lg shadow-xl border border-black-100 text-black mb-1 relative -top-6.5">Collaboration</h3>
                  </div>
                  <p className="text-green-200 z-0 bg-green-700 relative -top-2">
                    Drives collaboration, engaging with leadership stakeholders ensuring alignment to corporate
                    vision and strategy. Builds strong, influential relationships with customers, partners and
                    industry leaders.
                  </p>
                </div>

                <div className="bg-green-700 p-4 mb-10 rounded-lg shadow">
                  <div>
                    <h3 className="font-semibold bg-white inline p-2 z-1 rounded-lg shadow-xl border border-black-100 text-black mb-1 relative -top-6.5">Collaboration</h3>
                  </div>
                  <p className="text-green-200 bg-green-700 z-0 relative -top-2">
                    Drives collaboration, engaging with leadership stakeholders ensuring alignment to corporate
                    vision and strategy. Builds strong, influential relationships with customers, partners and
                    industry leaders.
                  </p>
                </div>

                <div className="bg-green-700 p-4 rounded-lg shadow">
                  <div>
                    <h3 className="font-semibold bg-white inline p-2 z-1 rounded-lg shadow-xl border border-black-100 text-black mb-1 relative -top-6.5">Collaboration</h3>
                  </div>
                  <p className="text-green-200 z-0 bg-green-700 relative -top-2">
                    Drives collaboration, engaging with leadership stakeholders ensuring alignment to corporate
                    vision and strategy. Builds strong, influential relationships with customers, partners and
                    industry leaders.
                  </p>
                </div>
              </div>
          </div>
        );
      case 'responsibility':
        return (
           <div>
            <h2 className="text-purple-600 font-semibold text-lg mb-4">💠 Responsibility Attribute</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
              {/* Autonomy */}
              <div className="shadow-md rounded-b-lg">
                  <h3 className="text-xl font-bold ps-2 bg-orange-400 text-white rounded-t-lg">Autonomy</h3>
                  <p className="p-2 text-justify">
                    Defines and leads the organization's vision and strategy within core business functions.
                    Decisions are typically accounted for by self and others to whom responsibilities have
                    been delegated. Owns and delivers the responsibility for strategic business objectives.
                  </p>
              </div>

              {/* Influence */}
              <div className="shadow-md rounded-b-lg">
                  <h3 className="text-xl font-bold ps-2 bg-orange-400 text-white rounded-t-lg">Influence</h3>
                  <p className="p-2 text-justify">
                    Directs, influences and inspires the strategic direction and development of the organization.
                    Has an external leadership role and exercises wide influence at national or international levels.
                  </p>
              </div>
              
              {/* Complexity */}
              <div className="shadow-md rounded-b-lg">
                  <h3 className="text-xl font-bold ps-2 bg-orange-400 text-white rounded-t-lg">Complexity</h3>
                  <p className="p-2 text-justify">
                    Performs extensive strategic leadership in delivering integrated business change across the
                    organization.
                  </p>
              </div>

              {/* Knowledge */}
              <div className="shadow-md rounded-b-lg">
                  <h3 className="text-xl font-bold ps-2 bg-orange-400 text-white rounded-t-lg">Knowledge</h3>
                  <p className="p-2 text-justify">
                    Applies strategic and broad-based knowledge across disciplines. Has the capability to anticipate,
                    prepare and adapt the organization to adapt and lead.
                  </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  return (
     <div className="p-6 -mt-6 min-h-screen ">
      {/* Top header */}
      <div className="flex items-center space-x-4">
        <span className="bg-blue-700 ps-3 text-white px-4 py-1 rounded-full font-semibold text-sm">
          Level-7
        </span>
        <h2 className="text-lg font-semibold text-gray-800">
          Level of Responsibility: Set strategy, inspire, mobilise
        </h2>    
      </div>
      <div><img className="w-320 h-8 object-fill" src="/linedot.png"/></div>

      <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8">
        {/* Left column with arrows */}
        <div className="flex flex-col space-y-4 md:w-1/3 pe-6 border-r-2 ms-11 border-gray-400">
          {/* Arrow buttons */}
          <button
            onClick={() => setSelectedTab('description')}
            className="flex items-center bg-blue-100 text-black-800 h-15 px-4 py-3 border border-blue-300 font-bold mt-5 ps-15 arrow-left rounded-l-full shadow-md hover:bg-blue-200 transition"
          >
            Description /<br/> Guidance notes
            <span className="mr-3">
              <FaRegFileAlt />
            </span>
          </button>

          <button
            onClick={() => setSelectedTab('responsibility')}
            className="flex items-center bg-red-100 text-black-800 h-15 px-4 py-3 border border-red-300 font-bold mt-10 ps-15 arrow-left rounded-l-full shadow-md hover:bg-red-200 transition"
          >
            Responsibility Attribute
            <span className="mr-3">
              <FaRegFileAlt />
            </span>
          </button>

          <button
            onClick={() => setSelectedTab('skills')}
            className="flex items-center bg-green-100 text-black-800 h-15 px-4 py-3 border border-green-300 font-bold mt-10 ps-15 arrow-left rounded-l-full shadow-md hover:bg-green-200 transition"
          >
            Business skills / Behavioral factors
            <span className="mr-3">
              <FaRegFileAlt />
            </span>
          </button>
          
        </div>

        {/* Right side content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
