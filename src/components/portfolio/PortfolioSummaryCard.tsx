"use client";

import { usePortfolio } from "@/contexts/PortfolioContext";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

export default function PortfolioSummaryCard() {
  const { summary, loading } = usePortfolio();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className='bg-white rounded-lg shadow-lg p-6 border border-gray-200'>
        <div className='text-center py-8'>
          <DollarSign className='w-12 h-12 text-gray-400 mx-auto mb-3' />
          <p className='text-gray-600 font-medium'>
            Sign in to track your portfolio
          </p>
          <p className='text-sm text-gray-500 mt-1'>
            Start managing your CSE stock investments
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='bg-white rounded-lg shadow-lg p-6 border border-gray-200'>
        <div className='animate-pulse space-y-4'>
          <div className='h-6 bg-gray-200 rounded w-1/3'></div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='h-20 bg-gray-200 rounded'></div>
            <div className='h-20 bg-gray-200 rounded'></div>
            <div className='h-20 bg-gray-200 rounded'></div>
            <div className='h-20 bg-gray-200 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary || summary.holdings.length === 0) {
    return (
      <div className='bg-white rounded-lg shadow-lg p-6 border border-gray-200'>
        <div className='text-center py-8'>
          <PieChart className='w-12 h-12 text-gray-400 mx-auto mb-3' />
          <p className='text-gray-600 font-medium'>No holdings yet</p>
          <p className='text-sm text-gray-500 mt-1'>
            Add your first stock to start tracking your portfolio
          </p>
        </div>
      </div>
    );
  }

  const isGain = summary.totalGainLoss >= 0;

  return (
    <div className='bg-white rounded-lg shadow-lg p-6 border border-gray-200'>
      <h2 className='text-xl font-bold text-gray-900 mb-4'>
        Portfolio Summary
      </h2>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {/* Total Invested */}
        <div className='bg-blue-50 rounded-lg p-4 border border-blue-200'>
          <div className='flex items-center gap-2 mb-1'>
            <DollarSign className='w-4 h-4 text-blue-600' />
            <p className='text-xs font-medium text-blue-800 uppercase'>
              Invested
            </p>
          </div>
          <p className='text-2xl font-bold text-blue-900'>
            {summary.totalInvested.toLocaleString("en-LK", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className='text-xs text-blue-700 mt-1'>LKR</p>
        </div>

        {/* Current Value */}
        <div className='bg-purple-50 rounded-lg p-4 border border-purple-200'>
          <div className='flex items-center gap-2 mb-1'>
            <TrendingUp className='w-4 h-4 text-purple-600' />
            <p className='text-xs font-medium text-purple-800 uppercase'>
              Current Value
            </p>
          </div>
          <p className='text-2xl font-bold text-purple-900'>
            {summary.currentValue.toLocaleString("en-LK", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className='text-xs text-purple-700 mt-1'>LKR</p>
        </div>

        {/* Gain/Loss Amount */}
        <div
          className={`rounded-lg p-4 border ${
            isGain ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
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
            className={`text-2xl font-bold ${
              isGain ? "text-green-900" : "text-red-900"
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
              isGain ? "text-green-700" : "text-red-700"
            }`}
          >
            LKR
          </p>
        </div>

        {/* Gain/Loss Percentage */}
        <div
          className={`rounded-lg p-4 border ${
            isGain ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          }`}
        >
          <div className='flex items-center gap-2 mb-1'>
            <PieChart
              className={`w-4 h-4 ${
                isGain ? "text-green-600" : "text-red-600"
              }`}
            />
            <p
              className={`text-xs font-medium uppercase ${
                isGain ? "text-green-800" : "text-red-800"
              }`}
            >
              Return
            </p>
          </div>
          <p
            className={`text-2xl font-bold ${
              isGain ? "text-green-900" : "text-red-900"
            }`}
          >
            {isGain ? "+" : ""}
            {summary.totalGainLossPercent.toFixed(2)}%
          </p>
          <p
            className={`text-xs mt-1 ${
              isGain ? "text-green-700" : "text-red-700"
            }`}
          >
            Overall
          </p>
        </div>
      </div>

      {/* Holdings Count */}
      <div className='mt-4 pt-4 border-t border-gray-200'>
        <div className='flex justify-between items-center text-sm'>
          <span className='text-gray-600'>Total Holdings</span>
          <span className='font-medium text-gray-900'>
            {summary.holdings.length} stock
            {summary.holdings.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
