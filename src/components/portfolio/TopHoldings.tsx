"use client";

import { useMemo } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";

export default function TopHoldings() {
  const { summary } = usePortfolio();

  const topHoldings = useMemo(() => {
    if (!summary || summary.holdings.length === 0) return [];

    return [...summary.holdings]
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 5);
  }, [summary]);

  if (topHoldings.length === 0) {
    return null;
  }

  const totalPortfolioValue = summary?.currentValue || 0;

  return (
    <div className='bg-white rounded-lg shadow-lg p-6 border border-gray-200'>
      <h3 className='text-lg font-bold text-gray-900 mb-4'>
        Top Holdings by Value
      </h3>

      <div className='space-y-3'>
        {topHoldings.map((holding, index) => {
          const percentage = (holding.currentValue / totalPortfolioValue) * 100;
          const isGain = holding.gainLoss >= 0;

          return (
            <div
              key={holding.id}
              className='flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
            >
              {/* Rank */}
              <div className='flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center'>
                <span className='text-sm font-bold text-blue-700'>
                  {index + 1}
                </span>
              </div>

              {/* Stock Info */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <p className='font-bold text-gray-900'>{holding.symbol}</p>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      isGain
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {isGain ? "+" : ""}
                    {holding.gainLossPercent.toFixed(2)}%
                  </span>
                </div>
                <p className='text-xs text-gray-600 truncate'>
                  {holding.companyName}
                </p>
              </div>

              {/* Value and Percentage */}
              <div className='text-right flex-shrink-0'>
                <p className='font-bold text-gray-900'>
                  {holding.currentValue.toLocaleString("en-LK", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className='text-xs text-gray-600'>
                  {percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {summary && summary.holdings.length > 5 && (
        <div className='mt-4 pt-4 border-t border-gray-200'>
          <p className='text-sm text-gray-600'>
            Showing top 5 of {summary.holdings.length} holdings
          </p>
        </div>
      )}
    </div>
  );
}
