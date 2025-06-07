"use client";

import * as React from "react";
import { StatCard } from "./StatCard";

export const StatGrid: React.FC = () => {
  return (
    <section className="flex gap-5 max-md:flex-col">
      <div className="w-3/12 max-md:ml-0 max-md:w-full">
        <StatCard title="Total Skills" value="126" />
      </div>
      <div className="ml-5 w-3/12 max-md:ml-0 max-md:w-full">
        <StatCard title="Mapped Skills" value="78" />
      </div>
      <div className="ml-5 w-3/12 max-md:ml-0 max-md:w-full">
        <StatCard title="Unmapped Skills" value="48" />
      </div>
      <div className="ml-5 w-3/12 max-md:ml-0 max-md:w-full">
        <StatCard title="Most Used Skills" value="10" />
      </div>
    </section>
  );
};
