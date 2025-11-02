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
  Edit3,
} from "lucide-react";
import {
  StockQuote,
  PortfolioHoldingWithMetrics,
  PortfolioHolding,
} from "@/types";
import StockDetailModal from "./StockDetailModal";
import AddHoldingModal from "./AddHoldingModal";

interface HoldingsListProps {
  currentPrices: StockQuote[];
  stocks: StockQuote[];
}

export default function HoldingsList({
  currentPrices,
  stocks,
}: HoldingsListProps) {
  const { summary, refreshPortfolio, loading } = usePortfolio();
  const { user, isAuthenticated } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedHolding, setSelectedHolding] =
    useState<PortfolioHoldingWithMetrics | null>(null);
  const [editingHolding, setEditingHolding] = useState<PortfolioHolding | null>(
    null
  );

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className='rounded-lg shadow-lg p-6 border'>
        <h2 className='text-xl font-bold mb-4'>My Holdings</h2>
        <div className='animate-pulse space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-24 rounded border'></div>
          ))}
        </div>
      </div>
    );
  }

  if (!summary || summary.holdings.length === 0) {
    return (
      <div className='rounded-lg shadow-lg p-6 border'>
        <h2 className='text-xl font-bold mb-4'>My Holdings</h2>
        <div className='text-center py-8'>
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
    <div className='rounded-lg shadow-lg border'>
      <div className='p-6 border-b'>
        <h2 className='text-xl font-bold'>My Holdings</h2>
      </div>

      <div className='divide-y'>
        {aggregatedHoldings.map((holding) => {
          const isGain = holding.gainLoss >= 0;
          // Find the original holding ID for delete action
          const originalHolding = summary.holdings.find(
            (h) => h.symbol === holding.symbol
          );

          return (
            <div key={holding.id} className='p-6 transition-colors'>
              <div className='flex justify-between items-start mb-3'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <h3 className='text-lg font-bold'>{holding.symbol}</h3>
                    <span className='px-2 py-1 rounded text-xs font-medium border'>
                      {isGain ? "+" : ""}
                      {holding.gainLossPercent.toFixed(2)}%
                    </span>
                  </div>
                  <p className='text-sm mt-1'>{holding.companyName}</p>
                </div>

                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => setSelectedHolding(holding)}
                    className='p-2 underline'
                    title='View details'
                  >
                    <Eye className='w-5 h-5' />
                  </button>

                  {originalHolding && (
                    <>
                      <button
                        onClick={() => setEditingHolding(originalHolding)}
                        className='p-2 underline'
                        title='Edit holding'
                      >
                        <Edit3 className='w-5 h-5' />
                      </button>

                      <button
                        onClick={() => handleDelete(originalHolding.id)}
                        disabled={deletingId === originalHolding.id}
                        className='disabled:opacity-50 disabled:cursor-not-allowed p-2 underline'
                        title='Delete holding'
                      >
                        <Trash2 className='w-5 h-5' />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-3'>
                {/* Quantity */}
                <div>
                  <div className='flex items-center gap-1 text-xs mb-1'>
                    <Hash className='w-3 h-3' />
                    <span>Shares</span>
                  </div>
                  <p className='text-sm font-semibold'>
                    {holding.quantity.toLocaleString()}
                  </p>
                </div>

                {/* Purchase Price */}
                <div>
                  <div className='flex items-center gap-1 text-xs mb-1'>
                    <Calendar className='w-3 h-3' />
                    <span>Avg. Buy</span>
                  </div>
                  <p className='text-sm font-semibold'>
                    LKR {holding.purchasePrice.toFixed(2)}
                  </p>
                </div>

                {/* Current Price */}
                <div>
                  <div className='flex items-center gap-1 text-xs mb-1'>
                    <TrendingUp className='w-3 h-3' />
                    <span>Current</span>
                  </div>
                  <p className='text-sm font-semibold'>
                    LKR {holding.currentPrice.toFixed(2)}
                  </p>
                </div>

                {/* Gain/Loss */}
                <div>
                  <div className='flex items-center gap-1 text-xs mb-1'>
                    {isGain ? (
                      <TrendingUp className='w-3 h-3' />
                    ) : (
                      <TrendingDown className='w-3 h-3' />
                    )}
                    <span>Gain/Loss</span>
                  </div>
                  <p className='text-sm font-semibold'>
                    {isGain ? "+" : ""}
                    {holding.gainLoss.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              {/* Investment Summary */}
              <div className='flex justify-between items-center pt-3 border-t'>
                <div>
                  <p className='text-xs'>Invested</p>
                  <p className='text-sm font-semibold'>
                    LKR{" "}
                    {holding.invested.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-xs'>Current Value</p>
                  <p className='text-sm font-semibold'>
                    LKR{" "}
                    {holding.currentValue.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              {holding.notes && (
                <div className='mt-3 pt-3 border-t'>
                  <p className='text-xs mb-1'>Notes</p>
                  <p className='text-sm'>{holding.notes}</p>
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

      {/* Edit Holding Modal */}
      {editingHolding && (
        <AddHoldingModal
          stocks={stocks}
          holding={editingHolding}
          onClose={() => setEditingHolding(null)}
          onSuccess={() => {
            setEditingHolding(null);
            refreshPortfolio(currentPrices);
          }}
        />
      )}
    </div>
  );
}
