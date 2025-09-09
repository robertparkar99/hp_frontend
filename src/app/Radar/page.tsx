'use client'

import React, { useState, useEffect } from 'react';
import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { ChevronDown } from 'lucide-react';
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
    console.log("userCategory:", userCategory);

    const [data, setData] = useState<SkillData[]>([]);
    const [processedData, setProcessedData] = useState<ProcessedData>({});
    const [selectedCategory, setSelectedCategory] = useState<string>(userCategory || '');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');


    // Required dimensions
    const DIMENSIONS = ['Skill', 'Knowledge', 'Ability', 'Attitude', 'Behavior'];

    // Fetch data from API if no props provided
    useEffect(() => {
        if (usersJobroleComponent && usersJobroleComponent.length > 0) {
            console.log("Using props data:", usersJobroleComponent);
            setData(usersJobroleComponent);
            setLoading(false);
        } else {
            console.log("Fetching data from API...");
            const fetchData = async () => {
                try {
                    setLoading(true);
                    const response = await fetch('https://hp.triz.co.in/getSkillCompetency?sub_institute_id=4');

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const result = await response.json();
                    let skillsArray: SkillData[] = [];

                    if (Array.isArray(result)) {
                        skillsArray = result;
                    } else if (result && Array.isArray(result.data)) {
                        skillsArray = result.data;
                    } else if (result && Array.isArray(result.skills)) {
                        skillsArray = result.skills;
                    } else {
                        console.warn('API response does not contain expected array structure:', result);
                        skillsArray = [];
                    }

                    console.log("API data fetched:", skillsArray);
                    setData(skillsArray);
                } catch (err) {
                    console.error('Error fetching data:', err);
                    setError('Failed to fetch skill competency data');
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [usersJobroleComponent]);

    // Process data when raw data changes
    useEffect(() => {
        if (data.length === 0) return;

        // Get unique categories from the data
        const categories = [
            ...new Set(
                data.map((item: any) => item.jobrole_category)
            ),
        ].filter(Boolean);

        console.log("Available categories:", categories);
        console.log("Current selectedCategory:", selectedCategory);
        console.log("UserCategory prop:", userCategory);

        const processed: ProcessedData = {};

        categories.forEach((category) => {
            const items = data.filter(
                (item: any) => item.jobrole_category === category
            );

            // Group by skills_category
            const dimensionTotals: { [key: string]: number } = {};

            items.forEach((item: any) => {
                let dimension = item.skills_category?.trim() || '';

                const dimensionMap: { [key: string]: string } = {
                    skill: 'Skill',
                    skills: 'Skill',
                    knowledge: 'Knowledge',
                    ability: 'Ability',
                    abilities: 'Ability',
                    attitude: 'Attitude',
                    attitudes: 'Attitude',
                    behavior: 'Behavior',
                    behaviours: 'Behavior',
                    behaviors: 'Behavior',
                };

                dimension = dimensionMap[dimension.toLowerCase()] || dimension;

                if (DIMENSIONS.includes(dimension)) {
                    dimensionTotals[dimension] =
                        (dimensionTotals[dimension] || 0) + (item.weightage || 0);
                }
            });

            // Normalize to percentages
            const radarData: RadarDataPoint[] = DIMENSIONS.map((dimension) => ({
                dimension,
                value: dimensionTotals[dimension] || 0,
            }));

            const total = radarData.reduce((sum, item) => sum + item.value, 0);
            if (total > 0) {
                radarData.forEach((item) => {
                    item.value = Math.round((item.value / total) * 100);
                });
            } else {
                radarData.forEach((item) => {
                    item.value = 20;
                });
            }

            processed[category] = radarData;
        });

        setProcessedData(processed);

        // Set the selected category - prioritize userCategory prop, then use first available category
        if (userCategory && categories.includes(userCategory)) {
            console.log("Setting category from userCategory prop:", userCategory);
            setSelectedCategory(userCategory);
        } else if (categories.length > 0 && !selectedCategory) {
            console.log("Setting category from first available:", categories[0]);
            setSelectedCategory(categories[0]);
        } else if (selectedCategory && !categories.includes(selectedCategory) && categories.length > 0) {
            console.log("Selected category not available, using first:", categories[0]);
            setSelectedCategory(categories[0]);
        }
    }, [data, userCategory]);

    // Update selectedCategory when userCategory prop changes
    useEffect(() => {
        if (userCategory && userCategory !== selectedCategory) {
            console.log("Updating selectedCategory from prop change:", userCategory);
            setSelectedCategory(userCategory);
        }
    }, [userCategory]);

    // Custom tooltip
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <p className="text-gray-600 mt-4 text-center">
                    <Atom color="#525ceaff" size="medium" text="" textColor="" />
                </p>
            </div>
        );
    }

    if (error) {
        return (
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
    }

    const categories = Object.keys(processedData);
    const currentData = processedData[selectedCategory] || [];

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <div className="mb-8">
                        <div className="relative">
                            <div className="w-full px-3 py-2 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-lg shadow-sm text-center">
                                {selectedCategory || "No Category Selected"} - Competency Distribution
                            </div>
                        </div>
                    </div>

                    {currentData.length > 0 ? (
                        <div className="w-full">
                            {/* <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                                {selectedCategory} 
                            </h2> */}

                            <div className="h-96 md:h-[500px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={currentData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                                        <PolarGrid stroke="#e5e7eb" strokeWidth={1} className="opacity-60" />
                                        <PolarAngleAxis
                                            dataKey="dimension"
                                            tick={{ fontSize: 14, fontWeight: 600, fill: '#374151' }}
                                            className="text-gray-700"
                                        />
                                        <PolarRadiusAxis
                                            angle={90}
                                            domain={[0, 100]}
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            tickCount={6}
                                        />
                                        <Radar
                                            name="Skill Composition"
                                            dataKey="value"
                                            stroke="#3b82f6"
                                            fill="#3b82f6"
                                            fillOpacity={0.1}
                                            strokeWidth={3}
                                            dot={{
                                                fill: '#1d4ed8',
                                                strokeWidth: 2,
                                                stroke: '#ffffff',
                                                r: 6,
                                            }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                                {currentData.map((item, index) => (
                                    <div
                                        key={item.dimension}
                                        className="flex items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                                    >
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