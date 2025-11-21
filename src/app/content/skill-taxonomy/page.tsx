
'use client';
import { useEffect, useState } from 'react';

export default function SkillTaxonomyPage() {
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
                    src={`https://collapsible-d3-tree.vercel.app/?sub_institute_id=${subInstituteId}`}
                    style={{ width: '100%', height: '500%', border: 'none' }}
                    title="Skill Taxonomy Viewer"
                />
            )}
        </div>
    );
}
