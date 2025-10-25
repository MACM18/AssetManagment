"use client";

import { usePortfolio } from "@/contexts/PortfolioContext";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

export default function PortfolioSummaryCard() {
  const { summary, loading } = usePortfolio();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700'>
        <div className='text-center py-8'>
          <DollarSign className='w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3' />
          <p className='text-gray-600 dark:text-gray-300 font-medium'>
            Sign in to track your portfolio
          </p>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
            Start managing your CSE stock investments
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700'>
        <div className='animate-pulse space-y-4'>
          <div className='h-6 bg-gray-200 dark:bg-gray-700 dark:bg-gray-700 rounded w-1/3'></div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='h-20 bg-gray-200 dark:bg-gray-700 dark:bg-gray-700 rounded'></div>
            <div className='h-20 bg-gray-200 dark:bg-gray-700 dark:bg-gray-700 rounded'></div>
            <div className='h-20 bg-gray-200 dark:bg-gray-700 dark:bg-gray-700 rounded'></div>
            <div className='h-20 bg-gray-200 dark:bg-gray-700 dark:bg-gray-700 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary || summary.holdings.length === 0) {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700'>
        <div className='text-center py-8'>
          <PieChart className='w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3' />
          <p className='text-gray-600 dark:text-gray-300 font-medium'>
            No holdings yet
          </p>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
            Add your first stock to start tracking your portfolio
          </p>
        </div>
      </div>
    );
  }

  const isGain = summary.totalGainLoss >= 0;

  return (
    <div className='bg-white dark:bg-gray-800/50 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm'>
      <h2 className='text-xl font-bold text-gray-900 dark:text-gray-100 mb-6'>
        Portfolio Summary
      </h2>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
        {/* Total Invested */}
        <div className='bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800/50'>
          <div className='flex items-center gap-2 mb-1'>
            <DollarSign className='w-4 h-4 text-blue-600 dark:text-blue-400' />
            <p className='text-xs font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wider'>
              Invested
            </p>
          </div>
          <p className='text-2xl font-bold text-blue-900 dark:text-blue-100'>
            {summary.totalInvested.toLocaleString("en-LK", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className='text-xs text-blue-700 dark:text-blue-400 mt-1'>LKR</p>
        </div>

        {/* Current Value */}
        <div className='bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800/50'>
          <div className='flex items-center gap-2 mb-1'>
            <TrendingUp className='w-4 h-4 text-purple-600 dark:text-purple-400' />
            <p className='text-xs font-medium text-purple-800 dark:text-purple-300 uppercase tracking-wider'>
              Current Value
            </p>
          </div>
          <p className='text-2xl font-bold text-purple-900 dark:text-purple-100'>
            {summary.currentValue.toLocaleString("en-LK", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className='text-xs text-purple-700 dark:text-purple-400 mt-1'>
            LKR
          </p>
        </div>

        {/* Gain/Loss Amount */}
        <div
          className={`rounded-lg p-4 border ${
            isGain
              ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800/50"
              : "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800/50"
          }`}
        >
          <div className='flex items-center gap-2 mb-1'>
            {isGain ? (
              <TrendingUp className='w-4 h-4 text-green-600 dark:text-green-400' />
            ) : (
              <TrendingDown className='w-4 h-4 text-red-600 dark:text-red-400' />
            )}
            <p
              className={`text-xs font-medium uppercase tracking-wider ${
                isGain
                  ? "text-green-800 dark:text-green-300"
                  : "text-red-800 dark:text-red-300"
              }`}
            >
              Gain/Loss
            </p>
          </div>
          <p
            className={`text-2xl font-bold ${
              isGain
                ? "text-green-900 dark:text-green-100"
                : "text-red-900 dark:text-red-100"
            }`}
          >
            {isGain ? "+" : ""}
            {summary.totalGainLoss.toLocaleString("en-LK", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p
            className={`text-xs mt-1 ${
              isGain
                ? "text-green-700 dark:text-green-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            LKR
          </p>
        </div>

        {/* Gain/Loss Percentage */}
        <div
          className={`rounded-lg p-4 border ${
            isGain
              ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800/50"
              : "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800/50"
          }`}
        >
          <div className='flex items-center gap-2 mb-1'>
            <PieChart
              className={`w-4 h-4 ${
                isGain
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            />
            <p
              className={`text-xs font-medium uppercase tracking-wider ${
                isGain
                  ? "text-green-800 dark:text-green-300"
                  : "text-red-800 dark:text-red-300"
              }`}
            >
              Return
            </p>
          </div>
          <p
            className={`text-2xl font-bold ${
              isGain
                ? "text-green-900 dark:text-green-100"
                : "text-red-900 dark:text-red-100"
            }`}
          >
            {isGain ? "+" : ""}
            {summary.totalGainLossPercent.toFixed(2)}%
          </p>
          <p
            className={`text-xs mt-1 ${
              isGain
                ? "text-green-700 dark:text-green-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            Overall
          </p>
        </div>
      </div>

      {/* Holdings Count */}
      <div className='mt-6 pt-4 border-t border-gray-200 dark:border-gray-700/50'>
        <div className='flex justify-between items-center text-sm'>
          <span className='text-gray-600 dark:text-gray-400'>
            Total Holdings
          </span>
          <span className='font-medium text-gray-900 dark:text-gray-100'>
            {summary.holdings.length} stock
            {summary.holdings.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
