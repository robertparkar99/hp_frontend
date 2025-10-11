'use client';
import { useEffect, useState } from 'react';

export default function Index() {
    const [subInstituteId, setSubInstituteId] = useState<string>('');

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const parsedData = JSON.parse(userData);
            setSubInstituteId(parsedData.sub_institute_id || '');
        }
    }, []);

    return (
        <div className="w-full h-full">
            {subInstituteId && (
                <iframe
                    src={`https://skill-ontology-neo4j.vercel.app/?sub_institute_id=${subInstituteId}`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Skill Neo4j"
                />
            )}
        </div>
    );
}