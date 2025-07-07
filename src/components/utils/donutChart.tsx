// components/DonutChart.js
'use client';

import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DonutChart() {
  const data = {
    labels: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    datasets: [
      {
        data: [50, 60, 45, 30, 25, 80, 71.98],
        backgroundColor: [
          '#f87171', // red-400
          '#38bdf8', // sky-400
          '#fbbf24', // amber-400
          '#60a5fa', // blue-400
          '#34d399', // green-400
          '#a78bfa', // purple-400
          '#8b5cf6'  // violet-500
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    cutout: '40%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="relative w-[300px] h-[200px] mx-auto">
      <Doughnut data={data} options={options} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-lg pointer-events-none">
        361.98
      </div>
    </div>
  );
}
