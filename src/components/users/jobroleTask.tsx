'use client';

import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface BubbleData {
  id: string;
  text?: string;
  category?: string;
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

const calculateBubbleSize = (text?: string): { size: number; fontSize: string } => {
  if (!text) return { size: 60, fontSize: "text-xs" };
  const wordCount = text.trim().split(/\s+/).length;
  const charCount = text.length;
  if (wordCount <= 2 && charCount <= 10) {
    return { size: 60, fontSize: "text-xs" };
  } else if (wordCount <= 4 && charCount <= 20) {
    return { size: 80, fontSize: "text-sm" };
  } else {
    return { size: 100, fontSize: "text-sm" };
  }
};

const packBubblesCircular = (bubbles: BubbleData[]) => {
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
  let currentRadius = centerRadius + bubbleSizes[1].size / 2;
  
  // Distribute bubbles in concentric circles
  let placed = 1;
  while (placed < N) {
    const circumference = 2 * Math.PI * currentRadius;
    const availableBubbles = N - placed;
    
    // Calculate how many bubbles we can fit on this ring
    const averageSize = bubbleSizes.slice(placed).reduce((sum, b) => sum + b.size, 0) / (N - placed);
    const maxBubblesOnRing = Math.floor(circumference / averageSize);
    const bubblesOnThisRing = Math.min(availableBubbles, maxBubblesOnRing || 6);
    
    if (bubblesOnThisRing === 0) {
      currentRadius += averageSize;
      continue;
    }

    const angleStep = (2 * Math.PI) / bubblesOnThisRing;
    
    for (let i = 0; i < bubblesOnThisRing && placed < N; i++) {
      const angle = i * angleStep;
      const size = bubbleSizes[placed].size;
      const x = center + Math.cos(angle) * currentRadius - size / 2;
      const y = center + Math.sin(angle) * currentRadius - size / 2;
      
      // Ensure bubble stays within container
      const boundedX = Math.max(0, Math.min(containerSize - size, x));
      const boundedY = Math.max(0, Math.min(containerSize - size, y));
      
      positions.push({ x: boundedX, y: boundedY });
      placed++;
    }

    // Increase radius for next ring
    const nextBubbleSize = placed < N ? bubbleSizes[placed].size : 0;
    currentRadius += (bubbleSizes[placed - 1].size + nextBubbleSize) / 2;
  }

  return { bubbleSizes, positions };
};

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
          {bubble.text}
        </motion.div>
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out invisible z-10 transform translate-y-2 group-hover:translate-y-0">
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
}) => {
  const { bubbleSizes, positions } = packBubblesCircular(bubbles);

  return (
    <div className="bg-white rounded-xl shadow-lg p-2 w-full flex flex-col">
      <div className="bubbles-container relative h-[280px] w-[280px] mx-auto mb-4">
        {bubbleSizes.map((bubble, index) => (
          <BubbleItem key={bubble.id} bubble={bubble} position={positions[index]} index={index} />
        ))}
      </div>
      <div className="mt-auto text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
};

const CriticalWorkFunction: React.FC<CriticalWorkFunctionProps> = ({
  cards = [
    {
      title: "Innovation & Strategy",
      description: "Driving new ideas and strategic solutions",
      bubbles: [
        { id: "1", text: "Ideation Ideation Ideation Ideation" },
        { id: "2", text: "Research" },
        { id: "3", text: "Prototype" },
        { id: "4", text: "Testing" },
        { id: "5", text: "Implement" },
        { id: "6", text: "Feedback" },
        { id: "7", text: "Iterate" },
        { id: "8", text: "Plan Plan Plan Plan" },
      ],
    },
    {
      title: "Data Analytics",
      description: "Transforming data into actionable insights",
      bubbles: [
        { id: "9", text: "Collect" },
        { id: "10", text: "Clean" },
        { id: "11", text: "Analyze" },
        { id: "12", text: "Visualize" },
        { id: "13", text: "Report" },
        { id: "14", text: "Predict" },
        { id: "15", text: "Optimize" },
        { id: "16", text: "Model Model Model" },
      ],
    },
    {
      title: "Agile Development",
      description: "Flexible and iterative project management",
      bubbles: [
        { id: "17", text: "Sprints Sprints Sprints" },
        { id: "18", text: "Standups" },
        { id: "19", text: "Backlog" },
        { id: "20", text: "Retros" },
        { id: "21", text: "Stories" },
        { id: "22", text: "Kanban" },
        { id: "23", text: "Scrum" },
        { id: "24", text: "CI/CD CI/CD CI/CD" },
      ],
    },
  ],
}) => {
  return (
    <div className="min-h-screen py-8">
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