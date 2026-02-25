"use client";

import { useState, useEffect } from "react";

const Loading = () => {
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        setSession(userData);
    }, []);

    return (<div
        className="overloadGif flex items-center justify-center w-full h-screen z-[1000] bg-white overflow-hidden"
        id="overloadGif"
    >
        <div className="flex flex-col items-center justify-center min-h-screen bg-white space-y-6">
            {/* Glowing Ring Spinner */}
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-l-blue-500 animate-spin shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
                <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-900"></div>
            </div>

            {/* Animated Text */}
            <p className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-bluse-500 text-transparent bg-clip-text animate-pulse tracking-wide">
                Loading Please Wait...
            </p>

            {/* Optional subtitle or loader bar */}
            <div className="w-40 h-2 bg-gradient-to-r from-blue-400 via-bluse-400 to-blue-400 rounded-full animate-pulse"></div>
        </div>
    </div>);
}

export default Loading;