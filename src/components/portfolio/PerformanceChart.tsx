"use client";

import { useMemo, useEffect, useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useTheme } from "@/contexts/ThemeContext";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
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
    card: "#ffffff",
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
        computedStyle.getPropertyValue("--color-background").trim() ||
        "#ffffff",
      card: computedStyle.getPropertyValue("--color-card").trim() || "#ffffff",
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
      <div className='bg-card rounded-xl shadow-lg p-6 border border-border'>
        <h3 className='text-lg font-bold mb-4 text-foreground'>
          Performance by Stock
        </h3>
        <div className='text-center py-12'>
          <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center'>
            <BarChart3 className='w-8 h-8 text-muted-foreground' />
          </div>
          <p className='text-muted-foreground font-medium'>
            No data to display
          </p>
          <p className='text-sm mt-2 text-muted-foreground'>
            Add holdings to see performance
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-card rounded-xl shadow-lg p-6 border border-border hover:shadow-xl transition-shadow'>
      <h3 className='text-lg font-bold mb-6 text-foreground'>
        Performance by Stock
      </h3>

      <ResponsiveContainer width='100%' height={280}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray='3 3'
            stroke={chartColors.grid}
            opacity={0.3}
            vertical={false}
          />
          <XAxis
            dataKey='symbol'
            stroke={chartColors.muted}
            tick={{ fill: chartColors.text, fontSize: 11 }}
            tickLine={{ stroke: chartColors.grid }}
          />
          <YAxis
            tickFormatter={(value) => `${value >= 0 ? "+" : ""}${value}`}
            stroke={chartColors.muted}
            tick={{ fill: chartColors.text, fontSize: 11 }}
            tickLine={{ stroke: chartColors.grid }}
          />
          <Tooltip
            cursor={{ fill: chartColors.grid, opacity: 0.1 }}
            formatter={(value: number) =>
              `LKR ${value.toLocaleString("en-LK", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            }
            contentStyle={{
              backgroundColor: actualTheme === "dark" ? "#1f2937" : "#ffffff",
              border: `1px solid ${
                actualTheme === "dark" ? "#374151" : "#e5e7eb"
              }`,
              borderRadius: "8px",
              color: actualTheme === "dark" ? "#f9fafb" : "#111827",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            labelStyle={{
              color: actualTheme === "dark" ? "#f9fafb" : "#111827",
              fontWeight: 600,
            }}
            itemStyle={{
              color: actualTheme === "dark" ? "#e5e7eb" : "#374151",
            }}
          />
          <Bar dataKey='gainLoss' radius={[6, 6, 0, 0]} maxBarSize={60}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.gainLoss >= 0
                    ? chartColors.success
                    : chartColors.destructive
                }
                opacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Performance Summary */}
      <div className='mt-6 border-t border-border pt-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-success/10 border border-success/30 rounded-lg p-3 hover:bg-success/15 transition-colors'>
            <div className='flex items-center gap-2 mb-2'>
              <TrendingUp className='w-4 h-4 text-success' />
              <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                Biggest Gain
              </p>
            </div>
            <p className='font-bold text-foreground text-lg'>
              {chartData[0]?.symbol || "N/A"}
            </p>
            {chartData[0] && (
              <span className='text-sm font-semibold text-success'>
                +{chartData[0].gainLossPercent.toFixed(2)}%
              </span>
            )}
          </div>
          <div className='bg-destructive/10 border border-destructive/30 rounded-lg p-3 hover:bg-destructive/15 transition-colors'>
            <div className='flex items-center gap-2 mb-2'>
              <TrendingDown className='w-4 h-4 text-destructive' />
              <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                Biggest Loss
              </p>
            </div>
            <p className='font-bold text-foreground text-lg'>
              {chartData[chartData.length - 1]?.symbol || "N/A"}
            </p>
            {chartData[chartData.length - 1] &&
              chartData[chartData.length - 1].gainLoss < 0 && (
                <span className='text-sm font-semibold text-destructive'>
                  {chartData[chartData.length - 1].gainLossPercent.toFixed(2)}%
                </span>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
