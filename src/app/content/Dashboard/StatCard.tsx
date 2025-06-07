"use client";

import * as React from "react";

interface StatCardProps {
  title: string;
  value: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <article className="flex overflow-hidden flex-col grow  py-4 w-full bg-blue-400 rounded-xl shadow-[0px_4px_4px_rgba(71,160,255,0.45)]">
      <header className="text-1xl text-center text-stone-800">{title}</header>
      <p className="self-center mt-1 text-3xl font-bold text-white max-md:text-4xl">
        {value}
      </p>
    </article>
  );
};
