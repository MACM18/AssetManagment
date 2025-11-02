"use client";

import { useMemo } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";

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
    <div className='rounded-xl shadow-lg p-6 border border-border bg-card hover:shadow-xl transition-shadow'>
      <div className='flex items-center gap-2 mb-6'>
        <Trophy className='w-5 h-5 text-primary' />
        <h3 className='text-lg font-bold text-foreground'>
          Top Holdings by Value
        </h3>
      </div>

      <div className='space-y-3'>
        {topHoldings.map((holding, index) => {
          const percentage = (holding.currentValue / totalPortfolioValue) * 100;
          const isGain = holding.gainLoss >= 0;

          return (
            <div
              key={holding.id}
              className='flex items-center gap-4 p-3 rounded-lg transition-all border border-border bg-secondary/20 hover:bg-secondary/40 hover:shadow-sm'
            >
              {/* Rank */}
              <div
                className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                  index === 0
                    ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700"
                    : index === 1
                    ? "bg-gray-100 text-gray-700 border-2 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-600"
                    : index === 2
                    ? "bg-orange-100 text-orange-700 border-2 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700"
                    : "bg-secondary border-2 border-border text-foreground"
                }`}
              >
                <span>{index + 1}</span>
              </div>

              {/* Stock Info */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-1'>
                  <p className='font-bold text-foreground'>{holding.symbol}</p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                      isGain
                        ? "bg-success/10 text-success border-success/30"
                        : "bg-destructive/10 text-destructive border-destructive/30"
                    }`}
                  >
                    <div className='flex items-center gap-0.5'>
                      {isGain ? (
                        <TrendingUp className='w-3 h-3' />
                      ) : (
                        <TrendingDown className='w-3 h-3' />
                      )}
                      {isGain ? "+" : ""}
                      {holding.gainLossPercent.toFixed(2)}%
                    </div>
                  </span>
                </div>
                <p className='text-xs text-muted-foreground truncate'>
                  {holding.companyName}
                </p>
              </div>

              {/* Value and Percentage */}
              <div className='text-right flex-shrink-0'>
                <p className='font-bold text-foreground text-sm'>
                  LKR{" "}
                  {holding.currentValue.toLocaleString("en-LK", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className='text-xs text-primary font-semibold'>
                  {percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {summary && summary.holdings.length > 5 && (
        <div className='mt-4 pt-4 border-t border-border'>
          <p className='text-sm text-muted-foreground text-center'>
            Showing top 5 of{" "}
            <span className='font-semibold text-foreground'>
              {summary.holdings.length}
            </span>{" "}
            holdings
          </p>
        </div>
      )}
    </div>
  );
}
