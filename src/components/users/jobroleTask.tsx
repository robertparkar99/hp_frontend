// 'use client';

// import React, { useEffect, useState } from "react";
// import { motion, useAnimation } from "framer-motion";
// import { useInView } from "react-intersection-observer";

// interface Task {
//   id: number;
//   critical_work_function: string;
//   task: string;
//   skill?: string;
//   proficiency_level?: string | null;
// }

// interface UserJobroleTaskProps {
//   userJobroleTask: Task[];
// }

// interface BubbleData {
//   id: string;
//   text?: string;
//   critical_work_function?: string;
// }

// interface CriticalWorkFunctionCardProps {
//   bubbles?: BubbleData[];
//   title?: string;
//   description?: string;
//   iconUrl?: string;
// }

// function isOverlapping(
//   pos: { x: number; y: number },
//   size: number,
//   placed: { x: number; y: number; size: number }[]
// ): boolean {
//   for (let p of placed) {
//     const dx = p.x - pos.x;
//     const dy = p.y - pos.y;
//     const distance = Math.sqrt(dx * dx + dy * dy);
//     if (distance < (p.size + size) / 2) return true;
//   }
//   return false;
// }

// const calculateBubbleSize = (text?: string): { size: number; fontSize: string } => {
//   if (!text) return { size: 60, fontSize: "text-xs" };
//   const wordCount = text.trim().split(/\s+/).length;
//   const charCount = text.length;
//   if (text.length > 30) {
//     return { size: 94, fontSize: "text-xs" };
//   } else if (wordCount <= 2 && charCount <= 10) {
//     return { size: 60, fontSize: "text-xs" };
//   } else if (wordCount <= 4 && charCount <= 20) {
//     return { size: 80, fontSize: "text-sm" };
//   } else {
//     return { size: 100, fontSize: "text-sm" };
//   }
// };

// function packBubblesCircular(bubbles: BubbleData[]) {
//   const bubbleSizes = bubbles.map(bubble => {
//     const { size } = calculateBubbleSize(bubble.text);
//     return { ...bubble, size };
//   });

//   bubbleSizes.sort((a, b) => b.size - a.size);
//   const N = bubbleSizes.length;
//   const baseSize = 280;
//   const containerSize = baseSize + Math.max(0, (N - 5)) * 40;
//   const center = containerSize / 2;
//   const positions: { x: number; y: number }[] = [];

//   positions.push({
//     x: center - bubbleSizes[0].size / 2,
//     y: center - bubbleSizes[0].size / 2,
//   });

//   if (N === 1) return { bubbleSizes, positions, containerSize };

//   const centerRadius = bubbleSizes[0].size / 2;
//   let currentRadius = centerRadius + bubbleSizes[1].size / 2 + 20;
//   let placed = 1;

//   while (placed < N) {
//     const circumference = 2 * Math.PI * currentRadius;
//     const averageSize = bubbleSizes.slice(placed).reduce((sum, b) => sum + b.size, 0) / (N - placed);
//     const maxBubblesOnRing = Math.floor(circumference / (averageSize * 1.3));
//     const bubblesOnThisRing = Math.min(N - placed, Math.max(6, maxBubblesOnRing));
//     const angleStep = (2 * Math.PI) / bubblesOnThisRing;

//     for (let i = 0; i < bubblesOnThisRing && placed < N; i++) {
//       let attempts = 0;
//       let positionFound = false;

//       while (!positionFound && attempts < 10) {
//         const angle = i * angleStep + (attempts * 0.1);
//         const size = bubbleSizes[placed].size;
//         const x = center + Math.cos(angle) * currentRadius - size / 2;
//         const y = center + Math.sin(angle) * currentRadius - size / 2;

//         if (
//           !isOverlapping(
//             { x, y },
//             size,
//             positions.map((pos, idx) => ({ ...pos, size: bubbleSizes[idx].size }))
//           )
//         ) {
//           positions.push({
//             x: Math.max(0, Math.min(containerSize - size, x)),
//             y: Math.max(0, Math.min(containerSize - size, y)),
//           });
//           positionFound = true;
//           placed++;
//         }
//         attempts++;
//       }
//     }

