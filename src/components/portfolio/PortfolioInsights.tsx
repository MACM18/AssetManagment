"use client";

import { usePortfolio } from "@/contexts/PortfolioContext";
import { TrendingUp, TrendingDown, Award, Target } from "lucide-react";

export default function PortfolioInsights() {
  const { summary } = usePortfolio();

  if (!summary || summary.holdings.length === 0) {
    return null;
  }

  // Calculate insights
  const bestPerformer = summary.holdings.reduce((best, holding) =>
    holding.gainLossPercent > best.gainLossPercent ? holding : best
  );

  const worstPerformer = summary.holdings.reduce((worst, holding) =>
    holding.gainLossPercent < worst.gainLossPercent ? holding : worst
  );

  const avgGainLoss =
    summary.holdings.reduce((sum, h) => sum + h.gainLossPercent, 0) /
    summary.holdings.length;

  const profitableHoldings = summary.holdings.filter(
    (h) => h.gainLoss > 0
  ).length;
  const profitablePercentage =
    (profitableHoldings / summary.holdings.length) * 100;

  return (
    <div className='rounded-lg shadow-lg p-6 border'>
      <h3 className='text-lg font-bold mb-4'>Portfolio Insights</h3>

      <div className='space-y-4'>
        {/* Best Performer */}
        <div className='border rounded-lg p-4'>
          <div className='flex items-start justify-between'>
            <div className='flex items-start gap-3'>
              <div className='p-2 rounded-full border'>
                <Award className='w-5 h-5' />
              </div>
              <div>
                <p className='text-sm font-medium'>Best Performer</p>
                <p className='text-lg font-bold'>{bestPerformer.symbol}</p>
                <p className='text-xs mt-1'>{bestPerformer.companyName}</p>
              </div>
            </div>
            <div className='text-right'>
              <div className='flex items-center gap-1'>
                <TrendingUp className='w-4 h-4' />
                <span className='text-lg font-bold'>
                  +{bestPerformer.gainLossPercent.toFixed(2)}%
                </span>
              </div>
              <p className='text-xs mt-1'>
                +LKR {bestPerformer.gainLoss.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Worst Performer */}
        {worstPerformer.gainLossPercent < 0 && (
          <div className='border rounded-lg p-4'>
            <div className='flex items-start justify-between'>
              <div className='flex items-start gap-3'>
                <div className='p-2 rounded-full border'>
                  <TrendingDown className='w-5 h-5' />
                </div>
                <div>
                  <p className='text-sm font-medium'>Needs Attention</p>
                  <p className='text-lg font-bold'>{worstPerformer.symbol}</p>
                  <p className='text-xs mt-1'>{worstPerformer.companyName}</p>
                </div>
              </div>
              <div className='text-right'>
                <div className='flex items-center gap-1'>
                  <TrendingDown className='w-4 h-4' />
                  <span className='text-lg font-bold'>
                    {worstPerformer.gainLossPercent.toFixed(2)}%
                  </span>
                </div>
                <p className='text-xs mt-1'>
                  LKR {worstPerformer.gainLoss.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Metrics */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='border rounded-lg p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <Target className='w-4 h-4' />
              <p className='text-xs font-medium uppercase'>Avg Return</p>
            </div>
            <p className='text-2xl font-bold'>
              {avgGainLoss >= 0 ? "+" : ""}
              {avgGainLoss.toFixed(2)}%
            </p>
          </div>

          <div className='border rounded-lg p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <Award className='w-4 h-4' />
              <p className='text-xs font-medium uppercase'>Win Rate</p>
            </div>
            <p className='text-2xl font-bold'>
              {profitablePercentage.toFixed(0)}%
            </p>
            <p className='text-xs mt-1'>
              {profitableHoldings} of {summary.holdings.length} profitable
            </p>
          </div>
        </div>

        {/* Diversification Score */}
        <div className='border rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-sm font-medium'>Diversification</p>
            <p className='text-sm font-bold'>
              {summary.holdings.length} stock
              {summary.holdings.length !== 1 ? "s" : ""}
            </p>
          </div>
          <p className='text-xs mt-2'>
            {summary.holdings.length < 5
              ? "Consider adding more stocks for better diversification"
              : summary.holdings.length < 10
              ? "Good diversification - consider 10+ stocks for optimal spread"
              : "Well diversified portfolio"}
          </p>
        </div>
      </div>
    </div>
  );
}
