"use client";

import { useMemo, useEffect, useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useTheme } from "@/contexts/ThemeContext";
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
  const { actualTheme } = useTheme();

  // Get computed colors from CSS variables
  const [chartColors, setChartColors] = useState({
    success: "#10b981",
    destructive: "#ef4444",
    muted: "#6b7280",
    grid: "#e5e7eb",
    text: "#000000",
    background: "#ffffff",
  });

  useEffect(() => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    setChartColors({
      success:
        computedStyle.getPropertyValue("--color-success").trim() || "#10b981",
      destructive:
        computedStyle.getPropertyValue("--color-destructive").trim() ||
        "#ef4444",
      muted:
        computedStyle.getPropertyValue("--color-muted-foreground").trim() ||
        "#6b7280",
      grid: actualTheme === "dark" ? "#374151" : "#e5e7eb",
      text:
        computedStyle.getPropertyValue("--color-foreground").trim() ||
        "#000000",
      background:
        computedStyle.getPropertyValue("--color-card").trim() || "#ffffff",
    });
  }, [actualTheme]);

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
      <div className='bg-card rounded-lg shadow-lg p-6 border border-border'>
        <h3 className='text-lg font-bold mb-4 text-foreground'>
          Performance by Stock
        </h3>
        <div className='text-center py-8'>
          <p className='text-muted-foreground'>No data to display</p>
          <p className='text-sm mt-1 text-muted-foreground'>
            Add holdings to see performance
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-card rounded-lg shadow-lg p-6 border border-border'>
      <h3 className='text-lg font-bold mb-4 text-foreground'>
        Performance by Stock
      </h3>

      <ResponsiveContainer width='100%' height={300}>
        <BarChart data={chartData}>
          <CartesianGrid
            strokeDasharray='3 3'
            stroke={chartColors.grid}
            opacity={0.5}
          />
          <XAxis
            dataKey='symbol'
            stroke={chartColors.muted}
            style={{ fontSize: "12px" }}
          />
          <YAxis
            tickFormatter={(value) => `${value >= 0 ? "+" : ""}${value}`}
            stroke={chartColors.muted}
            style={{ fontSize: "12px" }}
          />
          <Tooltip
            formatter={(value: number) =>
              `LKR ${value.toLocaleString("en-LK", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            }
            contentStyle={{
              backgroundColor: chartColors.background,
              border: `1px solid ${chartColors.grid}`,
              borderRadius: "8px",
              color: chartColors.text,
            }}
          />
          <Bar dataKey='gainLoss' radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.gainLoss >= 0
                    ? chartColors.success
                    : chartColors.destructive
                }
                opacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Performance Summary */}
      <div className='mt-6 border-t border-border pt-4'>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <p className='mb-1 text-muted-foreground'>Biggest Gain</p>
            <p className='font-bold text-foreground'>
              {chartData[0]?.symbol || "N/A"}
              {chartData[0] && (
                <span className='ml-2 text-xs text-success'>
                  +{chartData[0].gainLossPercent.toFixed(2)}%
                </span>
              )}
            </p>
          </div>
          <div>
            <p className='mb-1 text-muted-foreground'>Biggest Loss</p>
            <p className='font-bold text-foreground'>
              {chartData[chartData.length - 1]?.symbol || "N/A"}
              {chartData[chartData.length - 1] &&
                chartData[chartData.length - 1].gainLoss < 0 && (
                  <span className='ml-2 text-xs text-destructive'>
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
