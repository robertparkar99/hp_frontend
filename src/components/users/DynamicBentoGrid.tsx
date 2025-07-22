import { useMemo } from "react";

const generateSpans = (count: number) => {
  const spanOptions = [1, 2, 3];
  return Array.from({ length: count }, () => ({
    colSpan: spanOptions[Math.floor(Math.random() * spanOptions.length)],
    rowSpan: spanOptions[Math.floor(Math.random() * spanOptions.length)],
  }));
};

export default function DynamicBentoGrid({ items }: { items: string[] }) {
  // Only run once per mount
  const spans = useMemo(() => generateSpans(items.length), [items.length]);

  return (
    <div className="grid grid-cols-6 auto-rows-[80px] grid-flow-dense gap-3 h-[280px] w-full overflow-y-auto hide-scrollbar">
      {items.map((text, index) => {
        const { colSpan, rowSpan } = spans[index];
        return (
          <div
            key={index}
            className={`col-span-${colSpan} row-span-${rowSpan} bg-[#007BE5] text-white rounded-xl p-3 flex items-center justify-center text-[11px] font-bold leading-tight text-center overflow-hidden`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p className="line-clamp-3">{text}</p>
          </div>
        );
      })}
    </div>
  );
}
