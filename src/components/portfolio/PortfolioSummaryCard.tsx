"use client";

import { usePortfolio } from "@/contexts/PortfolioContext";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

export default function PortfolioSummaryCard() {
  const { summary, loading } = usePortfolio();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className='rounded-xl p-6 bg-card border border-border shadow-sm'>
        <div className='text-center py-8'>
          <DollarSign className='w-12 h-12 mx-auto mb-3 text-muted-foreground' />
          <p className='font-medium text-foreground'>
            Sign in to track your portfolio
          </p>
          <p className='text-sm mt-1 text-muted-foreground'>
            Start managing your CSE stock investments
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='rounded-xl p-6 bg-card border border-border shadow-sm'>
        <div className='animate-pulse space-y-4'>
          <div className='h-6 bg-muted rounded w-1/3'></div>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='h-24 bg-muted rounded-lg'></div>
            <div className='h-24 bg-muted rounded-lg'></div>
            <div className='h-24 bg-muted rounded-lg'></div>
            <div className='h-24 bg-muted rounded-lg'></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary || summary.holdings.length === 0) {
    return (
      <div className='rounded-xl p-6 bg-card border border-border shadow-sm'>
        <div className='text-center py-8'>
          <PieChart className='w-12 h-12 mx-auto mb-3 text-muted-foreground' />
          <p className='font-medium text-foreground'>No holdings yet</p>
          <p className='text-sm mt-1 text-muted-foreground'>
            Add your first stock to start tracking your portfolio
          </p>
        </div>
      </div>
    );
  }

  const isGain = summary.totalGainLoss >= 0;

  return (
    <div className='rounded-xl p-6 bg-card border border-border shadow-lg'>
      <h2 className='text-xl font-bold mb-6 text-foreground'>
        Portfolio Summary
      </h2>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6'>
        {/* Total Invested */}
        <div className='rounded-lg p-4 bg-secondary/30 border border-border shadow-sm hover:shadow-md transition-shadow'>
          <div className='flex items-center gap-2 mb-2'>
            <div className='p-1.5 rounded-md bg-primary/10'>
              <DollarSign className='w-4 h-4 text-primary' />
            </div>
            <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
              Invested
            </p>
          </div>
          <p className='text-xl md:text-2xl font-bold text-foreground'>
            {summary.totalInvested.toLocaleString("en-LK", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className='text-xs mt-1 text-muted-foreground'>LKR</p>
        </div>

        {/* Current Value */}
        <div className='rounded-lg p-4 bg-secondary/30 border border-border shadow-sm hover:shadow-md transition-shadow'>
          <div className='flex items-center gap-2 mb-2'>
            <div className='p-1.5 rounded-md bg-primary/10'>
              <TrendingUp className='w-4 h-4 text-primary' />
            </div>
            <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
              Current Value
            </p>
          </div>
          <p className='text-xl md:text-2xl font-bold text-foreground'>
            {summary.currentValue.toLocaleString("en-LK", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className='text-xs mt-1 text-muted-foreground'>LKR</p>
        </div>

        {/* Gain/Loss Amount */}
        <div
          className={`rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow ${
            isGain
              ? "bg-success/10 border-success/30"
              : "bg-destructive/10 border-destructive/30"
          }`}
        >
          <div className='flex items-center gap-2 mb-2'>
            <div
              className={`p-1.5 rounded-md ${
                isGain ? "bg-success/20" : "bg-destructive/20"
              }`}
            >
              {isGain ? (
                <TrendingUp className='w-4 h-4 text-success' />
              ) : (
                <TrendingDown className='w-4 h-4 text-destructive' />
              )}
            </div>
            <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
              Gain/Loss
            </p>
          </div>
          <p
            className={`text-xl md:text-2xl font-bold ${
              isGain ? "text-success" : "text-destructive"
            }`}
          >
            {isGain ? "+" : ""}
            {summary.totalGainLoss.toLocaleString("en-LK", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className='text-xs mt-1 text-muted-foreground'>LKR</p>
        </div>

        {/* Gain/Loss Percentage */}
        <div
          className={`rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow ${
            isGain
              ? "bg-success/10 border-success/30"
              : "bg-destructive/10 border-destructive/30"
          }`}
        >
          <div className='flex items-center gap-2 mb-2'>
            <div
              className={`p-1.5 rounded-md ${
                isGain ? "bg-success/20" : "bg-destructive/20"
              }`}
            >
              <PieChart
                className={`w-4 h-4 ${
                  isGain ? "text-success" : "text-destructive"
                }`}
              />
            </div>
            <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
              Return
            </p>
          </div>
          <p
            className={`text-xl md:text-2xl font-bold ${
              isGain ? "text-success" : "text-destructive"
            }`}
          >
            {isGain ? "+" : ""}
            {summary.totalGainLossPercent.toFixed(2)}%
          </p>
          <p className='text-xs mt-1 text-muted-foreground'>Overall</p>
        </div>
      </div>

      {/* Holdings Count */}
      <div className='mt-6 pt-4 border-t border-border'>
        <div className='flex justify-between items-center text-sm'>
          <span className='text-muted-foreground'>Total Holdings</span>
          <span className='font-semibold text-foreground'>
            {summary.holdings.length} stock
            {summary.holdings.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
