"use client";

import { useMemo } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const COLORS = [
  "#3B82F6", // blue-600
  "#10B981", // green-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#8B5CF6", // violet-500
  "#EC4899", // pink-500
  "#14B8A6", // teal-500
  "#F97316", // orange-500
];

export default function PortfolioAllocationChart() {
  const { summary } = usePortfolio();

  const chartData = useMemo(() => {
    if (!summary || summary.holdings.length === 0) return [];

    return summary.holdings.map((holding) => ({
      name: holding.symbol,
      value: holding.currentValue,
      percentage: (holding.currentValue / summary.currentValue) * 100,
    }));
  }, [summary]);

  if (!summary || summary.holdings.length === 0) {
    return (
      <div className='bg-white rounded-lg shadow-lg p-6 border border-gray-200'>
        <h3 className='text-lg font-bold text-gray-900 mb-4'>
          Portfolio Allocation
        </h3>
        <div className='text-center py-8 text-gray-500'>
          <p>No data to display</p>
          <p className='text-sm mt-1'>Add holdings to see allocation</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-lg p-6 border border-gray-200'>
      <h3 className='text-lg font-bold text-gray-900 mb-4'>
        Portfolio Allocation
      </h3>

      <ResponsiveContainer width='100%' height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx='50%'
            cy='50%'
            labelLine={false}
            outerRadius={100}
            fill='#8884d8'
            dataKey='value'
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) =>
              `LKR ${value.toLocaleString("en-LK", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Allocation Table */}
      <div className='mt-6 border-t pt-4'>
        <div className='space-y-2'>
          {chartData.map((item, index) => (
            <div
              key={item.name}
              className='flex items-center justify-between text-sm'
            >
              <div className='flex items-center gap-2'>
                <div
                  className='w-3 h-3 rounded-full'
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className='font-medium text-gray-900'>{item.name}</span>
              </div>
              <div className='flex items-center gap-4'>
                <span className='text-gray-600'>
                  LKR{" "}
                  {item.value.toLocaleString("en-LK", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className='font-semibold text-blue-600 min-w-[60px] text-right'>
                  {item.percentage.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
