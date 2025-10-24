"use client";

import { useState, useMemo } from "react";
import { ChartDataPoint, TimeFrame, ChartType } from "@/types";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { format, subDays, subMonths, subYears } from "date-fns";

interface StockChartProps {
  data: ChartDataPoint[];
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
}

export default function StockChart({
  data,
  symbol,
  currentPrice,
  change,
  changePercent,
}: StockChartProps) {
  console.debug(
    "StockChart: symbol=",
    symbol,
    "data.length=",
    data?.length,
    "currentPrice=",
    currentPrice,
    "change=",
    change,
    "changePercent=",
    changePercent
  );
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1M");
  const [chartType, setChartType] = useState<ChartType>("line");

  // Filter data based on timeframe
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    let cutoffDate: Date;

    switch (timeFrame) {
      case "1D":
        cutoffDate = subDays(now, 1);
        break;
      case "1W":
        cutoffDate = subDays(now, 7);
        break;
      case "1M":
        cutoffDate = subMonths(now, 1);
        break;
      case "3M":
        cutoffDate = subMonths(now, 3);
        break;
      case "6M":
        cutoffDate = subMonths(now, 6);
        break;
      case "1Y":
        cutoffDate = subYears(now, 1);
        break;
      case "ALL":
        return data;
      default:
        cutoffDate = subMonths(now, 1);
    }

    return data.filter((point) => new Date(point.date) >= cutoffDate);
  }, [data, timeFrame]);

  const timeFrames: TimeFrame[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "ALL"];
  const chartTypes: { type: ChartType; label: string }[] = [
    { type: "line", label: "Line" },
    { type: "area", label: "Area" },
    { type: "candlestick", label: "Candle" },
  ];

  const isPositive = change >= 0;

  interface TooltipPayload {
    payload: {
      date: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    };
  }

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: TooltipPayload[];
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-white p-4 rounded-lg shadow-lg border border-gray-200'>
          <p className='text-sm text-gray-600 mb-2'>
            {format(new Date(data.date), "MMM dd, yyyy")}
          </p>
          <div className='space-y-1'>
            <p className='text-sm'>
              <span className='text-gray-600'>Open: </span>
              <span className='font-semibold'>Rs. {data.open?.toFixed(2)}</span>
            </p>
            <p className='text-sm'>
              <span className='text-gray-600'>High: </span>
              <span className='font-semibold'>Rs. {data.high?.toFixed(2)}</span>
            </p>
            <p className='text-sm'>
              <span className='text-gray-600'>Low: </span>
              <span className='font-semibold'>Rs. {data.low?.toFixed(2)}</span>
            </p>
            <p className='text-sm'>
              <span className='text-gray-600'>Close: </span>
              <span className='font-semibold'>
                Rs. {data.close?.toFixed(2)}
              </span>
            </p>
            <p className='text-sm'>
              <span className='text-gray-600'>Volume: </span>
              <span className='font-semibold'>
                {(data.volume / 1000).toFixed(0)}K
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className='bg-white rounded-lg shadow-lg p-6'>
      {/* Header */}
      <div className='flex justify-between items-start mb-6'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>{symbol}</h2>
          <div className='flex items-center mt-2 space-x-4'>
            <p className='text-3xl font-bold text-gray-900'>
              Rs.{" "}
              {typeof currentPrice === "number"
                ? currentPrice.toFixed(2)
                : "N/A"}
            </p>
            <div
              className={`flex items-center ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? (
                <TrendingUp className='w-5 h-5 mr-1' />
              ) : (
                <TrendingDown className='w-5 h-5 mr-1' />
              )}
              <span className='text-lg font-semibold'>
                {typeof change === "number"
                  ? (isPositive ? "+" : "") + change.toFixed(2)
                  : "N/A"}{" "}
                {typeof changePercent === "number"
                  ? `(${isPositive ? "+" : ""}${changePercent.toFixed(2)}%)`
                  : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className='flex space-x-2'>
          {chartTypes.map((ct) => (
            <button
              key={ct.type}
              onClick={() => setChartType(ct.type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartType === ct.type
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className='h-[400px] mb-4'>
        <ResponsiveContainer width='100%' height='100%'>
          {chartType === "line" ? (
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis
                dataKey='date'
                tickFormatter={(date) => format(new Date(date), "MMM dd")}
                stroke='#9ca3af'
              />
              <YAxis stroke='#9ca3af' domain={["auto", "auto"]} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type='monotone'
                dataKey='close'
                stroke={isPositive ? "#10b981" : "#ef4444"}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          ) : chartType === "area" ? (
            <AreaChart data={filteredData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis
                dataKey='date'
                tickFormatter={(date) => format(new Date(date), "MMM dd")}
                stroke='#9ca3af'
              />
              <YAxis stroke='#9ca3af' domain={["auto", "auto"]} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type='monotone'
                dataKey='close'
                stroke={isPositive ? "#10b981" : "#ef4444"}
                fill={isPositive ? "#10b98120" : "#ef444420"}
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis
                dataKey='date'
                tickFormatter={(date) => format(new Date(date), "MMM dd")}
                stroke='#9ca3af'
              />
              <YAxis stroke='#9ca3af' domain={["auto", "auto"]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey='open' fill='#8b5cf6' name='Open' />
              <Bar dataKey='close' fill='#3b82f6' name='Close' />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Volume Chart */}
      <div className='h-[100px] mb-4'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={filteredData}>
            <XAxis dataKey='date' hide />
            <YAxis hide domain={[0, "auto"]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className='bg-white p-2 rounded shadow-lg border border-gray-200'>
                      <p className='text-sm'>
                        Volume:{" "}
                        {((payload[0].value as number) / 1000).toFixed(0)}K
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey='volume' fill='#60a5fa' opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Time Frame Selector */}
      <div className='flex justify-center space-x-2'>
        {timeFrames.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeFrame(tf)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeFrame === tf
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tf}
          </button>
        ))}
      </div>
    </div>
  );
}
