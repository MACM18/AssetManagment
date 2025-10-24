"use client";

import { useMemo } from "react";
import { PortfolioHoldingWithMetrics, StockQuote } from "@/types";
import {
  X,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StockDetailModalProps {
  holding: PortfolioHoldingWithMetrics;
  stockQuote?: StockQuote;
  onClose: () => void;
}

export default function StockDetailModal({
  holding,
  stockQuote,
  onClose,
}: StockDetailModalProps) {
  const isGain = holding.gainLoss >= 0;

  // Generate simple price history simulation (in real app, fetch actual history)
  const priceHistory = useMemo(() => {
    const days = 30;
    const data = [];
    const priceChange = holding.currentPrice - holding.purchasePrice;
    const dailyChange = priceChange / days;

    for (let i = 0; i < days; i++) {
      data.push({
        day: i + 1,
        price: holding.purchasePrice + dailyChange * i + Math.random() * 10 - 5,
      });
    }

    return data;
  }, [holding]);

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-start'>
          <div>
            <div className='flex items-center gap-3'>
              <h2 className='text-2xl font-bold text-gray-900'>
                {holding.symbol}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isGain
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isGain ? "+" : ""}
                {holding.gainLossPercent.toFixed(2)}%
              </span>
            </div>
            <p className='text-gray-600 mt-1'>{holding.companyName}</p>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <div className='p-6 space-y-6'>
          {/* Price Information */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-1'>
                <DollarSign className='w-4 h-4 text-blue-600' />
                <p className='text-xs font-medium text-blue-800 uppercase'>
                  Current Price
                </p>
              </div>
              <p className='text-xl font-bold text-blue-900'>
                LKR {holding.currentPrice.toFixed(2)}
              </p>
            </div>

            <div className='bg-purple-50 border border-purple-200 rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-1'>
                <Calendar className='w-4 h-4 text-purple-600' />
                <p className='text-xs font-medium text-purple-800 uppercase'>
                  Purchase Price
                </p>
              </div>
              <p className='text-xl font-bold text-purple-900'>
                LKR {holding.purchasePrice.toFixed(2)}
              </p>
            </div>

            <div
              className={`border rounded-lg p-4 ${
                isGain
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className='flex items-center gap-2 mb-1'>
                {isGain ? (
                  <TrendingUp className='w-4 h-4 text-green-600' />
                ) : (
                  <TrendingDown className='w-4 h-4 text-red-600' />
                )}
                <p
                  className={`text-xs font-medium uppercase ${
                    isGain ? "text-green-800" : "text-red-800"
                  }`}
                >
                  Gain/Loss
                </p>
              </div>
              <p
                className={`text-xl font-bold ${
                  isGain ? "text-green-900" : "text-red-900"
                }`}
              >
                {isGain ? "+" : ""}
                LKR {holding.gainLoss.toFixed(2)}
              </p>
            </div>

            <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
              <p className='text-xs font-medium text-gray-800 uppercase mb-1'>
                Quantity
              </p>
              <p className='text-xl font-bold text-gray-900'>
                {holding.quantity.toLocaleString()}
              </p>
              <p className='text-xs text-gray-600 mt-1'>shares</p>
            </div>
          </div>

          {/* Price Trend Chart */}
          <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
            <h3 className='text-sm font-bold text-gray-900 mb-4'>
              Price Trend (30 Days)
            </h3>
            <ResponsiveContainer width='100%' height={200}>
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray='3 3' stroke='#E5E7EB' />
                <XAxis
                  dataKey='day'
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  formatter={(value: number) => `LKR ${value.toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: "#FFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type='monotone'
                  dataKey='price'
                  stroke={isGain ? "#10B981" : "#EF4444"}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Investment Summary */}
          <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
            <h3 className='text-sm font-bold text-gray-900 mb-4'>
              Investment Summary
            </h3>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>Total Invested</span>
                <span className='text-sm font-semibold text-gray-900'>
                  LKR{" "}
                  {holding.invested.toLocaleString("en-LK", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>Current Value</span>
                <span className='text-sm font-semibold text-gray-900'>
                  LKR{" "}
                  {holding.currentValue.toLocaleString("en-LK", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className='flex justify-between items-center pt-3 border-t border-gray-300'>
                <span className='text-sm font-bold text-gray-700'>
                  Total Return
                </span>
                <div className='text-right'>
                  <span
                    className={`text-sm font-bold ${
                      isGain ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isGain ? "+" : ""}
                    LKR{" "}
                    {holding.gainLoss.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <p className='text-xs text-gray-600'>
                    {isGain ? "+" : ""}
                    {holding.gainLossPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {(stockQuote || holding.notes) && (
            <div className='space-y-4'>
              {stockQuote && (
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <h3 className='text-sm font-bold text-blue-900 mb-3'>
                    Market Data
                  </h3>
                  <div className='grid grid-cols-2 gap-3 text-sm'>
                    {stockQuote.high && (
                      <div>
                        <span className='text-blue-700'>High</span>
                        <p className='font-semibold text-blue-900'>
                          LKR {stockQuote.high.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {stockQuote.low && (
                      <div>
                        <span className='text-blue-700'>Low</span>
                        <p className='font-semibold text-blue-900'>
                          LKR {stockQuote.low.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {stockQuote.volume && (
                      <div>
                        <span className='text-blue-700'>Volume</span>
                        <p className='font-semibold text-blue-900'>
                          {stockQuote.volume.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {holding.notes && (
                <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                  <h3 className='text-sm font-bold text-gray-900 mb-2'>
                    Notes
                  </h3>
                  <p className='text-sm text-gray-700'>{holding.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