//     currentRadius += bubbleSizes[placed - 1].size + 20;
//   }

//   return { bubbleSizes, positions, containerSize };
// }

// const BubbleItem: React.FC<{
//   bubble: BubbleData & { size: number };
//   position: { x: number; y: number };
//   index: number;
// }> = ({ bubble, position, index }) => {
//   const controls = useAnimation();
//   const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

//   useEffect(() => {
//     if (inView) {
//       controls.start({
//         opacity: 1,
//         y: 0,
//         transition: { delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
//       });
//     }
//   }, [controls, inView, index]);

//   const { fontSize } = calculateBubbleSize(bubble.text);

//   return (
//     <motion.div
//       ref={ref}
//       initial={{ opacity: 0, y: 20 }}
//       animate={controls}
//       className="absolute rounded-full"
//       style={{
//         left: position.x,
//         top: position.y,
//         width: bubble.size,
//         height: bubble.size,
//       }}
//     >
//       <div className="relative group h-full w-full rounded-full">
//         <motion.div
//           className={`rounded-full flex items-center justify-center text-center ${fontSize} font-medium bg-radial from-[#380DACB] from-40% to-[#80DACB] text-blck transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer p-0 h-full w-full shadow-lg`}
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           {bubble.text && bubble.text.length > 30 ? `${bubble.text.slice(0, 30)}...` : bubble.text}
//         </motion.div>
//         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out invisible z-10 transform translate-y-2 group-hover:translate-y-0 border-2 border-blue-200">
//           <p className="text-gray-800 text-sm text-center">{bubble.text}</p>
//           <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white translate-y-full"></div>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// const CriticalWorkFunctionCard: React.FC<CriticalWorkFunctionCardProps> = ({
//   bubbles = [],
//   title = "Critical Work Function",
//   description = "Identify and drive business process improvement and innovation solutions",
//   iconUrl = "/assets/task_management/blubArrow.png",
// }) => {
//   const { bubbleSizes, positions, containerSize } = packBubblesCircular(bubbles);

//   return (
//     <div className="bg-white rounded-xl shadow-lg p-2 w-full flex flex-col items-stretch justify-between">
//       <div
//         className="bubbles-container relative mx-auto mb-4 flex-shrink-0"
//         style={{
//           height: `${containerSize}px`,
//           width: `${containerSize}px`,
//           minHeight: "320px", // adjust this to the max container height expected
//         }}
//       >
//         {bubbleSizes.map((bubble, index) => (
//           <BubbleItem key={bubble.id} bubble={bubble} position={positions[index]} index={index} />
//         ))}
//       </div>
//       <hr className="mt-auto border-[#000000]" />
//       <div className="cardTitle flex">
//         <div className="mt-auto text-center">
//           <img src={iconUrl} alt={title} />
//         </div>
//         <div className="mt-auto text-left">
//           <h2 className="text-[16px] font-bold text-[#23395B] mb-2">Critical Work Function</h2>
//           <p className="text-[14px] text-gray-600 text-sm">{title}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// const CriticalWorkFunction: React.FC<UserJobroleTaskProps> = ({
//   userJobroleTask = [],
// }) => {
//   const [cards, setCards] = useState<CriticalWorkFunctionCardProps[]>([]);

//   useEffect(() => {
//     const groupedTasks = userJobroleTask.reduce((acc, task) => {
//       const existingGroup = acc.find(group => group.title === task.critical_work_function);
//       const bubble = {
//         id: task.id.toString(),
//         text: task.task,
//         critical_work_function: task.critical_work_function,
//       };
//       if (existingGroup) {
//         existingGroup.bubbles?.push(bubble);
//       } else {
//         acc.push({
//           title: task.critical_work_function,
//           description: `Tasks related to ${task.critical_work_function}`,
//           bubbles: [bubble],
//         });
//       }
//       return acc;
//     }, [] as CriticalWorkFunctionCardProps[]);

//     setCards(groupedTasks);
//   }, [userJobroleTask]);

