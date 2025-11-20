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
import { ChevronDown, User, TrendingUp, AlertTriangle } from 'lucide-react';

const KASBA_DATA = [
    { jobrole_category: "Technical/Operational", dimension: "Skill", value: 20 },
    { jobrole_category: "Technical/Operational", dimension: "Knowledge", value: 25 },
    { jobrole_category: "Technical/Operational", dimension: "Ability", value: 30 },
    { jobrole_category: "Technical/Operational", dimension: "Attitude", value: 15 },
    { jobrole_category: "Technical/Operational", dimension: "Behavior", value: 10 },

    { jobrole_category: "Customer-Facing", dimension: "Skill", value: 25 },
    { jobrole_category: "Customer-Facing", dimension: "Knowledge", value: 15 },
    { jobrole_category: "Customer-Facing", dimension: "Ability", value: 20 },
    { jobrole_category: "Customer-Facing", dimension: "Attitude", value: 20 },
    { jobrole_category: "Customer-Facing", dimension: "Behavior", value: 20 },

    { jobrole_category: "Managerial", dimension: "Skill", value: 15 },
    { jobrole_category: "Managerial", dimension: "Knowledge", value: 20 },
    { jobrole_category: "Managerial", dimension: "Ability", value: 25 },
    { jobrole_category: "Managerial", dimension: "Attitude", value: 25 },
    { jobrole_category: "Managerial", dimension: "Behavior", value: 15 },

    { jobrole_category: "Creative/Strategic", dimension: "Skill", value: 20 },
    { jobrole_category: "Creative/Strategic", dimension: "Knowledge", value: 10 },
    { jobrole_category: "Creative/Strategic", dimension: "Ability", value: 25 },
    { jobrole_category: "Creative/Strategic", dimension: "Attitude", value: 30 },
    { jobrole_category: "Creative/Strategic", dimension: "Behavior", value: 15 },

    { jobrole_category: "Compliance-Heavy", dimension: "Skill", value: 15 },
    { jobrole_category: "Compliance-Heavy", dimension: "Knowledge", value: 35 },
    { jobrole_category: "Compliance-Heavy", dimension: "Ability", value: 25 },
    { jobrole_category: "Compliance-Heavy", dimension: "Attitude", value: 15 },
    { jobrole_category: "Compliance-Heavy", dimension: "Behavior", value: 10 },
];


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

interface EmployeeRadarDataPoint {
    dimension: string;
    required: number;
    current: number;
}
interface ProcessedData {
    [category: string]: RadarDataPoint[];
}

