"use client";
import React, { useState } from "react";
import { ChromePicker, ColorResult } from "react-color";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { Button } from "../../../ui/button";

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
    label: string;
}

export const ColorPicker = ({ color, onChange, label }: ColorPickerProps) => {
    const handleColorChange = (newColor: ColorResult) => {
        onChange(`rgba(${newColor.rgb.r}, ${newColor.rgb.g}, ${newColor.rgb.b}, ${newColor.rgb.a})`);
    };

    return (
        <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-slate-500">{label}</label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start h-9 px-3 rounded-xl border border-sky-100/60 bg-white/60 hover:bg-sky-50/50 hover:border-sky-300 shadow-sm transition-all focus:ring-1 focus:ring-sky-500 group">
                        <div
                            className="w-4 h-4 rounded-full border border-sky-200/50 shadow-sm mr-2 transition-transform group-hover:scale-110"
                            style={{ backgroundColor: color || "#000000" }}
                        />
                        <span className="text-sm font-medium text-slate-700 group-hover:text-sky-700 truncate">{color || "Default"}</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] ring-1 ring-black/[0.03] rounded-2xl overflow-hidden" align="start">
                    <ChromePicker color={color || "#000000"} onChange={handleColorChange} />
                </PopoverContent>
            </Popover>
        </div>
    );
};
