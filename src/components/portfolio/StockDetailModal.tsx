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
    <div className='fixed inset-0 flex items-center justify-center z-50 p-4'>
      <div className='rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border'>
        {/* Header */}
        <div className='sticky top-0 border-b px-6 py-4 flex justify-between items-start'>
          <div>
            <div className='flex items-center gap-3'>
              <h2 className='text-2xl font-bold'>
                {holding.symbol}
              </h2>
              <span className='px-3 py-1 rounded-full text-sm font-medium border'>
                {isGain ? "+" : ""}
                {holding.gainLossPercent.toFixed(2)}%
              </span>
            </div>
            <p className='mt-1'>{holding.companyName}</p>
          </div>
          <button
            onClick={onClose}
            className='transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <div className='p-6 space-y-6'>
          {/* Price Information */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='border rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-1'>
                <DollarSign className='w-4 h-4' />
                <p className='text-xs font-medium uppercase'>
                  Current Price
                </p>
              </div>
              <p className='text-xl font-bold'>
                LKR {holding.currentPrice.toFixed(2)}
              </p>
            </div>

            <div className='border rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-1'>
                <Calendar className='w-4 h-4' />
                <p className='text-xs font-medium uppercase'>
                  Purchase Price
                </p>
              </div>
              <p className='text-xl font-bold'>
                LKR {holding.purchasePrice.toFixed(2)}
              </p>
            </div>

            <div className='border rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-1'>
                {isGain ? (
                  <TrendingUp className='w-4 h-4' />
                ) : (
                  <TrendingDown className='w-4 h-4' />
                )}
                <p className='text-xs font-medium uppercase'>
                  Gain/Loss
                </p>
              </div>
              <p className='text-xl font-bold'>
                {isGain ? "+" : ""}
                LKR {holding.gainLoss.toFixed(2)}
              </p>
            </div>

            <div className='border rounded-lg p-4'>
              <p className='text-xs font-medium uppercase mb-1'>
                Quantity
              </p>
              <p className='text-xl font-bold'>
                {holding.quantity.toLocaleString()}
              </p>
              <p className='text-xs mt-1'>shares</p>
            </div>
          </div>

          {/* Price Trend Chart */}
          <div className='border rounded-lg p-4'>
            <h3 className='text-sm font-bold mb-4'>
              Price Trend (30 Days)
            </h3>
            <ResponsiveContainer width='100%' height={200}>
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='day' />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip formatter={(value: number) => `LKR ${value.toFixed(2)}`} />
                <Line type='monotone' dataKey='price' strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Investment Summary */}
          <div className='border rounded-lg p-4'>
            <h3 className='text-sm font-bold mb-4'>
              Investment Summary
            </h3>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-sm'>Total Invested</span>
                <span className='text-sm font-semibold'>
                  LKR{" "}
                  {holding.invested.toLocaleString("en-LK", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm'>Current Value</span>
                <span className='text-sm font-semibold'>
                  LKR{" "}
                  {holding.currentValue.toLocaleString("en-LK", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className='flex justify-between items-center pt-3 border-t'>
                <span className='text-sm font-bold'>
                  Total Return
                </span>
                <div className='text-right'>
                  <span className='text-sm font-bold'>
                    {isGain ? "+" : ""}
                    LKR{" "}
                    {holding.gainLoss.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <p className='text-xs'>
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
                <div className='border rounded-lg p-4'>
                  <h3 className='text-sm font-bold mb-3'>
                    Market Data
                  </h3>
                  <div className='grid grid-cols-2 gap-3 text-sm'>
                    {stockQuote.high && (
                      <div>
                        <span>High</span>
                        <p className='font-semibold'>
                          LKR {stockQuote.high.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {stockQuote.low && (
                      <div>
                        <span>Low</span>
                        <p className='font-semibold'>
                          LKR {stockQuote.low.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {stockQuote.volume && (
                      <div>
                        <span>Volume</span>
                        <p className='font-semibold'>
                          {stockQuote.volume.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {holding.notes && (
                <div className='border rounded-lg p-4'>
                  <h3 className='text-sm font-bold mb-2'>
                    Notes
                  </h3>
                  <p className='text-sm'>{holding.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
