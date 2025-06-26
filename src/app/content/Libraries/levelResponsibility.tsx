import React, { useEffect, useState, useMemo } from 'react';

const LevelResponsibility = () => {
    const [sessionData, setSessionData] = useState<any>([]);
    const [allData, setAllData] = useState<any>([]);

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
     
    const fetchData = async() =>{
        try{
            const res = await fetch(`${sessionData.url}/level_of_responsibility?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}&org_type=${sessionData.org_type}`);
            const data = await res.json();
            console.log('data',data);
        }
        catch(e){
            console.log('Falied to fetch data', e);
        }
    }
    return (
        <>
            <div>hello we are here</div>
        </>
    );
};

export default LevelResponsibility;