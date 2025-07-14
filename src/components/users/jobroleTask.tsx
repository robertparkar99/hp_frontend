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

const getCategoryColor = (category?: string) => {
  switch (category) {
    case "agile": return "bg-blue-500";
    case "data": return "bg-green-500";
    case "strategy": return "bg-orange-500";
    case "innovation": return "bg-purple-500";
    case "collaboration": return "bg-teal-500";
    case "growth": return "bg-red-500";
    default: return "bg-gray-500";
  }
};

const calculateBubbleSize = (text?: string): { width: string, height: string, fontSize: string, cols: string } => {
  if (!text) return { width: "w-24", height: "h-24", fontSize: "text-sm", cols: "col-span-1" };

  const wordCount = text.trim().split(/\s+/).length;
  const charCount = text.length;

  if (wordCount <= 2 && charCount <= 10) {
    return { width: "w-24", height: "h-24", fontSize: "text-sm", cols: "col-span-1" };
  } else if (wordCount <= 4 && charCount <= 20) {
    return { width: "w-32", height: "h-32", fontSize: "text-base", cols: "col-span-2" };
  } else {
    return { width: "w-40", height: "h-40", fontSize: "text-base", cols: "col-span-3" };
  }
};

const BubbleItem: React.FC<{ bubble: BubbleData; index: number }> = ({ bubble, index }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { delay: index * 0.1, duration: 0.5 }
      });
    }
  }, [controls, inView, index]);

  const { width, height, fontSize } = calculateBubbleSize(bubble.text);
  const colorClass = getCategoryColor(bubble.category);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      className={`flex items-center justify-center`}
    >
      <div className="relative group">
        <div className={`${width} ${height} text-black border border-[#ddd] rounded-full flex items-center justify-center text-center ${fontSize} font-medium bg-radial from-[#380DACB] from-40% to-[#80DACB] transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer p-2`}>
          {bubble.text}
        </div>
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out invisible z-10 transform translate-y-2 group-hover:translate-y-0">
          <p className="text-black-800 text-sm text-center">{bubble.text}</p>
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
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full min-h-[500px] flex flex-col justify-between">
      <div className="bubbles-container">
        <div className="grid grid-cols-3 auto-rows-min gap-4 justify-space-between">
          {bubbles.map((bubble, index) => (
            <BubbleItem key={bubble.id} bubble={bubble} index={index} />
          ))}
        </div>
      </div>
      <div className="mt-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
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
        { id: "1", text: "Ideation", category: "innovation" },
        { id: "2", text: "Research", category: "strategy" },
        { id: "3", text: "Prototyping", category: "innovation" },
        { id: "4", text: "Testing", category: "strategy" },
        { id: "5", text: "Implementation", category: "innovation" },
        { id: "6", text: "Feedback", category: "strategy" },
        { id: "7", text: "Iteration", category: "innovation" },
        { id: "71", text: "Strategic Planning Long Term", category: "strategy" },
        { id: "72", text: "Vision", category: "innovation" },
      ]
    },
    {
      title: "Data Analytics",
      description: "Transforming data into actionable insights",
      bubbles: [
        { id: "8", text: "Collection", category: "data" },
        { id: "9", text: "Cleaning", category: "data" },
        { id: "10", text: "Analysis", category: "data" },
        { id: "11", text: "Visualization", category: "data" },
        { id: "12", text: "Reporting", category: "data" },
        { id: "13", text: "Prediction", category: "data" },
        { id: "14", text: "Optimization", category: "data" },
        { id: "141", text: "Big Data Processing", category: "data" },
      ]
    },
    {
      title: "Agile Development",
      description: "Flexible and iterative project management",
      bubbles: [
        { id: "15", text: "Sprints", category: "agile" },
        { id: "16", text: "Standups", category: "agile" },
        { id: "17", text: "Backlog", category: "agile" },
        { id: "18", text: "Retrospectives", category: "agile" },
        { id: "19", text: "User Stories", category: "agile" },
        { id: "20", text: "Kanban", category: "agile" },
        { id: "21", text: "Scrum", category: "agile" },
        { id: "211", text: "Continuous Integration", category: "agile" },
      ]
    }
  ]
}) => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
