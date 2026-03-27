"use client";
import React from "react";
import { Input } from "../../../ui/input";

interface SpacingControlProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
}

export const SpacingControl = ({ value, onChange, label }: SpacingControlProps) => {
    // Basic implementation handling standard CSS pixel strings
    const numValue = value ? value.replace("px", "") : "";

    return (
        <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-slate-500">{label}</label>
            <div className="flex items-center space-x-2">
                <Input
                    type="number"
                    value={numValue}
                    onChange={(e) => onChange(e.target.value ? `${e.target.value}px` : "")}
                    className="h-9 w-full rounded-xl border-sky-100/60 bg-white/60 hover:bg-sky-50/50 hover:border-sky-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm font-medium text-slate-700 shadow-sm transition-all px-3 outline-none"
                    placeholder="0"
                />
                <span className="text-xs font-semibold text-slate-400">px</span>
            </div>
        </div>
    );
};
