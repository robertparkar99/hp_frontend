import React from 'react';

export default function Index() {
    return (
        <>
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Main container matching the Figma layout */}
                    <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">

                        {/* Left Panel - Skill Proficiency Overview */}
                        <div className="w-full xl:w-[280px] bg-white rounded-2xl border-2 border-[#D4EBFF] shadow-lg p-4">
                            <h2 className="text-[#23395B] font-bold text-md mb-3" style={{
                                fontFamily: 'Inter, sans-serif',
                            }}>
                                📈 Skill Proficiency Overview
                            </h2>

                            {/* Separator line */}
                            <div className="w-full h-0.5 bg-[#686868] mb-8"></div>

                            {/* Radial Chart Container */}
                            <div className="flex justify-center mb-8">
                                <div className="relative w-44 h-44">
                                    {/* Radial Chart SVG */}
                                    <svg className="w-full h-full" viewBox="0 0 222 222" fill="none">
                                        {/* Outer ring - light purple */}
                                        <path
                                            opacity="0.1"
                                            d="M111 4.43945C132.076 4.43945 152.678 10.6891 170.202 22.398C187.725 34.107 201.383 50.7494 209.449 70.2207C217.514 89.692 219.624 111.118 215.512 131.788C211.401 152.459 201.252 171.446 186.349 186.349C171.447 201.251 152.459 211.4 131.789 215.512C111.118 219.624 89.6925 217.513 70.2213 209.448C50.75 201.383 34.1076 187.725 22.3986 170.201C10.6896 152.677 4.44 132.075 4.44 110.999H13.6955C13.6955 130.244 19.4023 149.057 30.0943 165.059C40.7862 181.061 55.9831 193.532 73.7632 200.897C91.5432 208.262 111.108 210.189 129.983 206.434C148.858 202.68 166.196 193.412 179.805 179.804C193.413 166.196 202.68 148.858 206.435 129.983C210.189 111.107 208.262 91.5427 200.898 73.7626C193.533 55.9826 181.061 40.7857 165.059 30.0937C149.058 19.4018 130.245 13.6949 111 13.6949V4.43945Z"
                                            fill="#8979FF"
                                        />

                                        {/* Main progress ring - purple */}
                                        <path
                                            d="M111 4.43945C126.174 4.43945 141.173 7.68025 154.994 13.945C168.814 20.2097 181.138 29.354 191.139 40.7658C201.14 52.1776 208.589 65.5938 212.987 80.1168C217.384 94.6397 218.63 109.934 216.639 124.977C214.649 140.021 209.468 154.465 201.445 167.344C193.421 180.224 182.74 191.241 170.114 199.659C157.489 208.077 143.212 213.701 128.238 216.156C113.263 218.611 97.9374 217.839 83.2855 213.892L85.6927 204.955C99.072 208.559 113.067 209.264 126.74 207.022C140.414 204.781 153.451 199.645 164.98 191.958C176.509 184.271 186.262 174.211 193.589 162.45C200.916 150.69 205.646 137.5 207.464 123.763C209.281 110.027 208.144 96.0607 204.128 82.7992C200.113 69.5376 193.311 57.2867 184.178 46.8661C175.046 36.4454 163.793 28.0955 151.173 22.3749C138.553 16.6543 124.856 13.6949 111 13.6949V4.43945Z"
                                            fill="#8979FF"
                                        />

                                        {/* Skill labels */}
                                        <text x="72" y="16" className="fill-black text-xs " style={{
                                            fontFamily: 'Inter, sans-serif',
                                        }}>Figma</text>
                                        <text x="68" y="30" className="fill-black text-xs " style={{
                                            fontFamily: 'Inter, sans-serif',
                                        }}>Sketch</text>
                                        <text x="90" y="44" className="fill-black text-xs " style={{
                                            fontFamily: 'Inter, sans-serif',
                                        }}>XD</text>
                                        <text x="91" y="58" className="fill-black text-xs " style={{
                                            fontFamily: 'Inter, sans-serif',
                                        }}>PS</text>
                                        <text x="95" y="72" className="fill-black text-xs " style={{
                                            fontFamily: 'Inter, sans-serif',
                                        }}>AI</text>
                                        <text x="42" y="86" className="fill-black text-xs " style={{
                                            fontFamily: 'Inter, sans-serif',
                                        }}>CorelDRAW</text>
                                    </svg>
                                </div>
                            </div>

                            {/* Progress Indicators */}
                            <div className="space-y-4">
                                {/* Python Progress */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                        <img src="/image 14.png" alt="Python Icon" className="w-10 h-10" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-[#393939] font-bold text-base mb-1" style={{
                                            fontFamily: 'Inter, sans-serif',
                                        }}>Python</h4>
                                        <div className="w-full bg-blue-100 rounded-full h-2">
                                            <div className="bg-[#1877CC] h-2 rounded-full" style={{ width: '83%' }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Java Progress */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                        <img src="/image 14 (1).png" alt="Java Icon" className="w-10 h-10" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-[#393939] font-bold text-base mb-1" style={{
                                            fontFamily: 'Inter, sans-serif',
                                        }}>Java</h4>
                                        <div className="w-full bg-blue-100 rounded-full h-2">
                                            <div className="bg-[#1877CC] h-2 rounded-full" style={{ width: '78%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center Panel - Question and Illustration */}
                        <div className="flex-1 min-h-[472px] flex flex-col justify-between">
                            <div className="bg-white rounded-2xl p-4 shadow-sm">
                                <h1 className="text-[#393939] font-bold text-xl md:text-[14px] mb-12 leading-tight" style={{
                                    fontFamily: 'Inter, sans-serif',
                                }}>
                                    Are you proficient in writing semantic and well-structured HTML?
                                </h1>

                                {/* Illustration */}
                                <div className="flex justify-center mb-12">
                                    <div className="w-80 h-80 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center relative overflow-hidden">
                                        {/* Karate person illustration using SVG */}
                                        <img src="/Illustration.png" alt="Karate Illustration" className="w-full h-full object-cover" />

                                    </div>
                                </div>

                                {/* Yes/No Buttons */}
                                <div className="flex justify-center gap-12">
                                    <button className="w-20 h-10 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                                        <span className="text-[#C1C1C1] font-bold text-xl" style={{
                                            fontFamily: 'Inter, sans-serif',
                                        }}>Yes</span>
                                    </button>
                                    <button className="w-20 h-10 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                                        <span className="text-[#C1C1C1] font-bold text-xl" style={{
                                            fontFamily: 'Inter, sans-serif',
                                        }}>No</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Skill Sets */}
                        <div className="w-full xl:w-[280px] bg-white rounded-l-2xl xl:rounded-l-none xl:rounded-r-2xl border-l-4 border-[#47A0FF] shadow-sm relative">
                            {/* Blue accent bar */}
                            <div className="absolute left-0 top-0 w-4 h-full bg-[#47A0FF] rounded-l-2xl xl:rounded-l-none"></div>

                            <div className="pl-8 pr-4 py-4">
                                <h2 className="text-[#23395B] font-bold text-base mb-6" style={{
                                    fontFamily: 'Inter, sans-serif',
                                }}>
                                    🧭 Explore Your Skill Sets
                                </h2>

                                {/* Skill Categories */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-[#393939] text-sm mb-3" style={{
                                            fontFamily: 'Inter, sans-serif',
                                        }}>🖥️ Technical Skills</h3>
                                        <div className="h-0.5 bg-[#DDD] mb-4"></div>
                                    </div>

                                    <div>
                                        <h3 className="text-[#393939] text-sm mb-3" style={{
                                            fontFamily: 'Inter, sans-serif',
                                        }}>🎨 Frontend Development</h3>
                                        <div className="h-0.5 bg-[#DDD] mb-4"></div>
                                    </div>

                                    <div>
                                        <h3 className="text-[#393939] text-sm mb-3" style={{
                                            fontFamily: 'Inter, sans-serif',
                                        }}>🖥️ Technical Skills</h3>
                                        <div className="h-0.5 bg-[#DDD] mb-4"></div>
                                    </div>

                                    <div>
                                        <h3 className="text-[#393939] text-sm mb-3" style={{
                                            fontFamily: 'Inter, sans-serif',
                                        }}>🎨 Frontend Development</h3>
                                        <div className="h-0.5 bg-[#DDD] mb-4"></div>
                                    </div>

                                    <div>
                                        <h3 className="text-[#393939] text-sm" style={{
                                            fontFamily: 'Inter, sans-serif',
                                        }}>🖥️ Technical Skills</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="min-h-screen bg-gray-50 p-4" style={{
                fontFamily: 'Inter, sans-serif',
            }}>
                <div className="max-w-7xl mx-auto px-4">
                    {/* Main Question */}
                    <div className="text-center mb-6">
                        <h1 className="text-[17px] font-bold text-[#393939] leading-normal" style={{
                            fontFamily: 'Inter, sans-serif',
                        }}>
                            Are you proficient in writing semantic and well-structured HTML?
                        </h1>
                    </div>

                    {/* Main Container */}
                    <div className="relative flex flex-col xl:flex-row gap-6 xl:gap-0">
                        {/* Left Panel - Skill Proficiency Overview */}
                        <div className="xl:w-72 lg:w-80 w-full bg-white border-2 border-[#D4EBFF] rounded-tl-[15px] xl:rounded-tr-none rounded-tr-[15px] xl:rounded-bl-none rounded-bl-[15px] xl:rounded-br-none shadow-[2px_0_4px_0_rgba(0,0,0,0.10)] relative">
                            <div className="p-6">
                                {/* Header */}
                                <h2 className="text-[16px] font-bold text-[#23395B] leading-normal mb-4" style={{
                                    fontFamily: 'Inter, sans-serif',
                                }}>
                                    📈 Skill Proficiency Overview
                                </h2>

                                {/* Divider */}
                                <div className="w-full h-0.5 bg-[#686868] mb-6"></div>

                                {/* Pie Chart Section */}
                                <div className="relative h-[200px] mb-6">
                                    {/* Central Pie Chart */}
                                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <img
                                            src="https://api.builder.io/api/v1/image/assets/TEMP/8a64add2544c8057fdaef8a7f7ae6256fd7f4b8d?width=400"
                                            alt="Skill Proficiency Chart"
                                            className="w-[140px] h-[110px]"
                                        />
                                    </div>

                                    {/* Tech Icons Around Chart */}
                                    <img
                                        src="https://api.builder.io/api/v1/image/assets/TEMP/7733ce1a7f43bfce0db97c54bcd66057ab988bd4?width=98"
                                        alt="Python"
                                        className="absolute left-0 top-[60px] w-[32px] h-[32px]"
                                    />
                                    <img
                                        src="https://api.builder.io/api/v1/image/assets/TEMP/43d857b966544707bb048f9bf5a383228243ae0a?width=98"
                                        alt="Tech Icon"
                                        className="absolute right-0 top-[90px] w-[32px] h-[32px]"
                                    />
                                    <img
                                        src="https://api.builder.io/api/v1/image/assets/TEMP/02502bbfd1dcd91a92cf17855c7d970815409180?width=96"
                                        alt="Tech Icon"
                                        className="absolute left-[60px] top-[160px] w-[32px] h-[40px]"
                                    />
                                    <img
                                        src="https://api.builder.io/api/v1/image/assets/TEMP/9906ce9ef7c7c66c7560f38cdc8da9b3e143bfdd?width=96"
                                        alt="Tech Icon"
                                        className="absolute left-[75px] top-[5px] w-[32px] h-[40px]"
                                    />
                                    <img
                                        src="https://api.builder.io/api/v1/image/assets/TEMP/86130f1afd317a8fda069747a8936ae46692bcc2?width=96"
                                        alt="Tech Icon"
                                        className="absolute left-[155px] top-0 w-[32px] h-[40px]"
                                    />
                                    <img
                                        src="https://api.builder.io/api/v1/image/assets/TEMP/021ebbe59ce14c67255567fe116164cb2c63a2ff?width=96"
                                        alt="Tech Icon"
                                        className="absolute left-[155px] top-[145px] w-[32px] h-[40px]"
                                    />
                                </div>

                                {/* Progress Indicators */}
                                <div className="space-y-4">
                                    {/* Python Progress */}
                                    <div className="flex items-center gap-4">
                                        <img
                                            src="https://api.builder.io/api/v1/image/assets/TEMP/7733ce1a7f43bfce0db97c54bcd66057ab988bd4?width=98"
                                            alt="Python"
                                            className="w-[32px] h-[32px]"
                                        />
                                        <div className="flex-1">
                                            <div className="text-[14px] font-bold text-[#393939] font-inter mb-1">Python</div>
                                            <div className="w-[120px] h-[8px] bg-[rgba(71,160,255,0.45)] rounded-[15px] relative">
                                                <div className="w-[100px] h-[8px] bg-[#1877CC] rounded-[15px]"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Java Progress */}
                                    <div className="flex items-center gap-4">
                                        <img
                                            src="https://api.builder.io/api/v1/image/assets/TEMP/cc922d0dbaa313d94f724c11e8bec51e49d51611?width=98"
                                            alt="Java"
                                            className="w-[32px] h-[32px]"
                                        />
                                        <div className="flex-1">
                                            <div className="text-[14px] font-bold text-[#393939] font-inter mb-1">Java</div>
                                            <div className="w-[120px] h-[8px] bg-[rgba(71,160,255,0.45)] rounded-[15px] relative">
                                                <div className="w-[95px] h-[8px] bg-[#1877CC] rounded-[15px]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center Panel - Main Content */}
                        <div className="flex-1 xl:px-16 lg:px-12 px-4">
                            {/* Illustration */}
                            <div className="flex justify-center mb-6">
                                <img
                                    src="https://api.builder.io/api/v1/image/assets/TEMP/34949dc3e87cf87240d386ad2723161e00e125e2?width=600"
                                    alt="Learning Illustration"
                                    className="w-[300px] h-[300px]"
                                />
                            </div>

                            {/* Yes/No Buttons */}
                            <div className="flex justify-center gap-[40px] mt-20">
                                <button className="flex items-center justify-center w-[100px] h-[35px] bg-white rounded-[20px] shadow-[-4px_-4px_4px_0_rgba(225,225,225,0.25),4px_4px_10px_0_rgba(0,0,0,0.20)] hover:scale-105 transition-transform">
                                    <span className="text-[18px] font-bold text-[#C1C1C1] font-inter">Yes</span>
                                </button>
                                <button className="flex items-center justify-center w-[100px] h-[35px] bg-white rounded-[20px] shadow-[-4px_-4px_4px_0_rgba(225,225,225,0.25),4px_4px_10px_0_rgba(0,0,0,0.20)] hover:scale-105 transition-transform">
                                    <span className="text-[18px] font-bold text-[#C1C1C1] font-inter">No</span>
                                </button>
                            </div>
                        </div>

                        {/* Right Panel - Skill Sets */}
                        <div className="xl:w-72 lg:w-80 w-full bg-white border-2 border-[#D4EBFF] rounded-tr-[15px] xl:rounded-tl-none rounded-tl-[15px] xl:rounded-bl-none rounded-bl-[15px] xl:rounded-br-none shadow-[2px_0_4px_0_rgba(0,0,0,0.10)]">
                            <div className="p-6">
                                {/* Header */}
                                <h2 className="text-[16px] font-bold text-[#23395B] leading-normal font-inter mb-4">
                                    🧭 Explore Your Skill Sets
                                </h2>

                                {/* Divider */}
                                <div className="w-full h-0.5 bg-[#686868] mb-6"></div>

                                {/* Skill Categories */}
                                <div className="space-y-4">
                                    <div className="text-[14px] text-[#393939] font-inter">
                                        🖥️ Technical Skills
                                    </div>
                                    <div className="text-[14px] text-[#393939] font-inter">
                                        🎨 Frontend Development
                                    </div>
                                    <div className="text-[14px] text-[#393939] font-inter">
                                        🖥️ Technical Skills
                                    </div>
                                    <div className="text-[14px] text-[#393939] font-inter">
                                        🎨 Frontend Development
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
