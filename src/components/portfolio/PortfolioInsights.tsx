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
    <div className='bg-white rounded-lg shadow-lg p-6 border border-gray-200'>
      <h3 className='text-lg font-bold text-gray-900 mb-4'>
        Portfolio Insights
      </h3>

      <div className='space-y-4'>
        {/* Best Performer */}
        <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
          <div className='flex items-start justify-between'>
            <div className='flex items-start gap-3'>
              <div className='p-2 bg-green-100 rounded-full'>
                <Award className='w-5 h-5 text-green-600' />
              </div>
              <div>
                <p className='text-sm font-medium text-green-900'>
                  Best Performer
                </p>
                <p className='text-lg font-bold text-green-700'>
                  {bestPerformer.symbol}
                </p>
                <p className='text-xs text-green-600 mt-1'>
                  {bestPerformer.companyName}
                </p>
              </div>
            </div>
            <div className='text-right'>
              <div className='flex items-center gap-1 text-green-700'>
                <TrendingUp className='w-4 h-4' />
                <span className='text-lg font-bold'>
                  +{bestPerformer.gainLossPercent.toFixed(2)}%
                </span>
              </div>
              <p className='text-xs text-green-600 mt-1'>
                +LKR {bestPerformer.gainLoss.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Worst Performer */}
        {worstPerformer.gainLossPercent < 0 && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-start justify-between'>
              <div className='flex items-start gap-3'>
                <div className='p-2 bg-red-100 rounded-full'>
                  <TrendingDown className='w-5 h-5 text-red-600' />
                </div>
                <div>
                  <p className='text-sm font-medium text-red-900'>
                    Needs Attention
                  </p>
                  <p className='text-lg font-bold text-red-700'>
                    {worstPerformer.symbol}
                  </p>
                  <p className='text-xs text-red-600 mt-1'>
                    {worstPerformer.companyName}
                  </p>
                </div>
              </div>
              <div className='text-right'>
                <div className='flex items-center gap-1 text-red-700'>
                  <TrendingDown className='w-4 h-4' />
                  <span className='text-lg font-bold'>
                    {worstPerformer.gainLossPercent.toFixed(2)}%
                  </span>
                </div>
                <p className='text-xs text-red-600 mt-1'>
                  LKR {worstPerformer.gainLoss.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Metrics */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <Target className='w-4 h-4 text-blue-600' />
              <p className='text-xs font-medium text-blue-800 uppercase'>
                Avg Return
              </p>
            </div>
            <p
              className={`text-2xl font-bold ${
                avgGainLoss >= 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              {avgGainLoss >= 0 ? "+" : ""}
              {avgGainLoss.toFixed(2)}%
            </p>
          </div>

          <div className='bg-purple-50 border border-purple-200 rounded-lg p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <Award className='w-4 h-4 text-purple-600' />
              <p className='text-xs font-medium text-purple-800 uppercase'>
                Win Rate
              </p>
            </div>
            <p className='text-2xl font-bold text-purple-700'>
              {profitablePercentage.toFixed(0)}%
            </p>
            <p className='text-xs text-purple-600 mt-1'>
              {profitableHoldings} of {summary.holdings.length} profitable
            </p>
          </div>
        </div>

        {/* Diversification Score */}
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-sm font-medium text-gray-700'>Diversification</p>
            <p className='text-sm font-bold text-gray-900'>
              {summary.holdings.length} stock
              {summary.holdings.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-blue-600 h-2 rounded-full transition-all'
              style={{
                width: `${Math.min(
                  (summary.holdings.length / 10) * 100,
                  100
                )}%`,
              }}
            />
          </div>
          <p className='text-xs text-gray-500 mt-2'>
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
