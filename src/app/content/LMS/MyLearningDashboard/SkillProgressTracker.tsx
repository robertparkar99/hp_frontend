import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { Code, BarChart3, Users, Brain, ChevronRight } from "lucide-react";

// Type definitions
interface Skill {
    skill_name: string;
    sub_category: string;
    progress_percentage: number;
    proficiency_level: 'Beginner' | 'Intermediate' | 'Advanced';
    courses_completed: number;
    total_courses: number;
    status: string;
    icon: string;
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

interface Overall {
    overall_progress_percentage: number;
    total_skills: number;
    skills_in_progress: number;
    average_progress: number;
}

interface ApiResponse {
    status: boolean;
    message: string;
    data: {
        skill_progress: Omit<Skill, 'icon' | 'color'>[];
        overall: Overall;
    };
}

// Icon mapper component
const SkillIcon = ({ name, size = 18, className = '' }: { name: string; size?: number; className?: string }) => {
    const iconProps = { size, className };

    switch (name.toLowerCase()) {
        case 'code':
            return <Code {...iconProps} />;
        case 'barchart3':
        case 'bar-chart-3':
            return <BarChart3 {...iconProps} />;
        case 'users':
            return <Users {...iconProps} />;
        case 'brain':
            return <Brain {...iconProps} />;
        default:
            return <Code {...iconProps} />;
    }
};

// Helper functions to assign icon and color based on skill name
const getSkillIcon = (skillName: string): string => {
    const lower = skillName.toLowerCase();
    if (lower.includes('digital')) return 'code';
    if (lower.includes('functional')) return 'bar-chart-3';
    if (lower.includes('leadership')) return 'users';
    if (lower.includes('soft')) return 'brain';
    if (lower.includes('technical')) return 'code';
    return 'code';
};

const getSkillColor = (skillName: string): Skill['color'] => {
    const lower = skillName.toLowerCase();
    if (lower.includes('digital')) return 'primary';
    if (lower.includes('functional')) return 'secondary';
    if (lower.includes('leadership')) return 'warning';
    if (lower.includes('soft')) return 'success';
    if (lower.includes('technical')) return 'danger';
    return 'primary';
};

const SkillProgressTracker: React.FC = () => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [overall, setOverall] = useState<Overall | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [sessionData, setSessionData] = useState({
        url: '',
        token: '',
        subInstituteId: '',
        orgType: '',
        userId: '',
    });

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const { APP_URL, token, sub_institute_id, org_type, user_id } = JSON.parse(userData);
            setSessionData({
                url: APP_URL,
                token,
                subInstituteId: sub_institute_id,
                orgType: org_type,
                userId: user_id,
            });
        }
    }, []);

    useEffect(() => {
        if (!sessionData.url) return;

        const fetchSkillProgress = async () => {
            try {
                const response = await fetch(`${sessionData.url}/api/skill-development/progress?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.subInstituteId}&user_id=${sessionData.userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch skill progress');
                }
                const data: ApiResponse = await response.json();
                if (data.status) {
                    const mappedSkills: Skill[] = data.data.skill_progress.map((skill) => ({
                        ...skill,
                        icon: getSkillIcon(skill.skill_name),
                        color: getSkillColor(skill.skill_name),
                    }));
                    setSkills(mappedSkills);
                    setOverall(data.data.overall);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError('Error fetching data');
            } finally {
                setLoading(false);
            }
        };

        fetchSkillProgress();
    }, [sessionData]);

    if (loading) {
        return (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="text-center text-red-500">{error}</div>
            </div>
        );
    }

    if (!overall) return null;

    const getColorClass = (color: Skill['color']): string => {
        switch (color) {
            case 'primary': return 'text-blue-500';
            case 'secondary': return 'text-purple-500';
            case 'success': return 'text-emerald-500';
            case 'warning': return 'text-amber-500';
            case 'danger': return 'text-red-500';
            default: return 'text-blue-500';
        }
    };

    const getBackgroundColorClass = (color: Skill['color']): string => {
        switch (color) {
            case 'primary': return 'bg-blue-100';
            case 'secondary': return 'bg-purple-100';
            case 'success': return 'bg-emerald-100';
            case 'warning': return 'bg-amber-100';
            case 'danger': return 'bg-red-100';
            default: return 'bg-blue-100';
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Skill Development</h2>
                <button className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center">
                    View All
                    <ChevronRight size={16} className="ml-1" />
                </button>
            </div>

            <div className="space-y-6">
                {skills.map((skill, index) => (
                    <div key={index} className="space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getBackgroundColorClass(skill.color)}`}>
                                    <SkillIcon
                                        name={skill.icon}
                                        size={18}
                                        className={getColorClass(skill.color)}
                                    />
                                </div>
                                <div className="flex-1">
                                    {/* Primary: Skill Name */}
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        {skill.skill_name}
                                    </h3>

                                    {/* Secondary: Sub Category */}
                                    <h5 className="text-xs font-normal text-gray-500">
                                        {skill.sub_category}
                                    </h5>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-900 mb-1">
                                    {skill.progress_percentage}%
                                </div>
                                <div className="w-12 h-12 relative">
                                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 100 100">
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            className="text-gray-200"
                                        />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray="251.2"
                                            strokeDashoffset={251.2 - (skill.progress_percentage / 100) * 251.2}
                                            className={getColorClass(skill.color)}
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="ml-12">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className={`px-2 py-1 rounded-lg font-medium ${skill.proficiency_level === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
                                        skill.proficiency_level === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
                                            'bg-red-100 text-red-700'
                                    }`}>
                                    {skill.proficiency_level}
                                </span>
                                <span className="text-gray-500">
                                    {skill.courses_completed}/{skill.total_courses} courses
                                </span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Progress</span>
                                    <span className="font-medium text-gray-700">{skill.progress_percentage}%</span>
                                </div>
                                <Progress value={skill.progress_percentage} className="h-2" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Overall Skill Progress</p>
                    <div className="flex justify-center items-center space-x-4">
                        <div className="relative">
                            <div className="w-20 h-20 relative">
                                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="none"
                                        className="text-gray-200"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray="251.2"
                                        strokeDashoffset={251.2 - (overall.overall_progress_percentage / 100) * 251.2}
                                        className="text-blue-500"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-bold text-gray-900">{overall.overall_progress_percentage}%</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-left">
                            <p className="text-sm text-gray-500">{overall.skills_in_progress} skills in progress</p>
                            <p className="text-xs text-gray-500 mt-1">Average across all skills</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkillProgressTracker;
