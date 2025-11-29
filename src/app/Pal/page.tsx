// src/app/skillDashboard/page.tsx
"use client";

import React from "react";

export default function SkilldashboardPage() {
  return (
    <div className="w-full h-screen">
      <iframe
        src="https://learningagent-kxvkny4y8p5ud4abjappvx7.streamlit.app/"
        className="w-full h-full border-0"
        allow="fullscreen; clipboard-read; clipboard-write"
      />
    </div>
  );
}