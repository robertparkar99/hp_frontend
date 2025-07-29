import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Circle, Target, Zap } from 'lucide-react';

interface Task {
    id: number;
    critical_work_function: string;
    task: string;
    skill?: string;
    proficiency_level?: string | null;
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
    iconComponent?: React.ReactNode;
}
interface UserJobroleTaskProps {
    userJobroleTask: Task[];
}
// Utility function to check if two bubbles overlap
function isOverlapping(
    pos: { x: number; y: number },
    size: number,
    placed: { x: number; y: number; size: number }[]
): boolean {
    for (let p of placed) {
        const dx = p.x - pos.x;
        const dy = p.y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < (p.size + size) / 2 + 5) return true; // Added 5px buffer
    }
    return false;
}

// Calculate appropriate bubble size based on text content
const calculateBubbleSize = (text?: string): { size: number; fontSize: string } => {
    if (!text) return { size: 60, fontSize: 'text-xs' };
    const wordCount = text.trim().split(/\s+/).length;
    const charCount = text.length;

    if (text.length > 30) {
        return { size: 100, fontSize: 'text-xs' };
    } else if (wordCount <= 2 && charCount <= 10) {
        return { size: 70, fontSize: 'text-xs' };
    } else if (wordCount <= 4 && charCount <= 20) {
        return { size: 85, fontSize: 'text-sm' };
    } else {
        return { size: 105, fontSize: 'text-sm' };
    }
};

// Circular packing algorithm to position bubbles without overlapping
function packBubblesCircular(bubbles: BubbleData[]) {
    const bubbleSizes = bubbles.map(bubble => {
        const { size } = calculateBubbleSize(bubble.text);
        return { ...bubble, size };
    });

    bubbleSizes.sort((a, b) => b.size - a.size);

    const N = bubbleSizes.length;
    if (N === 0) return { bubbleSizes: [], positions: [] };

    const containerSize = 300;
    const center = containerSize / 2;
    const positions: { x: number; y: number }[] = [];

    // Place the largest bubble at center
    positions.push({
        x: center - bubbleSizes[0].size / 2,
        y: center - bubbleSizes[0].size / 2,
    });

    if (N === 1) return { bubbleSizes, positions };

    // Place remaining bubbles in concentric circles
    const centerRadius = bubbleSizes[0].size / 2;
    let currentRadius = centerRadius + bubbleSizes[1].size / 2 + 25;

    let placed = 1;
    while (placed < N) {
        const circumference = 2 * Math.PI * currentRadius;
        const averageSize = bubbleSizes.slice(placed).reduce((sum, b) => sum + b.size, 0) / (N - placed);
        const maxBubblesOnRing = Math.floor(circumference / (averageSize * 1.4));

        const bubblesOnThisRing = Math.min(N - placed, Math.max(4, maxBubblesOnRing));
        const angleStep = (2 * Math.PI) / bubblesOnThisRing;

        for (let i = 0; i < bubblesOnThisRing && placed < N; i++) {
            let attempts = 0;
            let positionFound = false;

            while (!positionFound && attempts < 15) {
                const angle = i * angleStep + (attempts * 0.15);
                const size = bubbleSizes[placed].size;
                const x = center + Math.cos(angle) * currentRadius - size / 2;
                const y = center + Math.sin(angle) * currentRadius - size / 2;

                if (!isOverlapping(
                    { x, y },
                    size,
                    positions.map((pos, idx) => ({ ...pos, size: bubbleSizes[idx].size }))
                )) {
                    positions.push({
                        x: Math.max(5, Math.min(containerSize - size - 5, x)),
                        y: Math.max(5, Math.min(containerSize - size - 5, y))
                    });
                    positionFound = true;
                    placed++;
                }
                attempts++;
            }

            if (!positionFound && placed < N) {
                // Force placement if no valid position found
                const angle = i * angleStep;
                const size = bubbleSizes[placed].size;
                const x = center + Math.cos(angle) * currentRadius - size / 2;
                const y = center + Math.sin(angle) * currentRadius - size / 2;

                positions.push({
                    x: Math.max(5, Math.min(containerSize - size - 5, x)),
                    y: Math.max(5, Math.min(containerSize - size - 5, y))
                });
                placed++;
            }
        }

        currentRadius += Math.max(...bubbleSizes.slice(placed - bubblesOnThisRing, placed).map(b => b.size)) / 2 + 30;
    }

    return { bubbleSizes, positions };
}

// Individual bubble component with animations
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
                scale: 1,
                y: 0,
                transition: {
                    delay: index * 0.1,
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1]
                },
            });
        }
    }, [controls, inView, index]);

    const { fontSize } = calculateBubbleSize(bubble.text);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
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
                    className={`rounded-full flex items-center justify-center text-center ${fontSize} font-semibold bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 text-white transition-all duration-300 ease-in-out cursor-pointer p-2 h-full w-full shadow-lg hover:shadow-xl border-2 border-white/20`}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span className="leading-tight">
                        {bubble.text && bubble.text.length > 25 ? `${bubble.text.slice(0, 25)}...` : bubble.text}
                    </span>
                </motion.div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-52 p-4 bg-gray-900 text-white rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out invisible z-20 transform translate-y-2 group-hover:translate-y-0">
                    <p className="text-sm text-center leading-relaxed">
                        {bubble.text}
                    </p>
                    <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-900 translate-y-full"></div>
                </div>
            </div>
        </motion.div>
    );
};

// Card component containing bubbles
const CriticalWorkFunctionCard: React.FC<CriticalWorkFunctionCardProps> = ({
    bubbles = [],
    title = "Critical Work Function",
    description = "Identify and drive business process improvement and innovation solutions",
    iconComponent = <Target className="w-6 h-6 text-blue-600" />
}) => {
    const { bubbleSizes, positions } = packBubblesCircular(bubbles);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-2xl shadow-xl p-6 w-full flex flex-col hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
        >
            <div className="bubbles-container relative h-[300px] w-[300px] mx-auto mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4">
                {bubbleSizes.map((bubble, index) => (
                    <BubbleItem
                        key={bubble.id}
                        bubble={bubble}
                        position={positions[index]}
                        index={index}
                    />
                ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                        {iconComponent}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">
                            Critical Work Function
                        </h2>
                        <h3 className="text-base font-semibold text-blue-600 mb-2">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Main component
const CriticalWorkFunction: React.FC<UserJobroleTaskProps> = ({
    userJobroleTask = []
}) => {
    const [cards, setCards] = useState<CriticalWorkFunctionCardProps[]>([]);

    useEffect(() => {
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
            <div className="container mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-12"
                >
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    {cards.map((card, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.6,
                                delay: index * 0.2,
                                ease: [0.16, 1, 0.3, 1]
                            }}
                        >
                            <CriticalWorkFunctionCard
                                title={card.title}
                                description={card.description}
                                bubbles={card.bubbles}
                                iconComponent={card.iconComponent}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CriticalWorkFunction;