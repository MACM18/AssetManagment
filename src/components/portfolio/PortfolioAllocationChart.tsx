"use client";

import { useMemo } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { PieChart, Pie, ResponsiveContainer, Tooltip } from "recharts";

export default function PortfolioAllocationChart() {
  const { summary } = usePortfolio();

  type ChartItem = { name: string; value: number; percentage: number };

  const chartData: ChartItem[] = useMemo(() => {
    if (!summary || summary.holdings.length === 0) return [] as ChartItem[];

    return summary.holdings.map((holding) => ({
      name: holding.symbol,
      value: holding.currentValue,
      percentage: (holding.currentValue / summary.currentValue) * 100,
    }));
  }, [summary]);

  if (!summary || summary.holdings.length === 0) {
    return (
      <div className='rounded-lg shadow-lg p-6 border'>
        <h3 className='text-lg font-bold mb-4'>
          Portfolio Allocation
        </h3>
        <div className='text-center py-8'>
          <p>No data to display</p>
          <p className='text-sm mt-1'>Add holdings to see allocation</p>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-lg shadow-lg p-6 border'>
      <h3 className='text-lg font-bold mb-4'>
        Portfolio Allocation
      </h3>

      <ResponsiveContainer width='100%' height={300}>
        <PieChart>
          <Pie data={chartData} cx='50%' cy='50%' labelLine={false} outerRadius={100} dataKey='value' />
          <Tooltip
            formatter={(value: number) =>
              `LKR ${value.toLocaleString("en-LK", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            }
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Allocation Table */}
      <div className='mt-6 border-t pt-4'>
        <div className='space-y-2'>
          {chartData.map((item) => (
            <div
              key={item.name}
              className='flex items-center justify-between text-sm'
            >
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full border' />
                <span className='font-medium'>{item.name}</span>
              </div>
              <div className='flex items-center gap-4'>
                <span>
                  LKR{" "}
                  {item.value.toLocaleString("en-LK", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className='font-semibold min-w-[60px] text-right'>
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
