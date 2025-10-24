"use client";

import { useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useAuth } from "@/contexts/AuthContext";
import { deleteHolding } from "@/lib/portfolio";
import { aggregateHoldingsBySymbol } from "@/lib/portfolio";
import {
  TrendingUp,
  TrendingDown,
  Trash2,
  Calendar,
  Hash,
  Eye,
} from "lucide-react";
import { StockQuote, PortfolioHoldingWithMetrics } from "@/types";
import StockDetailModal from "./StockDetailModal";

interface HoldingsListProps {
  currentPrices: StockQuote[];
}

export default function HoldingsList({ currentPrices }: HoldingsListProps) {
  const { summary, refreshPortfolio, loading } = usePortfolio();
  const { user, isAuthenticated } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedHolding, setSelectedHolding] =
    useState<PortfolioHoldingWithMetrics | null>(null);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700'>
        <h2 className='text-xl font-bold text-gray-900 mb-4'>My Holdings</h2>
        <div className='animate-pulse space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-24 bg-gray-200 dark:bg-gray-700 rounded'></div>
          ))}
        </div>
      </div>
    );
  }

  if (!summary || summary.holdings.length === 0) {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700'>
        <h2 className='text-xl font-bold text-gray-900 mb-4'>My Holdings</h2>
        <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
          <p>No holdings to display</p>
          <p className='text-sm mt-1'>Add your first stock to get started</p>
        </div>
      </div>
    );
  }

  // Aggregate holdings by symbol for display
  const aggregatedHoldings = aggregateHoldingsBySymbol(summary.holdings);

  const handleDelete = async (holdingId: string) => {
    if (!user) return;

    if (
      !confirm(
        "Are you sure you want to delete this holding? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingId(holdingId);

    try {
      await deleteHolding(user.uid, holdingId);
      await refreshPortfolio(currentPrices);
    } catch (error) {
      console.error("Error deleting holding:", error);
      alert("Failed to delete holding. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700'>
      <div className='p-6 border-b border-gray-200'>
        <h2 className='text-xl font-bold text-gray-900 dark:text-gray-100'>My Holdings</h2>
      </div>

      <div className='divide-y divide-gray-200'>
        {aggregatedHoldings.map((holding) => {
          const isGain = holding.gainLoss >= 0;
          // Find the original holding ID for delete action
          const originalHolding = summary.holdings.find(
            (h) => h.symbol === holding.symbol
          );

          return (
            <div
              key={holding.id}
              className='p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
            >
              <div className='flex justify-between items-start mb-3'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <h3 className='text-lg font-bold text-gray-900 dark:text-gray-100'>
                      {holding.symbol}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        isGain
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {isGain ? "+" : ""}
                      {holding.gainLossPercent.toFixed(2)}%
                    </span>
                  </div>
                  <p className='text-sm text-gray-600 mt-1'>
                    {holding.companyName}
                  </p>
                </div>

                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => setSelectedHolding(holding)}
                    className='text-blue-600 hover:text-blue-800 p-2'
                    title='View details'
                  >
                    <Eye className='w-5 h-5' />
                  </button>

                  {originalHolding && (
                    <button
                      onClick={() => handleDelete(originalHolding.id)}
                      disabled={deletingId === originalHolding.id}
                      className='text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed p-2'
                      title='Delete holding'
                    >
                      <Trash2 className='w-5 h-5' />
                    </button>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-3'>
                {/* Quantity */}
                <div>
                  <div className='flex items-center gap-1 text-xs text-gray-500 mb-1'>
                    <Hash className='w-3 h-3' />
                    <span>Shares</span>
                  </div>
                  <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                    {holding.quantity.toLocaleString()}
                  </p>
                </div>

                {/* Purchase Price */}
                <div>
                  <div className='flex items-center gap-1 text-xs text-gray-500 mb-1'>
                    <Calendar className='w-3 h-3' />
                    <span>Avg. Buy</span>
                  </div>
                  <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                    LKR {holding.purchasePrice.toFixed(2)}
                  </p>
                </div>

                {/* Current Price */}
                <div>
                  <div className='flex items-center gap-1 text-xs text-gray-500 mb-1'>
                    <TrendingUp className='w-3 h-3' />
                    <span>Current</span>
                  </div>
                  <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                    LKR {holding.currentPrice.toFixed(2)}
                  </p>
                </div>

                {/* Gain/Loss */}
                <div>
                  <div className='flex items-center gap-1 text-xs text-gray-500 mb-1'>
                    {isGain ? (
                      <TrendingUp className='w-3 h-3' />
                    ) : (
                      <TrendingDown className='w-3 h-3' />
                    )}
                    <span>Gain/Loss</span>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      isGain ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isGain ? "+" : ""}
                    {holding.gainLoss.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              {/* Investment Summary */}
              <div className='flex justify-between items-center pt-3 border-t border-gray-100'>
                <div>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>Invested</p>
                  <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                    LKR{" "}
                    {holding.invested.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>Current Value</p>
                  <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                    LKR{" "}
                    {holding.currentValue.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              {holding.notes && (
                <div className='mt-3 pt-3 border-t border-gray-100'>
                  <p className='text-xs text-gray-500 mb-1'>Notes</p>
                  <p className='text-sm text-gray-700 dark:text-gray-300'>{holding.notes}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stock Detail Modal */}
      {selectedHolding && (
        <StockDetailModal
          holding={selectedHolding}
          stockQuote={currentPrices.find(
            (s) => s.symbol === selectedHolding.symbol
          )}
          onClose={() => setSelectedHolding(null)}
        />
      )}
    </div>
  );
}
