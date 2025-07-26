import { ArrowLeft, Search, Filter, MoreVertical, User, Upload, Shield, CheckSquare, BarChart3, Star } from 'lucide-react';
import { useState } from 'react';

export default function Index() {
    const [activeSection, setActiveSection] = useState<string>('description');


    const navItems = [
        { icon: User, label: 'Personal Details', active: false },
        { icon: Upload, label: 'Upload Document', active: false },
        { icon: Shield, label: 'Job role Skills', active: false },
        { icon: CheckSquare, label: 'Job role Task', active: false },
        { icon: BarChart3, label: 'level of Responsibility', active: true },
        { icon: Star, label: 'Skill Rating', active: false },
    ];

    const chevronSections = [
        {
            id: 'description',
            title: 'Description/\nGuidance notes',
            color: 'blue',
            bgColor: '#C3E0FF',
            borderColor: '#6BB2FD'
        },
        {
            id: 'responsibility',
            title: 'Responsibility Attribute',
            color: 'orange',
            bgColor: '#FFC8B8',
            borderColor: '#FF8360'
        },
        {
            id: 'business',
            title: 'Business skills /\nBehavioral factors',
            color: 'teal',
            bgColor: '#88E9D9',
            borderColor: '#38C0AA'
        }
    ];

    const renderDetailedContent = () => {
        if (activeSection !== 'description') return null;

        return (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                {/* Description Section */}
                <div className="bg-white border-2 border-blue-200 rounded-2xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-blue-500 px-10 py-5">
                        <h2 className="text-white text-3xl font-bold">Description</h2>
                    </div>
                    {/* Content */}
                    <div className="p-2">
                        <p className="text-gray-900 text-xl pl-2 leading-relaxed">
                            Essence of the level: Operates at the highest organizational level, determines overall organizational vision and strategy, and assumes accountability for overall success.
                        </p>
                    </div>
                </div>

                {/* Guidance Notes Section */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg">
                    {/* Background with gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-300"></div>
                    <div className="relative">
                        {/* Header */}
                        <div className="bg-blue-500 px-10 py-5">
                            <h2 className="text-white text-3xl font-bold">Guidance notes</h2>
                        </div>
                        {/* Content */}
                        <div className="p-10 relative">
                            <div className="flex items-start gap-8">
                                <div className="flex-1 space-y-6">
                                    <p className="text-gray-700 text-lg leading-relaxed">
                                        Levels represent levels of responsibility in the workplace. Each successive level describes increasing impact, responsibility and accountability. - Autonomy, influence and complexity are generic attributes that indicate the level of responsibility. - Business skills and behavioral factors describe the behaviors required to be effective at each level.
                                    </p>
                                    <p className="text-gray-700 text-lg leading-relaxed">
                                        - The knowledge attribute defines the depth and breadth of understanding required to perform and influence work effectively. Understanding these attributes will help you get the most out of levels. They are critical to understanding and applying the levels described in skill descriptions.
                                    </p>
                                </div>
                                {/* Illustration */}
                                <div className="flex-shrink-0">
                                    <div className="relative">
                                        <div className="w-32 h-32 bg-gradient-to-b from-teal-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                                            <img
                                                src="https://api.builder.io/api/v1/image/assets/TEMP/0d09b8bd96dc24810d8e067b4ad8fe1c6440e16e?width=200"
                                                alt="Guidance illustration"
                                                className="w-20 h-20 object-contain"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
            {/* Main Container */}
            <div className="max-w-7xl mx-auto">
                {/* Main Card */}
                <div className=" relative overflow-hidden">

                    {/* Main Content Area */}
                    <div className="px-4 lg:px-8 pb-6 lg:pb-8">
                        {/* Title and Progress */}
                        <div className="mb-6 lg:mb-8">

                            <h1 className="text-xl lg:text-2xl font-bold text-navy-900 mb-4 text-center leading-tight">
                                Level of Responsibility: Set strategy, inspire, mobilise
                            </h1>

                            {/* Progress Line */}
                            <div className="relative max-w-4xl mx-auto">
                                <div className="flex items-center justify-between">
                                    <div className="w-3 h-3 lg:w-4 lg:h-4 bg-gray-500 rounded-full"></div>
                                    <div className="flex-1 h-0.5 bg-gray-500"></div>
                                    <div className="w-3 h-3 lg:w-4 lg:h-4 bg-gray-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* Content Sections */}
                        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
                            {/* Left Side - Chevron Sections */}
                            <div className="w-full lg:w-auto lg:flex-shrink-0 space-y-4 lg:space-y-6">
                                {chevronSections.map((section, index) => (
                                    <div key={section.id} className="relative">
                                        <button
                                            onClick={() => setActiveSection(activeSection === section.id ? section.id : section.id)}
                                            className="relative w-full lg:w-80 hover:scale-105 transition-transform duration-200 cursor-pointer"
                                        >
                                            {/* Chevron Shape */}
                                            <svg
                                                className="w-full h-16 lg:h-20 drop-shadow-sm"
                                                viewBox="0 0 445 100"
                                                preserveAspectRatio="none"
                                            >
                                                <path
                                                    d="M4.06348 55.5869C0.352637 52.7863 0.352641 47.2137 4.06348 44.4131L59.7129 2.41309C60.9275 1.49641 62.408 1.00008 63.9297 1L437 1C440.866 1 444 4.134 444 8V92C444 95.866 440.866 99 437 99L63.9297 99C62.408 98.9999 60.9275 98.5036 59.7129 97.5869L4.06348 55.5869Z"
                                                    fill={section.bgColor}
                                                    stroke={section.borderColor}
                                                    strokeWidth="2"
                                                />
                                            </svg>

                                            {/* Text Content */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-center">
                                                    {section.title.split('\n').map((line, i) => (
                                                        <h3 key={i} className="text-xs lg:text-sm font-bold text-gray-800">
                                                            {line}
                                                        </h3>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Info Icon */}
                                            <div className="absolute right-2 lg:right-4 top-1/2 transform -translate-y-1/2">
                                                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                                                    <img
                                                        src="https://api.builder.io/api/v1/image/assets/TEMP/ef6e9025c3b14e8fc60bbee6856134ad094d0db9?width=91"
                                                        alt="Info"
                                                        className="w-3 h-3 lg:w-4 lg:h-4"
                                                    />
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Vertical Divider */}
                            <div className="hidden lg:block w-px h-72 bg-gray-400 mx-2"></div>

                            {/* Right Side - Content Area */}
                            <div className="w-full lg:flex-1 mt-6 lg:mt-0">
                                <div className="p-4 lg:p-0 min-h-[400px]">
                                    {activeSection ? (
                                        renderDetailedContent()
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center text-gray-500">
                                                <div className="mb-4">
                                                    <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <p className="text-lg font-medium mb-2">Select a section to view details</p>
                                                <p className="text-sm">Click on any of the sections on the left to see detailed information</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}