//   const needs2Cols = cards.some(card => (card.bubbles?.length || 0) > 5);

//   return (
//     <div className="min-h-auto">
//       <div className="max-w-7xl mx-auto px-4">
//         <div
//           className={`grid grid-cols-1 md:grid-cols-2 ${needs2Cols ? "lg:grid-cols-2" : "lg:grid-cols-3"
//             } gap-4`}
//         >
//           {cards.map((card, index) => (
//             <CriticalWorkFunctionCard
//               key={index}
//               title={card.title}
//               description={card.description}
//               bubbles={card.bubbles}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CriticalWorkFunction;


'use client';

import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface Task {
  id: number;
  critical_work_function: string;
  task: string;
  skill?: string;
  proficiency_level?: string | null;
}

interface UserJobroleTaskProps {
  userJobroleTask: Task[];
}

interface BubbleData {
  id: string;
  text?: string;
  critical_work_function?: string;
}

interface CriticalWorkFunctionCardProps {
  bubbles?: BubbleData[];
  title?: string;
  description?: string;
  iconUrl?: string;
}

function isOverlapping(
  pos: { x: number; y: number },
  size: number,
  placed: { x: number; y: number; size: number }[],
  minGap: number = 10
): boolean {
  for (let p of placed) {
    const center1 = { x: pos.x + size / 2, y: pos.y + size / 2 };
    const center2 = { x: p.x + p.size / 2, y: p.y + p.size / 2 };
    
    const dx = center1.x - center2.x;
    const dy = center1.y - center2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (size / 2 + p.size / 2) + minGap;
    
    if (distance < minDistance) return true;
  }
  return false;
}

const calculateBubbleSize = (text?: string): { size: number; fontSize: string } => {
  if (!text) return { size: 60, fontSize: "text-xs" };
  const wordCount = text.trim().split(/\s+/).length;
  const charCount = text.length;
  if (text.length > 30) {
    return { size: 94, fontSize: "text-xs" };
  } else if (wordCount <= 2 && charCount <= 10) {
    return { size: 60, fontSize: "text-xs" };
  } else if (wordCount <= 4 && charCount <= 20) {
    return { size: 80, fontSize: "text-sm" };
  } else {
    return { size: 100, fontSize: "text-sm" };
  }
};

