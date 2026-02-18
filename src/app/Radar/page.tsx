'use client'
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Atom } from 'react-loading-indicators';

// Types
interface SkillData {
    classification: any;
    id: number;
    jobrole_category: string;
    skills_category: string;
    skills_name: string;
    weightage: number;
    institute_id: number;
    sub_institute_id: number;
}

interface RadarDataPoint {
    dimension: string;
    value: number;
}

interface ProcessedData {
    [category: string]: RadarDataPoint[];
}

interface RadarProps {
    usersJobroleComponent?: SkillData[];
    userCategory?: string;
}

function App({ usersJobroleComponent = [], userCategory }: RadarProps) {
    const [data, setData] = useState<SkillData[]>([]);
    const [processedData, setProcessedData] = useState<ProcessedData>({});
    const [selectedCategory, setSelectedCategory] = useState<string>(userCategory || '');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    const [sessionData, setSessionData] = useState({
        url: '',
        subInstituteId: '',
    });

    const hasFetchedRef = useRef(false);
    const sessionDataLoadedRef = useRef(false);

    const DIMENSIONS = useMemo(() => ['Skill', 'Knowledge', 'Ability', 'Attitude', 'Behavior'], []);

    const FIXED_DIMENSIONS: { [key: string]: RadarDataPoint[] } = {
        "Technical/Operational": [
            { dimension: "Skill", value: 20 },
            { dimension: "Knowledge", value: 25 },
            { dimension: "Ability", value: 30 },
            { dimension: "Attitude", value: 15 },
            { dimension: "Behavior", value: 10 },
        ],
        "Customer-Facing": [
            { dimension: "Skill", value: 25 },
            { dimension: "Knowledge", value: 15 },
            { dimension: "Ability", value: 20 },
            { dimension: "Attitude", value: 20 },
            { dimension: "Behavior", value: 20 },
        ],
        "Managerial": [
            { dimension: "Skill", value: 15 },
            { dimension: "Knowledge", value: 20 },
            { dimension: "Ability", value: 25 },
            { dimension: "Attitude", value: 25 },
            { dimension: "Behavior", value: 15 },
        ],
        "Creative/Strategic": [
            { dimension: "Skill", value: 20 },
            { dimension: "Knowledge", value: 10 },
            { dimension: "Ability", value: 25 },
            { dimension: "Attitude", value: 30 },
            { dimension: "Behavior", value: 15 },
        ],
        "Compliance-Heavy": [
            { dimension: "Skill", value: 15 },
            { dimension: "Knowledge", value: 35 },
            { dimension: "Ability", value: 25 },
            { dimension: "Attitude", value: 15 },
            { dimension: "Behavior", value: 10 },
        ],
    };

    useEffect(() => {
        if (sessionDataLoadedRef.current) return;
        const userData = localStorage.getItem('userData');
        if (userData) {
            const { APP_URL, sub_institute_id } = JSON.parse(userData);
            setSessionData({
                url: APP_URL,
                subInstituteId: sub_institute_id,
            });
            sessionDataLoadedRef.current = true;
        }
    }, []);

    const processData = useCallback((dataToProcess: SkillData[]) => {
        const categories = [...new Set(dataToProcess.map(item => item.jobrole_category))].filter(Boolean);
        const processed: ProcessedData = {};

        categories.forEach(category => {
            const items = dataToProcess.filter(item => item.jobrole_category === category);
            const dimensionTotals: { [key: string]: number } = {};

            items.forEach(item => {
                let dim = item.skills_category?.trim() || '';
                const map: any = {
                    skill: 'Skill', skills: 'Skill',
                    knowledge: 'Knowledge',
                    ability: 'Ability', abilities: 'Ability',
                    attitude: 'Attitude', attitudes: 'Attitude',
                    behavior: 'Behavior', behaviours: 'Behavior', behaviors: 'Behavior'
                };
                dim = map[dim.toLowerCase()] || dim;
                if (DIMENSIONS.includes(dim)) {
                    dimensionTotals[dim] = (dimensionTotals[dim] || 0) + (item.weightage || 0);
                }
            });

            const radarData: RadarDataPoint[] = DIMENSIONS.map(d => ({
                dimension: d,
                value: dimensionTotals[d] || 0,
            }));

            const total = radarData.reduce((sum, x) => sum + x.value, 0);
            if (total > 0) {
                radarData.forEach(x => x.value = Math.round((x.value / total) * 100));
            } else {
                radarData.forEach(x => x.value = 20);
            }

            processed[category] = radarData;
        });

        return processed;
    }, [DIMENSIONS]);

    useEffect(() => {
        if (usersJobroleComponent && usersJobroleComponent.length > 0 && !hasFetchedRef.current) {
            const processed = processData(usersJobroleComponent);
            setProcessedData(processed);
            const categories = Object.keys(processed);
            if (userCategory && categories.includes(userCategory)) {
                setSelectedCategory(userCategory);
            } else if (categories.length > 0) {
                setSelectedCategory(categories[0]);
            }
            setLoading(false);
            hasFetchedRef.current = true;
        }
    }, [usersJobroleComponent, userCategory, processData]);

    useEffect(() => {
        if (hasFetchedRef.current || usersJobroleComponent?.length > 0) return;
        if (!sessionData.url || !sessionData.subInstituteId) return;
        //   if (!userCategory) return;

        hasFetchedRef.current = true;

        const fetchData = async () => {
            try {
                // console.log('userCategory',userCategory);
                setLoading(true);
                const response = await fetch(`${sessionData.url}/table_data?table=s_user_jobrole&filters[sub_institute_id]=${sessionData.subInstituteId}&group_by=jobrole_category`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const result = await response.json();
                let skillsArray: SkillData[] = [];
                if (Array.isArray(result)) skillsArray = result;
                else if (result?.data) skillsArray = result.data;
                else if (result?.skills) skillsArray = result.skills;

                setData(skillsArray);
                const processed = processData(skillsArray);
                setProcessedData(processed);

                const categories = Object.keys(processed);
                if (userCategory && categories.includes(userCategory)) setSelectedCategory(userCategory);
                else if (categories.length > 0) setSelectedCategory(categories[0]);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to fetch skill competency data");
                hasFetchedRef.current = false;
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sessionData.url, sessionData.subInstituteId, usersJobroleComponent, userCategory, processData]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-800">{data.payload.dimension}</p>
                    <p className="text-blue-600 font-medium">{data.value}%</p>
                </div>
            );
        }
        return null;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Atom color="#525ceaff" size="medium" text="" textColor="" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="text-red-500 text-xl mb-2">⚠️</div>
                <p className="text-gray-800 font-medium">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                    Retry
                </button>
            </div>
        </div>
    );

    const isFixedCategory = selectedCategory && FIXED_DIMENSIONS[selectedCategory];
    const currentData = isFixedCategory
        ? FIXED_DIMENSIONS[selectedCategory]
        : processedData[selectedCategory] || [];

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <div className="mb-8">
                        <div className="relative">
                            <div className="w-full px-3 py-2 text-sm font-semibold text-gray-800 bg-blue-300 border border-gray-300 rounded-lg shadow-sm text-center">
                                {selectedCategory || "No Category Selected"} - Competency Distribution
                            </div>
                        </div>
                    </div>

                    {currentData.length > 0 ? (
                        <div className="w-full">
                            <div className="h-96 md:h-[500px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={currentData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                                        <defs>
                                            {/* Gradient fill that adapts to intensity */}
                                            <radialGradient id="radarGradient" cx="50%" cy="50%" r="70%">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.05" />
                                            </radialGradient>
                                        </defs>
                                        <PolarGrid stroke="#e5e7eb" strokeWidth={1} className="opacity-60" />
                                        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 14, fontWeight: 600, fill: '#374151' }} />
                                        <PolarRadiusAxis angle={90} domain={[0, 35]} tick={{ fontSize: 12, fill: '#6b7280' }} tickCount={9} />
                                        <Radar
                                            name="Skill Composition"
                                            dataKey="value"
                                            stroke="#3b82f6"
                                            fill="url(#radarGradient)"
                                            fillOpacity={0.8}
                                            strokeWidth={3}
                                            dot={{ fill: '#1d4ed8', strokeWidth: 2, stroke: '#ffffff', r: 6 }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                                {currentData.map(item => (
                                    <div key={item.dimension} className="flex items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                                        <div className="text-center">
                                            <p className="text-sm font-semibold text-gray-700">{item.dimension}</p>
                                            <p className="text-lg font-bold text-blue-600">{item.value}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No data available for selected category</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
