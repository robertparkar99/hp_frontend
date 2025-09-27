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

  // Calculate container size
  const totalArea = bubbleSizes.reduce((sum, bubble) => {
    const radius = bubble.size / 2 + minGap;
    return sum + Math.PI * radius * radius;
  }, 0);

  const containerSize = Math.max(320, Math.ceil(Math.sqrt(totalArea) * 1.5));
  const center = containerSize / 2;

  // Initial positions
  bubbleSizes.forEach((bubble, index) => {
    if (index === 0) {
      positions.push({
        x: center - bubble.size / 2,
        y: center - bubble.size / 2,
      });
    } else {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * 100 + bubbleSizes[0].size / 2;
      const x = center + Math.cos(angle) * distance - bubble.size / 2;
      const y = center + Math.sin(angle) * distance - bubble.size / 2;
      positions.push({ x, y });
    }
  });

  // Force-directed separation
  const maxIterations = 500;
  const repelForce = 1.2;
  let dampening = 0.9;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let maxDisplacement = 0;

    for (let i = 0; i < N; i++) {
      const bubbleA = bubbleSizes[i];
      let displacement = { x: 0, y: 0 };

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

      const centerA = {
        x: positions[i].x + bubbleA.size / 2,
        y: positions[i].y + bubbleA.size / 2,
      };
      const dxToCenter = centerA.x - center;
      const dyToCenter = centerA.y - center;
      const distanceToCenter = Math.sqrt(dxToCenter * dxToCenter + dyToCenter * dyToCenter);

      if (distanceToCenter > containerSize * 0.3) {
        const centerForce = 0.1;
        displacement.x -= dxToCenter * centerForce;
        displacement.y -= dyToCenter * centerForce;
      }

      positions[i].x += displacement.x * dampening;
      positions[i].y += displacement.y * dampening;

      const padding = minGap;
      positions[i].x = Math.max(padding, Math.min(containerSize - bubbleA.size - padding, positions[i].x));
      positions[i].y = Math.max(padding, Math.min(containerSize - bubbleA.size - padding, positions[i].y));

      maxDisplacement = Math.max(maxDisplacement, Math.abs(displacement.x), Math.abs(displacement.y));
    }

    if (maxDisplacement < 0.1) break;
    if (iteration > maxIterations * 0.7) {
      dampening *= 0.95;
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
          className={`rounded-full flex items-center justify-center text-center ${fontSize} font-medium bg-radial from-[#380DACB] from-40% to-[#80DACB] text-black transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer h-full w-full shadow-lg px-2`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="leading-tight break-words px-1">
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

const CriticalWorkFunction: React.FC<UserJobroleTaskProps> = ({ userJobroleTask = [] }) => {
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

    // ✅ Sort ascending by bubble count
    const sortedCards = groupedTasks.sort(
      (a, b) => (a.bubbles?.length || 0) - (b.bubbles?.length || 0)
    );

    setCards(sortedCards);
  }, [userJobroleTask]);

  const needs2Cols = cards.some(card => (card.bubbles?.length || 0) > 5);

  return (
    <div className="min-h-auto py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 ${needs2Cols ? "lg:grid-cols-2" : "lg:grid-cols-3"
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
