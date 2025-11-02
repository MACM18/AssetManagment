"use client";

import { useMemo, useEffect, useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useTheme } from "@/contexts/ThemeContext";
import { PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, ResponsiveContainer, Tooltip, Cell } from "recharts";

// Predefined color palette for pie chart - theme-aware
const COLORS_LIGHT = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#6366f1", // indigo
  "#84cc16", // lime
];

const COLORS_DARK = [
  "#60a5fa", // lighter blue
  "#34d399", // lighter green
  "#fbbf24", // lighter amber
  "#f87171", // lighter red
  "#a78bfa", // lighter purple
  "#f472b6", // lighter pink
  "#2dd4bf", // lighter teal
  "#fb923c", // lighter orange
  "#818cf8", // lighter indigo
  "#a3e635", // lighter lime
];

export default function PortfolioAllocationChart() {
  const { summary } = usePortfolio();
  const { actualTheme } = useTheme();

  // Select color palette based on theme
  const COLORS = actualTheme === "dark" ? COLORS_DARK : COLORS_LIGHT;

  // Get computed colors from CSS variables
  const [chartColors, setChartColors] = useState({
    muted: "#6b7280",
    grid: "#e5e7eb",
    text: "#000000",
    background: "#ffffff",
    card: "#ffffff",
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
        computedStyle.getPropertyValue("--color-background").trim() ||
        "#ffffff",
      card: computedStyle.getPropertyValue("--color-card").trim() || "#ffffff",
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
      <div className='bg-card rounded-xl shadow-lg p-6 border border-border'>
        <h3 className='text-lg font-bold mb-4 text-foreground'>
          Portfolio Allocation
        </h3>
        <div className='text-center py-12'>
          <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center'>
            <PieChartIcon className='w-8 h-8 text-muted-foreground' />
          </div>
          <p className='text-muted-foreground font-medium'>
            No data to display
          </p>
          <p className='text-sm mt-2 text-muted-foreground'>
            Add holdings to see allocation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-card rounded-xl shadow-lg p-6 border border-border hover:shadow-xl transition-shadow'>
      <h3 className='text-lg font-bold mb-6 text-foreground'>
        Portfolio Allocation
      </h3>

      <ResponsiveContainer width='100%' height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx='50%'
            cy='50%'
            labelLine={false}
            outerRadius={95}
            innerRadius={60}
            dataKey='value'
            strokeWidth={2}
            stroke={chartColors.card}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                opacity={0.9}
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
              backgroundColor: chartColors.card,
              border: `1px solid ${chartColors.grid}`,
              borderRadius: "8px",
              color: chartColors.text,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            labelStyle={{
              color: chartColors.text,
              fontWeight: 600,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Allocation Table */}
      <div className='mt-6 border-t border-border pt-4'>
        <div className='space-y-3'>
          {chartData.map((item, index) => (
            <div
              key={item.name}
              className='flex items-center justify-between text-sm hover:bg-secondary/30 p-2 rounded-lg transition-colors'
            >
              <div className='flex items-center gap-2'>
                <div
                  className='w-3 h-3 rounded-full shadow-sm'
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className='font-semibold text-foreground'>
                  {item.name}
                </span>
              </div>
              <div className='flex items-center gap-4'>
                <span className='text-muted-foreground text-xs'>
                  LKR{" "}
                  {item.value.toLocaleString("en-LK", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className='font-bold min-w-[60px] text-right text-foreground'>
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
