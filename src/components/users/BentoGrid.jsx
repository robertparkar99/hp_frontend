// components/BentoGrid.jsx
export function BentoGrid({ children }) {
    return (
        <div className="grid grid-cols-4 gap-3 h-[280px] overflow-hidden">
            {children}
        </div>
    );
}

export function BentoItem({ children }) {
    return (
        <div className="bg-[#007BE5] text-white font-bold text-[11px] leading-tight text-center rounded-[12px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25),0px_2px_2px_0px_rgba(195,255,245,0.35)_inset] p-3 flex items-center justify-center h-full">
            {children}
        </div>
    );
}