// Main component
function App() {
    const [data, setData] = useState<SkillData[]>([]);
    const [processedData, setProcessedData] = useState<ProcessedData>({});
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [employeeData, setEmployeeData] = useState<{ [category: string]: EmployeeRadarDataPoint[] }>({});

    // Required dimensions
    const DIMENSIONS = ['Skill', 'Knowledge', 'Ability', 'Attitude', 'Behavior'];

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://hp.triz.co.in/getSkillCompetency?sub_institute_id=4');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                // Ensure we have an array - handle different API response structures
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

                setData(skillsArray);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch skill competency data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Process data when raw data changes
    useEffect(() => {
        if (data.length === 0) return;

        // Get all unique jobrole_category values from API
        const categories = [...new Set(data.map((item) => item.jobrole_category))];

        const processed: ProcessedData = {};
        categories.forEach((category) => {
            const radarData = KASBA_DATA.filter(d => d.jobrole_category === category)
                .map(d => ({ dimension: d.dimension, value: d.value }));

            processed[category] = radarData;
        });

        setProcessedData(processed);

        // Default selection
        if (categories.length > 0 && !selectedCategory) {
            setSelectedCategory(categories[0]);
        }

        // Generate employee data (with random variation)
        const employeeDemo: { [category: string]: EmployeeRadarDataPoint[] } = {};
        Object.entries(processed).forEach(([category, requiredData]) => {
            employeeDemo[category] = requiredData.map(item => ({
                dimension: item.dimension,
                required: item.value,
                current: Math.max(0, item.value + Math.floor(Math.random() * 40) - 20)
            }));
        });
        setEmployeeData(employeeDemo);
    }, [data, selectedCategory]);

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

    // Custom tooltip for employee comparison
    const EmployeeTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const required = payload.find((p: any) => p.dataKey === 'required');
            const current = payload.find((p: any) => p.dataKey === 'current');

            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-800 mb-2">{required?.payload.dimension}</p>
                    <div className="space-y-1">
                        <p className="text-blue-600 font-medium">Required: {required?.value}%</p>
                        <p className="text-green-600 font-medium">Current: {current?.value}%</p>
                        <p className="text-gray-500 text-sm">
                            Gap: {(required?.value || 0) - (current?.value || 0) > 0 ? '+' : ''}{(required?.value || 0) - (current?.value || 0)}%
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4 text-center">Loading skill data...</p>
                </div>
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
    const currentEmployeeData = employeeData[selectedCategory] || [];

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Job Role Competancy Composition
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Analyze skill distributions across different job role categories
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    {/* Category Selector */}
                    <div className="mb-8">
                        <label htmlFor="category-select" className="block text-sm font-semibold text-gray-700 mb-3">
                            Select Job Role Category
                        </label>
                        <div className="relative">
                            <select
                                id="category-select"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 pr-10 text-sm text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-400 shadow-sm hover:shadow-md"
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Radar Chart */}
                    {currentData.length > 0 ? (
                        <div className="w-full">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                                {selectedCategory} - Skill Distribution
                            </h2>

                            <div className="h-96 md:h-[500px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={currentData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                                        <PolarGrid
                                            stroke="#e5e7eb"
                                            strokeWidth={1}
                                            className="opacity-60"
                                        />
                                        <PolarAngleAxis
                                            dataKey="dimension"
                                            tick={{
                                                fontSize: 14,
                                                fontWeight: 600,
                                                fill: '#374151'
                                            }}
                                            className="text-gray-700"
                                        />
                                        <PolarRadiusAxis
                                            angle={90}
                                            domain={[0, 100]}
                                            tick={{
                                                fontSize: 12,
                                                fill: '#6b7280'
                                            }}
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
                                                r: 6
                                            }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Legend */}
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

                {/* Employee Analysis Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <div className="flex items-center mb-6">
                        <User className="h-6 w-6 text-indigo-600 mr-3" />
                        <h3 className="text-2xl font-bold text-gray-800">Employee Analysis</h3>
                    </div>

                    {currentEmployeeData.length > 0 ? (
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Employee vs Required Radar Chart */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                                    Current vs Required Skills
                                </h4>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={currentEmployeeData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                                            <PolarGrid stroke="#e5e7eb" strokeWidth={1} className="opacity-60" />
                                            <PolarAngleAxis
                                                dataKey="dimension"
                                                tick={{ fontSize: 12, fontWeight: 600, fill: '#374151' }}
                                            />
                                            <PolarRadiusAxis
                                                angle={90}
                                                domain={[0, 100]}
                                                tick={{ fontSize: 10, fill: '#6b7280' }}
                                                tickCount={6}
                                            />
                                            <Radar
                                                name="Required"
                                                dataKey="required"
                                                stroke="#3b82f6"
                                                fill="#3b82f6"
                                                fillOpacity={0.1}
                                                strokeWidth={2}
                                                dot={{ fill: '#1d4ed8', strokeWidth: 2, stroke: '#ffffff', r: 4 }}
                                            />
                                            <Radar
                                                name="Current"
                                                dataKey="current"
                                                stroke="#10b981"
                                                fill="#10b981"
                                                fillOpacity={0.1}
                                                strokeWidth={2}
                                                dot={{ fill: '#059669', strokeWidth: 2, stroke: '#ffffff', r: 4 }}
                                            />
                                            <Tooltip content={<EmployeeTooltip />} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Legend */}
                                <div className="flex justify-center space-x-6 mt-4">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                                        <span className="text-sm text-gray-600">Required</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                                        <span className="text-sm text-gray-600">Current Level</span>
                                    </div>
                                </div>
                            </div>

                            {/* Skill Gap Analysis */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-700 mb-4">Skill Gap Analysis</h4>
                                <div className="space-y-3">
                                    {currentEmployeeData.map((item) => {
                                        const gap = item.required - item.current;
                                        const isDeficit = gap > 0;
                                        const isSurplus = gap < 0;

                                        return (
                                            <div key={item.dimension} className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-gray-800">{item.dimension}</span>
                                                    <div className="flex items-center">
                                                        {isDeficit && <AlertTriangle className="h-4 w-4 text-orange-500 mr-1" />}
                                                        {isSurplus && <TrendingUp className="h-4 w-4 text-green-500 mr-1" />}
                                                        <span className={`text-sm font-semibold ${isDeficit ? 'text-orange-600' :
                                                            isSurplus ? 'text-green-600' : 'text-gray-600'
                                                            }`}>
                                                            {gap > 0 ? `+${gap}%` : gap < 0 ? `${gap}%` : 'On Target'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-4 text-sm">
                                                    <div className="flex items-center">
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                                                        <span className="text-gray-600">Required: {item.required}%</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                                                        <span className="text-gray-600">Current: {item.current}%</span>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                        <span>Progress</span>
                                                        <span>{Math.round((item.current / item.required) * 100)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${item.current >= item.required ? 'bg-green-500' :
                                                                item.current >= item.required * 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${Math.min(100, (item.current / item.required) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Overall Assessment */}
                                <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                                    <h5 className="font-semibold text-indigo-800 mb-2">Overall Assessment</h5>
                                    <p className="text-sm text-indigo-700">
                                        {(() => {
                                            const totalGap = currentEmployeeData.reduce((sum, item) => sum + Math.abs(item.required - item.current), 0);
                                            const avgGap = totalGap / currentEmployeeData.length;

                                            if (avgGap <= 5) return "Excellent match! Employee skills align well with job requirements.";
                                            if (avgGap <= 15) return "Good fit with minor skill gaps that can be addressed through training.";
                                            if (avgGap <= 25) return "Moderate skill gaps identified. Focused development plan recommended.";
                                            return "Significant skill gaps detected. Comprehensive training program needed.";
                                        })()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No employee data available for analysis</p>
                        </div>
                    )}
                </div>

                {/* Stats Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
                            <p className="text-sm text-gray-600">Job Categories</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{data.length}</p>
                            <p className="text-sm text-gray-600">Total Skills</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">5</p>
                            <p className="text-sm text-gray-600">Dimensions</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <p className="text-2xl font-bold text-orange-600">100%</p>
                            <p className="text-sm text-gray-600">Normalized</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;