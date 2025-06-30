import React, { useEffect, useState, useMemo } from 'react';

const LevelResponsibility = () => {
  const [sessionData, setSessionData] = useState<any>([]);
  const [allData, setAllData] = useState<any[]>([]);
  const [levelsData, setLevelsData] = useState<any[]>([]);
  const [attrData, setAttrData] = useState<{ [key: string]: any }>({});
  const [activeLevel, setActiveLevel] = useState('');

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const { APP_URL, token, org_type, sub_institute_id, user_id, user_profile_name } = JSON.parse(userData);
        setSessionData({
          url: APP_URL,
          token,
          org_type: org_type,
          sub_institute_id: sub_institute_id,
          user_id: user_id,
          user_profile_name: user_profile_name
        });
      }
    }
  }, []
  )

  useEffect(() => {
    if (sessionData.url && sessionData.token) {
      fetchData();
    }
  }, [sessionData.url, sessionData.token])

  const fetchData = async () => {
    try {
      const res = await fetch(`${sessionData.url}/level_of_responsibility?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}&org_type=${sessionData.org_type}`);
      const data = await res.json();
      setAllData(data.allData || []);
      setLevelsData(data.levelsData || []);
      setAttrData(data.attrData || []);
      if (data.levelsData[0]) {
        setActiveLevel(data.levelsData[0]?.level);
      }
      console.log(data.levelsData);
    }
    catch (e) {
      console.log('Falied to fetch data', e);
    }
  }

  return (
    <>
     <div className="container mx-auto px-1 rounded-lg pb-4">
          <div className='flex rounded-lg p-4'>
            <div className="headerMenu">
              <p className="text-3xl font-bold text-[#4876ab]" style={{ fontFamily: "cursive" }}>Level of Responsibility</p>
            </div>
            {/* <div className="ml-auto">
              <button className="bg-blue-500 text-white px-4 py-2 rounded-full" title="Add New Jobrole">+</button>
            </div> */}
          </div>

        </div>
      <div>
        <hr className='mb-[26px] text-[#ddd] border-2 border-[#449dd5] rounded' />
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {levelsData.map(item => (
            <button
              key={item.level}
              onClick={() => setActiveLevel(item.level)}
              className={`px-3 py-1 text-md font-bold rounded-md mr-6 border shadow-lg shadow-blue-300/30 transition ${activeLevel === item.level
                ? 'bg-[#bbb1f1] text-[#5a4da3] border-[#5a4da3] shadow-blue-500/50'
                : 'bg-[#e7efff] text-gray-700 border-[#c1d2f7]'
                }`}
                data-title={item.guiding_phrase}
            >
              Level <span>{item.level}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {levelsData.length > 0 ? (
          <div className="bg-white py-6 px-4 rounded-lg shadow border border-gray-200">
            {levelsData
              .filter(item => item.level === activeLevel)
              .map(item => (
                <div key={item.level}>
                  <h2 className="text-2xl font-bold p-2 bg-[#bbb1f1] rounded-t-lg">
                  Levels of responsibility: Level <span>{item.level} -</span>
                  <span> {item.guiding_phrase}</span>
                  </h2>
                  <div className="prose max-w-none p-2 bg-[#e7efff]">
                  <p className="mb-4">{item.essence_level}</p>
                  {/* guiding_notes  */}
                  <div className="guidenceNotes bg-[#f3f3f3] rounded-lg p-2">
                    <h2 className="font-bold text-xl mb-2">Guidance notes</h2>
                    <p>{item.guidance_notes}</p>
                  </div>
                  {/* attributes start */}
                  <div className="attributeData p-2">
                    {attrData && attrData[item.level] && attrData[item.level].Attributes
                    ? Object.entries(attrData[item.level].Attributes).map(([key, attribute]: [string, any]) => (
                      <div key={attribute.id || key} className="mb-4">
                        <h3 className="font-bold text-lg bg-[#a5cef7] rounded-lg px-2 py-1 w-[fit-content] mb-2">{key}</h3>
                        <p>{attribute.attribute_description}</p>
                      </div>
                      ))
                    : <p>&nbsp;</p>
                    }
                  </div>
                  {/* attributes end  */}
                  {/* Business skills / Behavioural factors start  */}
                  <div className='p-2 bg-[#dedfff] rounded-lg'>
                    <h2 className="text-xl font-bold mb-2">Business skills / Behavioural factors</h2>
                    {attrData && attrData[item.level] && attrData[item.level].Business_skills
                    ? Object.entries(attrData[item.level].Business_skills).map(([key, attribute]: [string, any]) => (
                      <div key={attribute.id || key} className="mb-4">
                        <h3 className="font-bold text-lg bg-[#ceb0fddd] rounded-lg px-2 py-1 w-[fit-content] mb-2">{key}</h3>
                        <p>{attribute.attribute_description}</p>
                      </div>
                      ))
                    : <p>&nbsp;</p>
                    }
                  </div>
                  {/* Business skills / Behavioural factors end  */}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No data available
          </div>
        )}
      </div>
    </>
  );
};

export default LevelResponsibility;