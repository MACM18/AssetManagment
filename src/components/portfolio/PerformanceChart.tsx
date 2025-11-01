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
      <div className='rounded-lg shadow-lg p-6 border'>
        <h3 className='text-lg font-bold mb-4'>Performance by Stock</h3>
        <div className='text-center py-8'>
          <p>No data to display</p>
          <p className='text-sm mt-1'>Add holdings to see performance</p>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-lg shadow-lg p-6 border'>
      <h3 className='text-lg font-bold mb-4'>Performance by Stock</h3>

      <ResponsiveContainer width='100%' height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='symbol' />
          <YAxis
            tickFormatter={(value) => `${value >= 0 ? "+" : ""}${value}`}
          />
          <Tooltip
            formatter={(value: number) =>
              `LKR ${value.toLocaleString("en-LK", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            }
          />
          <Bar dataKey='gainLoss' radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Performance Summary */}
      <div className='mt-6 border-t pt-4'>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <p className='mb-1'>Biggest Gain</p>
            <p className='font-bold'>
              {chartData[0]?.symbol || "N/A"}
              {chartData[0] && (
                <span className='ml-2 text-xs'>
                  +{chartData[0].gainLossPercent.toFixed(2)}%
                </span>
              )}
            </p>
          </div>
          <div>
            <p className='mb-1'>Biggest Loss</p>
            <p className='font-bold'>
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