function packBubblesCircular(bubbles: BubbleData[]) {
  if (bubbles.length === 0) {
    return { bubbleSizes: [], positions: [], containerSize: 320 };
  }

  const bubbleSizes = bubbles.map(bubble => {
    const { size } = calculateBubbleSize(bubble.text);
    return { ...bubble, size };
  });

  bubbleSizes.sort((a, b) => b.size - a.size);
  const N = bubbleSizes.length;
  
  const minGap = 10;
  const positions: { x: number; y: number }[] = [];
  
  // Calculate container size based on total area needed
  const totalArea = bubbleSizes.reduce((sum, bubble) => {
    const radius = bubble.size / 2 + minGap;
    return sum + Math.PI * radius * radius;
  }, 0);
  
  const containerSize = Math.max(320, Math.ceil(Math.sqrt(totalArea) * 1.5));
  const center = containerSize / 2;

  // Place bubbles using force-directed approach
  const maxIterations = 500;
  const repelForce = 1.2;
  const dampening = 0.9;

  // Initialize positions randomly within center area
  bubbleSizes.forEach((bubble, index) => {
    if (index === 0) {
      // Place largest bubble in center
      positions.push({
        x: center - bubble.size / 2,
        y: center - bubble.size / 2,
      });
    } else {
      // Place other bubbles randomly around center
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * 100 + bubbleSizes[0].size / 2;
      const x = center + Math.cos(angle) * distance - bubble.size / 2;
      const y = center + Math.sin(angle) * distance - bubble.size / 2;
      positions.push({ x, y });
    }
  });

  // Apply force-directed algorithm to separate bubbles
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let maxDisplacement = 0;

    for (let i = 0; i < N; i++) {
      const bubbleA = bubbleSizes[i];
      let displacement = { x: 0, y: 0 };

      // Repel from other bubbles
      for (let j = 0; j < N; j++) {
        if (i === j) continue;

        const bubbleB = bubbleSizes[j];
        const centerA = {
          x: positions[i].x + bubbleA.size / 2,
          y: positions[i].y + bubbleA.size / 2,
        };
        const centerB = {
          x: positions[j].x + bubbleB.size / 2,
          y: positions[j].y + bubbleB.size / 2,
        };

        const dx = centerA.x - centerB.x;
        const dy = centerA.y - centerB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (bubbleA.size / 2 + bubbleB.size / 2) + minGap;

        if (distance < minDistance && distance > 0) {
          const force = (minDistance - distance) / distance * repelForce;
          displacement.x += dx * force;
          displacement.y += dy * force;
        }
      }

      // Attract towards center (gentle force)
      const centerA = {
        x: positions[i].x + bubbleA.size / 2,
        y: positions[i].y + bubbleA.size / 2,
      };
      const dxToCenter = centerA.x - center;
      const dyToCenter = centerA.y - center;
      const distanceToCenter = Math.sqrt(dxToCenter * dxToCenter + dyToCenter * dyToCenter);
      
      // Only apply center attraction if far from center
      if (distanceToCenter > containerSize * 0.3) {
        const centerForce = 0.1;
        displacement.x -= dxToCenter * centerForce;
        displacement.y -= dyToCenter * centerForce;
      }

      // Apply displacement with dampening
      positions[i].x += displacement.x * dampening;
      positions[i].y += displacement.y * dampening;

      // Keep within container bounds with padding
      const padding = minGap;
      positions[i].x = Math.max(padding, Math.min(containerSize - bubbleA.size - padding, positions[i].x));
      positions[i].y = Math.max(padding, Math.min(containerSize - bubbleA.size - padding, positions[i].y));

      maxDisplacement = Math.max(maxDisplacement, Math.abs(displacement.x), Math.abs(displacement.y));
    }

    // Early termination if bubbles are stable
    if (maxDisplacement < 0.1) {
      break;
    }

    // Increase dampening over time for convergence
    if (iteration > maxIterations * 0.7) {
      dampening * 0.95;
    }
  }

  // Final check and adjustment to ensure minimum gap
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const bubbleA = bubbleSizes[i];
      const bubbleB = bubbleSizes[j];
      
      const centerA = {
        x: positions[i].x + bubbleA.size / 2,
        y: positions[i].y + bubbleA.size / 2,
      };
      const centerB = {
        x: positions[j].x + bubbleB.size / 2,
        y: positions[j].y + bubbleB.size / 2,
      };

      const dx = centerA.x - centerB.x;
      const dy = centerA.y - centerB.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = (bubbleA.size / 2 + bubbleB.size / 2) + minGap;

      if (distance < minDistance && distance > 0) {
        // Push bubbles apart
        const adjustment = (minDistance - distance) / 2;
        const adjustX = (dx / distance) * adjustment;
        const adjustY = (dy / distance) * adjustment;

        positions[i].x += adjustX;
        positions[i].y += adjustY;
        positions[j].x -= adjustX;
        positions[j].y -= adjustY;

        // Re-bound after adjustment
        positions[i].x = Math.max(minGap, Math.min(containerSize - bubbleA.size - minGap, positions[i].x));
        positions[i].y = Math.max(minGap, Math.min(containerSize - bubbleA.size - minGap, positions[i].y));
        positions[j].x = Math.max(minGap, Math.min(containerSize - bubbleB.size - minGap, positions[j].x));
        positions[j].y = Math.max(minGap, Math.min(containerSize - bubbleB.size - minGap, positions[j].y));
      }
    }
  }

  return { bubbleSizes, positions, containerSize };
}

