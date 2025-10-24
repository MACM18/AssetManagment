"use client";

import { useMemo } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function PerformanceChart() {
  const { summary } = usePortfolio();

  const chartData = useMemo(() => {
    if (!summary || summary.holdings.length === 0) return [];

    return summary.holdings
      .map((holding) => ({
        symbol: holding.symbol,
        gainLoss: holding.gainLoss,
        gainLossPercent: holding.gainLossPercent,
      }))
      .sort((a, b) => b.gainLoss - a.gainLoss);
  }, [summary]);

  if (!summary || summary.holdings.length === 0) {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700'>
        <h3 className='text-lg font-bold text-gray-900 mb-4'>
          Performance by Stock
        </h3>
        <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
          <p>No data to display</p>
          <p className='text-sm mt-1'>Add holdings to see performance</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700'>
      <h3 className='text-lg font-bold text-gray-900 mb-4'>
        Performance by Stock
      </h3>

      <ResponsiveContainer width='100%' height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
          <XAxis
            dataKey='symbol'
            tick={{ fill: "#6B7280", fontSize: 12 }}
            axisLine={{ stroke: "#E5E7EB" }}
          />
          <YAxis
            tick={{ fill: "#6B7280", fontSize: 12 }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickFormatter={(value) => `${value >= 0 ? "+" : ""}${value}`}
          />
          <Tooltip
            formatter={(value: number) =>
              `LKR ${value.toLocaleString("en-LK", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            }
            contentStyle={{
              backgroundColor: "#FFF",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey='gainLoss' radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.gainLoss >= 0 ? "#10B981" : "#EF4444"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Performance Summary */}
      <div className='mt-6 border-t pt-4'>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <p className='text-gray-600 mb-1'>Biggest Gain</p>
            <p className='font-bold text-green-600'>
              {chartData[0]?.symbol || "N/A"}
              {chartData[0] && (
                <span className='ml-2 text-xs'>
                  +{chartData[0].gainLossPercent.toFixed(2)}%
                </span>
              )}
            </p>
          </div>
          <div>
            <p className='text-gray-600 mb-1'>Biggest Loss</p>
            <p className='font-bold text-red-600'>
              {chartData[chartData.length - 1]?.symbol || "N/A"}
              {chartData[chartData.length - 1] &&
                chartData[chartData.length - 1].gainLoss < 0 && (
                  <span className='ml-2 text-xs'>
                    {chartData[chartData.length - 1].gainLossPercent.toFixed(2)}
                    %
                  </span>
                )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
