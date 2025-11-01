"use client";

import { usePortfolio } from "@/contexts/PortfolioContext";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

export default function PortfolioSummaryCard() {
  const { summary, loading } = usePortfolio();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className='rounded-lg p-6 border'>
        <div className='text-center py-8'>
          <DollarSign className='w-12 h-12 mx-auto mb-3' />
          <p className='font-medium'>Sign in to track your portfolio</p>
          <p className='text-sm mt-1'>
            Start managing your CSE stock investments
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='rounded-lg p-6 border'>
        <div className='animate-pulse space-y-4'>
          <div className='h-6 rounded w-1/3 border'></div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='h-20 rounded border'></div>
            <div className='h-20 rounded border'></div>
            <div className='h-20 rounded border'></div>
            <div className='h-20 rounded border'></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary || summary.holdings.length === 0) {
    return (
      <div className='rounded-lg p-6 border'>
        <div className='text-center py-8'>
          <PieChart className='w-12 h-12 mx-auto mb-3' />
          <p className='font-medium'>No holdings yet</p>
          <p className='text-sm mt-1'>
            Add your first stock to start tracking your portfolio
          </p>
        </div>
      </div>
    );
  }

  const isGain = summary.totalGainLoss >= 0;

  return (
    <div className='rounded-xl p-6 border'>
      <h2 className='text-xl font-bold mb-6'>Portfolio Summary</h2>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
        {/* Total Invested */}
        <div className='rounded-lg p-4 border'>
          <div className='flex items-center gap-2 mb-1'>
            <DollarSign className='w-4 h-4' />
            <p className='text-xs font-medium uppercase tracking-wider'>
              Invested
            </p>
          </div>
          <p className='text-2xl font-bold'>
            {summary.totalInvested.toLocaleString("en-LK", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className='text-xs mt-1'>LKR</p>
        </div>

        {/* Current Value */}
        <div className='rounded-lg p-4 border'>
          <div className='flex items-center gap-2 mb-1'>
            <TrendingUp className='w-4 h-4' />
            <p className='text-xs font-medium uppercase tracking-wider'>
              Current Value
            </p>
          </div>
          <p className='text-2xl font-bold'>
            {summary.currentValue.toLocaleString("en-LK", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className='text-xs mt-1'>LKR</p>
        </div>

        {/* Gain/Loss Amount */}
        <div className='rounded-lg p-4 border'>
          <div className='flex items-center gap-2 mb-1'>
            {isGain ? (
              <TrendingUp className='w-4 h-4' />
            ) : (
              <TrendingDown className='w-4 h-4' />
            )}
            <p className='text-xs font-medium uppercase tracking-wider'>
              Gain/Loss
            </p>
          </div>
          <p className='text-2xl font-bold'>
            {isGain ? "+" : ""}
            {summary.totalGainLoss.toLocaleString("en-LK", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className='text-xs mt-1'>LKR</p>
        </div>

        {/* Gain/Loss Percentage */}
        <div className='rounded-lg p-4 border'>
          <div className='flex items-center gap-2 mb-1'>
            <PieChart className='w-4 h-4' />
            <p className='text-xs font-medium uppercase tracking-wider'>
              Return
            </p>
          </div>
          <p className='text-2xl font-bold'>
            {isGain ? "+" : ""}
            {summary.totalGainLossPercent.toFixed(2)}%
          </p>
          <p className='text-xs mt-1'>Overall</p>
        </div>
      </div>

      {/* Holdings Count */}
      <div className='mt-6 pt-4 border-t'>
        <div className='flex justify-between items-center text-sm'>
          <span>Total Holdings</span>
          <span className='font-medium'>
            {summary.holdings.length} stock
            {summary.holdings.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