const BubbleItem: React.FC<{
  bubble: BubbleData & { size: number };
  position: { x: number; y: number };
  index: number;
}> = ({ bubble, position, index }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
      });
    }
  }, [controls, inView, index]);

  const { fontSize } = calculateBubbleSize(bubble.text);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      className="absolute rounded-full"
      style={{
        left: position.x,
        top: position.y,
        width: bubble.size,
        height: bubble.size,
      }}
    >
      <div className="relative group h-full w-full rounded-full">
        <motion.div
          className={`rounded-full flex items-center justify-center text-center ${fontSize} font-medium bg-radial from-[#380DACB] from-40% to-[#80DACB] text-blck transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer p-0 h-full w-full shadow-lg`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="leading-tight">
            {bubble.text && bubble.text.length > 30 ? `${bubble.text.slice(0, 30)}...` : bubble.text}
          </span>
        </motion.div>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out invisible z-10 transform translate-y-2 group-hover:translate-y-0 border-2 border-blue-200">
          <p className="text-gray-800 text-sm text-center">{bubble.text}</p>
          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white translate-y-full"></div>
        </div>
      </div>
    </motion.div>
  );
};

const CriticalWorkFunctionCard: React.FC<CriticalWorkFunctionCardProps> = ({
  bubbles = [],
  title = "Critical Work Function",
  description = "Identify and drive business process improvement and innovation solutions",
  iconUrl = "/assets/task_management/blubArrow.png",
}) => {
  const { bubbleSizes, positions, containerSize } = packBubblesCircular(bubbles);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 w-full flex flex-col items-stretch justify-between min-h-[400px]">
      <div
        className="bubbles-container relative mx-auto mb-4 flex-shrink-0"
        style={{
          height: `${containerSize}px`,
          width: `${containerSize}px`,
          minHeight: "320px",
        }}
      >
        {bubbleSizes.map((bubble, index) => (
          <BubbleItem key={bubble.id} bubble={bubble} position={positions[index]} index={index} />
        ))}
        
        {/* Debug grid to visualize spacing */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute inset-0 pointer-events-none">
            {bubbleSizes.map((bubble, index) => {
              const centerX = positions[index].x + bubble.size / 2;
              const centerY = positions[index].y + bubble.size / 2;
              return (
                <div
                  key={`debug-${bubble.id}`}
                  className="absolute rounded-full"
                  style={{
                    left: centerX - (bubble.size / 2 + 5),
                    top: centerY - (bubble.size / 2 + 5),
                    width: bubble.size + 10,
                    height: bubble.size + 10,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
      
      <hr className="mt-auto border-gray-300" />
      <div className="cardTitle flex items-start gap-3 mt-4">
        <div className="flex-shrink-0">
          <img src={iconUrl} alt={title} className="w-8 h-8" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[16px] font-bold text-[#23395B] mb-1">Critical Work Function</h2>
          <p className="text-[14px] text-gray-600 truncate" title={title}>{title}</p>
        </div>
      </div>
    </div>
  );
};

const CriticalWorkFunction: React.FC<UserJobroleTaskProps> = ({
  userJobroleTask = [],
}) => {
  const [cards, setCards] = useState<CriticalWorkFunctionCardProps[]>([]);

  useEffect(() => {
    const groupedTasks = userJobroleTask.reduce((acc, task) => {
      const existingGroup = acc.find(group => group.title === task.critical_work_function);
      const bubble = {
        id: task.id.toString(),
        text: task.task,
        critical_work_function: task.critical_work_function,
      };
      if (existingGroup) {
        existingGroup.bubbles?.push(bubble);
      } else {
        acc.push({
          title: task.critical_work_function,
          description: `Tasks related to ${task.critical_work_function}`,
          bubbles: [bubble],
        });
      }
      return acc;
    }, [] as CriticalWorkFunctionCardProps[]);

    setCards(groupedTasks);
  }, [userJobroleTask]);

  const needs2Cols = cards.some(card => (card.bubbles?.length || 0) > 5);

  return (
    <div className="min-h-auto py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 ${
            needs2Cols ? "lg:grid-cols-2" : "lg:grid-cols-3"
          } gap-6`}
        >
          {cards.map((card, index) => (
            <CriticalWorkFunctionCard
              key={index}
              title={card.title}
              description={card.description}
              bubbles={card.bubbles}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CriticalWorkFunction;