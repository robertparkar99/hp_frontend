import React, { useEffect, useState, useMemo } from 'react';

const LevelResponsibility = () => {
  const [sessionData, setSessionData] = useState<any>([]);
  const [allData, setAllData] = useState<any[]>([]);
  const [levelsData, setLevelsData] = useState<any[]>([]);
  const [attrData, setAttrData] = useState<any[]>([]);
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
              <p className="text-3xl font-bold mb-4 text-[#4876ab]" style={{ fontFamily: "cursive" }}>Jobrole Library</p>
            </div>
            {/* <div className="ml-auto">
              <button className="bg-blue-500 text-white px-4 py-2 rounded-full" title="Add New Jobrole">+</button>
            </div> */}
          </div>

        </div>
      <div>
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
              Level <span>{item.level}:</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {levelsData.length > 0 ? (
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            {levelsData
              .filter(item => item.level === activeLevel)
              .map(item => (
                <div key={item.level}>
                  <h2 className="text-xl font-bold mb-4">
                    Level <span>{item.level}:</span>
                    
                    <span> {item.guiding_phrase}</span>
                  </h2>
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold mb-2">Essence of the level:</h3>
                    <p className="mb-4">{item.essence_level}</p>

                    <h3 className="text-lg font-semibold mb-2">Attribute Description:</h3>
                    <p>{item.attribute_description}</p>
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