"use client";

import { useMemo, useEffect, useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useTheme } from "@/contexts/ThemeContext";
import { PieChart, Pie, ResponsiveContainer, Tooltip, Cell } from "recharts";

// Predefined color palette for pie chart
const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#6366f1", // indigo
  "#84cc16", // lime
  "#f43f5e", // rose
  "#06b6d4", // cyan
];

export default function NetWorthAllocationChart() {
  const { summary, assetsSummary } = usePortfolio();
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

  type ChartItem = {
    name: string;
    value: number;
    percentage: number;
    type: "stock" | "asset";
  };

  const chartData: ChartItem[] = useMemo(() => {
    const items: ChartItem[] = [];

    // Add stock holdings
    if (summary?.holdings) {
      summary.holdings.forEach((holding) => {
        if (holding.currentValue > 0) {
          items.push({
            name: holding.symbol,
            value: holding.currentValue,
            percentage: 0, // will calculate later
            type: "stock",
          });
        }
      });
    }

    // Add assets grouped by type
    if (assetsSummary?.byType) {
      assetsSummary.byType.forEach(({ type, value }) => {
        if (value > 0) {
          const displayName = type
            .replace("-", " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize words
          items.push({
            name: displayName,
            value,
            percentage: 0,
            type: "asset",
          });
        }
      });
    }

    // Calculate total and percentages
    const total = items.reduce((sum, item) => sum + item.value, 0);
    if (total > 0) {
      items.forEach((item) => {
        item.percentage = (item.value / total) * 100;
      });
    }

    // Sort by value descending
    items.sort((a, b) => b.value - a.value);

    return items;
  }, [summary, assetsSummary]);

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <div className='bg-card rounded-lg shadow-lg p-6 border border-border'>
        <h3 className='text-lg font-bold mb-4 text-foreground'>
          Net Worth Allocation
        </h3>
        <div className='text-center py-8'>
          <p className='text-muted-foreground'>No data to display</p>
          <p className='text-sm mt-1 text-muted-foreground'>
            Add holdings or assets to see allocation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-card rounded-lg shadow-lg p-6 border border-border'>
      <h3 className='text-lg font-bold mb-4 text-foreground'>
        Net Worth Allocation
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
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    item.type === "stock"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  }`}
                >
                  {item.type}
                </span>
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
        <div className='mt-4 pt-3 border-t border-border'>
          <div className='flex justify-between text-sm font-semibold'>
            <span>Total Net Worth</span>
            <span>
              LKR{" "}
              {totalValue.toLocaleString("en-LK", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
