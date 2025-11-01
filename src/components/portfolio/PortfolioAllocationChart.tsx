"use client";

import { useMemo, useEffect, useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useTheme } from "@/contexts/ThemeContext";
import { PieChart, Pie, ResponsiveContainer, Tooltip, Cell } from "recharts";

// Predefined color palette for pie chart
const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#84cc16",
];

export default function PortfolioAllocationChart() {
  const { summary } = usePortfolio();
  const { actualTheme } = useTheme();

  // Get computed colors from CSS variables
  const [chartColors, setChartColors] = useState({
    muted: "#6b7280",
    grid: "#e5e7eb",
    text: "#000000",
    background: "#ffffff",
  });

  useEffect(() => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    setChartColors({
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
      <div className='bg-card rounded-lg shadow-lg p-6 border border-border'>
        <h3 className='text-lg font-bold mb-4 text-foreground'>
          Portfolio Allocation
        </h3>
        <div className='text-center py-8'>
          <p className='text-muted-foreground'>No data to display</p>
          <p className='text-sm mt-1 text-muted-foreground'>
            Add holdings to see allocation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-card rounded-lg shadow-lg p-6 border border-border'>
      <h3 className='text-lg font-bold mb-4 text-foreground'>
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
            dataKey='value'
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                opacity={0.85}
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
            contentStyle={{
              backgroundColor: chartColors.background,
              border: `1px solid ${chartColors.grid}`,
              borderRadius: "8px",
              color: chartColors.text,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Allocation Table */}
      <div className='mt-6 border-t border-border pt-4'>
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
                <span className='font-medium text-foreground'>{item.name}</span>
              </div>
              <div className='flex items-center gap-4'>
                <span className='text-muted-foreground'>
                  LKR{" "}
                  {item.value.toLocaleString("en-LK", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className='font-semibold min-w-[60px] text-right text-foreground'>
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
