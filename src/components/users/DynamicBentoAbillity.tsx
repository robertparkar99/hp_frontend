import { useMemo } from "react";

const getSpanByLength = (text: string) => {
  const length = text.length;
  if (length < 50) return { colSpan: 1, rowSpan: 1 };
  if (length < 90) return { colSpan: 2, rowSpan: 1 };
  if (length < 120) return { colSpan: 2, rowSpan: 2 };
  return { colSpan: 3, rowSpan: 2 };
};

const randomAlignment = () => {
  const alignments = ["center"];
  const justifies = ["center"];
  return {
    alignItems: alignments[Math.floor(Math.random() * alignments.length)],
    justifyContent: justifies[Math.floor(Math.random() * justifies.length)],
  };
};

export default function DynamicBentoGrid({ items }: { items: string[] }) {
  const layoutData = useMemo(
    () =>
      items.map((text) => ({
        ...getSpanByLength(text),
        ...randomAlignment(),
      })),
    [items]
  );

  return (
    <div className="grid grid-cols-6 auto-rows-[80px] grid-flow-dense gap-3 h-[280px] w-full overflow-y-auto hide-scrollbar">
      {items.map((text, index) => {
        const {
          colSpan,
          rowSpan,
          alignItems,
          justifyContent,
        } = layoutData[index];

        return (
          <div
            key={index}
            className={`col-span-${colSpan} row-span-${rowSpan} bg-[#007BE5] text-white rounded-xl p-4 flex text-[14px] font-normal font-inter text-center overflow-hidden`}
            style={{
              alignItems,
              justifyContent,
              boxShadow: 
    'inset 0 4px 4px rgba(255, 255, 255, 0.25), ' +
    '0 4px 4px rgba(195, 255, 245, 0.35)',
    fontFamily: 'Inter, sans-serif',
            }}
          >
            <p className="w-full leading-tight">{text}</p>
          </div>
        );
      })}
    </div>
  );
}
    