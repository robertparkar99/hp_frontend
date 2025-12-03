import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Code, BarChart3, Users, Brain, ChevronRight } from "lucide-react";

// Type definitions
interface Skill {
    id: number;
    name: string;
    category: string;
    progress: number;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    coursesCompleted: number;
    totalCourses: number;
    icon: string;
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
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

const SkillProgressTracker: React.FC = () => {
    const skills: Skill[] = [
        {
            id: 1,
            name: "React Development",
            category: "Frontend",
            progress: 85,
            level: "Advanced",
            coursesCompleted: 8,
            totalCourses: 12,
            icon: "code",
            color: "primary"
        },
        {
            id: 2,
            name: "Data Analysis",
            category: "Analytics",
            progress: 65,
            level: "Intermediate",
            coursesCompleted: 5,
            totalCourses: 9,
            icon: "bar-chart-3",
            color: "secondary"
        },
        {
            id: 3,
            name: "Project Management",
            category: "Leadership",
            progress: 45,
            level: "Beginner",
            coursesCompleted: 3,
            totalCourses: 8,
            icon: "users",
            color: "warning"
        },
        {
            id: 4,
            name: "Machine Learning",
            category: "AI/ML",
            progress: 30,
            level: "Beginner",
            coursesCompleted: 2,
            totalCourses: 10,
            icon: "brain",
            color: "success"
        }
    ];

    // Calculate overall progress
    const overallProgress = Math.round(skills.reduce((acc, skill) => acc + skill.progress, 0) / skills.length);

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
                {skills.map((skill) => (
                    <div key={skill.id} className="space-y-3">
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
                                    <h3 className="font-medium text-gray-900">{skill.name}</h3>
                                    <p className="text-sm text-gray-500">{skill.category}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-900 mb-1">
                                    {skill.progress}%
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
                                            strokeDashoffset={251.2 - (skill.progress / 100) * 251.2}
                                            className={getColorClass(skill.color)}
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="ml-12">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className={`px-2 py-1 rounded-lg font-medium ${
                                    skill.level === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
                                    skill.level === 'Intermediate' ? 'bg-amber-100 text-amber-700' : 
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {skill.level}
                                </span>
                                <span className="text-gray-500">
                                    {skill.coursesCompleted}/{skill.totalCourses} courses
                                </span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Progress</span>
                                    <span className="font-medium text-gray-700">{skill.progress}%</span>
                                </div>
                                <Progress value={skill.progress} className="h-2" />
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
                                        strokeDashoffset={251.2 - (overallProgress / 100) * 251.2}
                                        className="text-blue-500"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-bold text-gray-900">{overallProgress}%</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-left">
                            <p className="text-sm text-gray-500">{skills.length} skills in progress</p>
                            <p className="text-xs text-gray-500 mt-1">Average across all skills</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkillProgressTracker;