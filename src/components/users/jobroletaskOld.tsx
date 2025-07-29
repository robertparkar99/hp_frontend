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

interface CriticalWorkFunctionProps {
  cards?: CriticalWorkFunctionCardProps[];
}
function isOverlapping(pos: { x: number; y: number }, size: number, placed: { x: number; y: number; size: number }[]): boolean {
  for (let p of placed) {
    const dx = p.x - pos.x;
    const dy = p.y - pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < (p.size + size) / 2) return true;
  }
  return false;
}

const calculateBubbleSize = (text?: string): { size: number; fontSize: string } => {
  if (!text) return { size: 60, fontSize: "text-xs" };
  const wordCount = text.trim().split(/\s+/).length;
  const charCount = text.length;
  if (text.length > 30) {
    // For truncated text, use fixed size
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
  // Calculate sizes
  const bubbleSizes = bubbles.map(bubble => {
    const { size } = calculateBubbleSize(bubble.text);
    return { ...bubble, size };
  });

  // Sort by descending size
  bubbleSizes.sort((a, b) => b.size - a.size);

  const N = bubbleSizes.length;
  if (N === 0) return { bubbleSizes: [], positions: [] };

  const containerSize = 280;
  const center = containerSize / 2;
  const positions: { x: number; y: number }[] = [];

  // Place center bubble
  positions.push({
    x: center - bubbleSizes[0].size / 2,
    y: center - bubbleSizes[0].size / 2,
  });

  if (N === 1) return { bubbleSizes, positions };

  // Calculate positions for surrounding bubbles
  const centerRadius = bubbleSizes[0].size / 2;
  let currentRadius = centerRadius + bubbleSizes[1].size / 2 + 20; // Increased initial buffer

  let placed = 1;
  while (placed < N) {
    const circumference = 2 * Math.PI * currentRadius;
    const averageSize = bubbleSizes.slice(placed).reduce((sum, b) => sum + b.size, 0) / (N - placed);
    const maxBubblesOnRing = Math.floor(circumference / (averageSize * 1.3)); // More conservative spacing

    // Dynamic angle adjustment
    const bubblesOnThisRing = Math.min(N - placed, Math.max(6, maxBubblesOnRing));
    const angleStep = (2 * Math.PI) / bubblesOnThisRing;

    for (let i = 0; i < bubblesOnThisRing && placed < N; i++) {
      let attempts = 0;
      let positionFound = false;

      while (!positionFound && attempts < 10) {
        const angle = i * angleStep + (attempts * 0.1); // Vary angle slightly
        const size = bubbleSizes[placed].size;
        const x = center + Math.cos(angle) * currentRadius - size / 2;
        const y = center + Math.sin(angle) * currentRadius - size / 2;

        if (!isOverlapping({ x, y }, size, positions.map((pos, idx) =>
          ({ ...pos, size: bubbleSizes[idx].size })))) {
          positions.push({
            x: Math.max(0, Math.min(containerSize - size, x)),
            y: Math.max(0, Math.min(containerSize - size, y))
          });
          positionFound = true;
          placed++;
        }
        attempts++;
      }
    }

    currentRadius += bubbleSizes[placed - 1].size + 20; // Maintain larger buffer
  }
  return { bubbleSizes, positions };
}

const BubbleItem: React.FC<{
  bubble: BubbleData & { size: number };
  position: { x: number; y: number };
  index: number;
}> = ({ bubble, position, index }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: {
          delay: index * 0.1,
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1]
        },
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
          {bubble.text && bubble.text.length > 30 ? `${bubble.text.slice(0, 30)}...` : bubble.text}
        </motion.div>
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out invisible z-10 transform translate-y-2 group-hover:translate-y-0">
          <p className="text-gray-800 text-sm text-center">
            {bubble.text}
          </p>
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
}) => {
  const { bubbleSizes, positions } = packBubblesCircular(bubbles);

  return (
    <div className="bg-white rounded-xl shadow-lg p-2 w-full flex flex-col">
      <div className="bubbles-container relative h-[280px] w-[280px] mx-auto mb-4">
        {bubbleSizes.map((bubble, index) => (
          <BubbleItem key={bubble.id} bubble={bubble} position={positions[index]} index={index} />
        ))}
      </div>
      <hr className="border-[#000000]" />
      <div className="cardTitle flex">
        <div className="mt-auto text-center">
          <img src="/assets/task_management/blubArrow.png" alt={title} />
        </div>
        <div className="mt-auto text-left">
          <h2 className="text-[16px] font-bold text-[#23395B] mb-2">Critical Work Function</h2>
          <p className="text-[14px] text-gray-600 text-sm">{title}</p>
        </div>
      </div>

    </div>
  );
};

const CriticalWorkFunction: React.FC<UserJobroleTaskProps> = ({
  userJobroleTask = [
    {
      id: 10,
      critical_work_function: "Manage Operations team",
      task: "Provide mentoring to all employees and encourage continuous professional development",
      skill: "Regulatory Compliance",
      proficiency_level: null
    }
  ]
}) => {
  const [cards, setCards] = useState<CriticalWorkFunctionCardProps[]>([]);

  useEffect(() => {
    // Group tasks by critical_work_function
    const groupedTasks = userJobroleTask.reduce((acc, task) => {
      const existingGroup = acc.find(group => group.title === task.critical_work_function);

      if (existingGroup) {
        existingGroup.bubbles?.push({
          id: task.id.toString(),
          text: task.task,
          critical_work_function: task.critical_work_function
        });
      } else {
        acc.push({
          title: task.critical_work_function,
          description: `Tasks related to ${task.critical_work_function}`,
          bubbles: [{
            id: task.id.toString(),
            text: task.task,
            critical_work_function: task.critical_work_function
          }]
        });
      }
      return acc;
    }, [] as CriticalWorkFunctionCardProps[]);

    setCards(groupedTasks);
  }, [userJobroleTask]);

  return (
    <div className="min-h-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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