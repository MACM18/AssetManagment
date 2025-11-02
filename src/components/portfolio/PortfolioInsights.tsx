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
    <div className='rounded-xl shadow-lg p-6 border border-border bg-card hover:shadow-xl transition-shadow'>
      <h3 className='text-lg font-bold mb-6 text-foreground'>
        Portfolio Insights
      </h3>

      <div className='space-y-4'>
        {/* Best Performer */}
        <div className='border border-success/30 bg-success/5 rounded-lg p-4 hover:bg-success/10 transition-colors'>
          <div className='flex items-start justify-between'>
            <div className='flex items-start gap-3'>
              <div className='p-2 rounded-full bg-success/20 border border-success/30'>
                <Award className='w-5 h-5 text-success' />
              </div>
              <div>
                <p className='text-sm font-medium text-muted-foreground uppercase tracking-wide'>
                  Best Performer
                </p>
                <p className='text-lg font-bold text-foreground'>
                  {bestPerformer.symbol}
                </p>
                <p className='text-xs mt-1 text-muted-foreground'>
                  {bestPerformer.companyName}
                </p>
              </div>
            </div>
            <div className='text-right'>
              <div className='flex items-center gap-1'>
                <TrendingUp className='w-4 h-4 text-success' />
                <span className='text-lg font-bold text-success'>
                  +{bestPerformer.gainLossPercent.toFixed(2)}%
                </span>
              </div>
              <p className='text-xs mt-1 text-muted-foreground'>
                +LKR {bestPerformer.gainLoss.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Worst Performer */}
        {worstPerformer.gainLossPercent < 0 && (
          <div className='border border-destructive/30 bg-destructive/5 rounded-lg p-4 hover:bg-destructive/10 transition-colors'>
            <div className='flex items-start justify-between'>
              <div className='flex items-start gap-3'>
                <div className='p-2 rounded-full bg-destructive/20 border border-destructive/30'>
                  <TrendingDown className='w-5 h-5 text-destructive' />
                </div>
                <div>
                  <p className='text-sm font-medium text-muted-foreground uppercase tracking-wide'>
                    Needs Attention
                  </p>
                  <p className='text-lg font-bold text-foreground'>
                    {worstPerformer.symbol}
                  </p>
                  <p className='text-xs mt-1 text-muted-foreground'>
                    {worstPerformer.companyName}
                  </p>
                </div>
              </div>
              <div className='text-right'>
                <div className='flex items-center gap-1'>
                  <TrendingDown className='w-4 h-4 text-destructive' />
                  <span className='text-lg font-bold text-destructive'>
                    {worstPerformer.gainLossPercent.toFixed(2)}%
                  </span>
                </div>
                <p className='text-xs mt-1 text-muted-foreground'>
                  LKR {worstPerformer.gainLoss.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Metrics */}
        <div className='grid grid-cols-2 gap-4'>
          <div
            className={`border rounded-lg p-4 shadow-sm ${
              avgGainLoss >= 0
                ? "border-success/30 bg-success/5 hover:bg-success/10"
                : "border-destructive/30 bg-destructive/5 hover:bg-destructive/10"
            } transition-colors`}
          >
            <div className='flex items-center gap-2 mb-2'>
              <Target
                className={`w-4 h-4 ${
                  avgGainLoss >= 0 ? "text-success" : "text-destructive"
                }`}
              />
              <p className='text-xs font-medium uppercase text-muted-foreground tracking-wide'>
                Avg Return
              </p>
            </div>
            <p
              className={`text-2xl font-bold ${
                avgGainLoss >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {avgGainLoss >= 0 ? "+" : ""}
              {avgGainLoss.toFixed(2)}%
            </p>
          </div>

          <div className='border border-border bg-secondary/20 rounded-lg p-4 shadow-sm hover:bg-secondary/30 transition-colors'>
            <div className='flex items-center gap-2 mb-2'>
              <Award className='w-4 h-4 text-primary' />
              <p className='text-xs font-medium uppercase text-muted-foreground tracking-wide'>
                Win Rate
              </p>
            </div>
            <p className='text-2xl font-bold text-foreground'>
              {profitablePercentage.toFixed(0)}%
            </p>
            <p className='text-xs mt-1 text-muted-foreground'>
              {profitableHoldings} of {summary.holdings.length} profitable
            </p>
          </div>
        </div>

        {/* Diversification Score */}
        <div className='border border-border bg-secondary/20 rounded-lg p-4 shadow-sm hover:bg-secondary/30 transition-colors'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-sm font-semibold text-foreground'>
              Diversification
            </p>
            <p className='text-sm font-bold text-primary'>
              {summary.holdings.length} stock
              {summary.holdings.length !== 1 ? "s" : ""}
            </p>
          </div>
          <p className='text-xs mt-2 text-muted-foreground'>
            {summary.holdings.length < 5
              ? "💡 Consider adding more stocks for better diversification"
              : summary.holdings.length < 10
              ? "✅ Good diversification - consider 10+ stocks for optimal spread"
              : "🎯 Well diversified portfolio"}
          </p>
        </div>
      </div>
    </div>
  );
}
