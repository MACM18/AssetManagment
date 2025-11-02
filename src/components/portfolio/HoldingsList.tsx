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
      <div className='rounded-xl shadow-lg p-6 border border-border bg-card'>
        <h2 className='text-xl font-bold mb-4 text-foreground'>My Holdings</h2>
        <div className='animate-pulse space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-24 rounded-lg bg-muted/30'></div>
          ))}
        </div>
      </div>
    );
  }

  if (!summary || summary.holdings.length === 0) {
    return (
      <div className='rounded-xl shadow-lg p-6 border border-border bg-card'>
        <h2 className='text-xl font-bold mb-4 text-foreground'>My Holdings</h2>
        <div className='text-center py-12'>
          <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center'>
            <TrendingUp className='w-8 h-8 text-muted-foreground' />
          </div>
          <p className='text-muted-foreground font-medium'>
            No holdings to display
          </p>
          <p className='text-sm mt-2 text-muted-foreground'>
            Add your first stock to get started
          </p>
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
    <div className='rounded-xl shadow-lg border border-border bg-card hover:shadow-xl transition-shadow'>
      <div className='p-6 border-b border-border bg-secondary/20'>
        <h2 className='text-xl font-bold text-foreground'>My Holdings</h2>
        <p className='text-sm text-muted-foreground mt-1'>
          {aggregatedHoldings.length} unique stock
          {aggregatedHoldings.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className='divide-y divide-border'>
        {aggregatedHoldings.map((holding) => {
          const isGain = holding.gainLoss >= 0;
          // Find the original holding ID for delete action
          const originalHolding = summary.holdings.find(
            (h) => h.symbol === holding.symbol
          );

          return (
            <div
              key={holding.id}
              className='p-6 transition-colors hover:bg-secondary/10'
            >
              <div className='flex justify-between items-start mb-4'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    <h3 className='text-lg font-bold text-foreground'>
                      {holding.symbol}
                    </h3>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        isGain
                          ? "bg-success/10 text-success border-success/30"
                          : "bg-destructive/10 text-destructive border-destructive/30"
                      }`}
                    >
                      {isGain ? "+" : ""}
                      {holding.gainLossPercent.toFixed(2)}%
                    </span>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    {holding.companyName}
                  </p>
                </div>

                <div className='flex items-center gap-1'>
                  <button
                    onClick={() => setSelectedHolding(holding)}
                    className='p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors'
                    title='View details'
                  >
                    <Eye className='w-5 h-5' />
                  </button>

                  {originalHolding && (
                    <>
                      <button
                        onClick={() => setEditingHolding(originalHolding)}
                        className='p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors'
                        title='Edit holding'
                      >
                        <Edit3 className='w-5 h-5' />
                      </button>

                      <button
                        onClick={() => handleDelete(originalHolding.id)}
                        disabled={deletingId === originalHolding.id}
                        className='disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors'
                        title='Delete holding'
                      >
                        <Trash2 className='w-5 h-5' />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                {/* Quantity */}
                <div className='bg-secondary/20 rounded-lg p-3 border border-border'>
                  <div className='flex items-center gap-1 text-xs mb-1 text-muted-foreground'>
                    <Hash className='w-3 h-3' />
                    <span className='uppercase tracking-wide'>Shares</span>
                  </div>
                  <p className='text-sm font-bold text-foreground'>
                    {holding.quantity.toLocaleString()}
                  </p>
                </div>

                {/* Purchase Price */}
                <div className='bg-secondary/20 rounded-lg p-3 border border-border'>
                  <div className='flex items-center gap-1 text-xs mb-1 text-muted-foreground'>
                    <Calendar className='w-3 h-3' />
                    <span className='uppercase tracking-wide'>Avg. Buy</span>
                  </div>
                  <p className='text-sm font-bold text-foreground'>
                    LKR {holding.purchasePrice.toFixed(2)}
                  </p>
                </div>

                {/* Current Price */}
                <div className='bg-secondary/20 rounded-lg p-3 border border-border'>
                  <div className='flex items-center gap-1 text-xs mb-1 text-muted-foreground'>
                    <TrendingUp className='w-3 h-3' />
                    <span className='uppercase tracking-wide'>Current</span>
                  </div>
                  <p className='text-sm font-bold text-foreground'>
                    LKR {holding.currentPrice.toFixed(2)}
                  </p>
                </div>

                {/* Gain/Loss */}
                <div
                  className={`rounded-lg p-3 border ${
                    isGain
                      ? "bg-success/10 border-success/30"
                      : "bg-destructive/10 border-destructive/30"
                  }`}
                >
                  <div className='flex items-center gap-1 text-xs mb-1 text-muted-foreground'>
                    {isGain ? (
                      <TrendingUp className='w-3 h-3' />
                    ) : (
                      <TrendingDown className='w-3 h-3' />
                    )}
                    <span className='uppercase tracking-wide'>Gain/Loss</span>
                  </div>
                  <p
                    className={`text-sm font-bold ${
                      isGain ? "text-success" : "text-destructive"
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
              <div className='flex justify-between items-center pt-4 border-t border-border'>
                <div>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide mb-1'>
                    Invested
                  </p>
                  <p className='text-sm font-bold text-foreground'>
                    LKR{" "}
                    {holding.invested.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide mb-1'>
                    Current Value
                  </p>
                  <p className='text-sm font-bold text-primary'>
                    LKR{" "}
                    {holding.currentValue.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              {holding.notes && (
                <div className='mt-4 pt-4 border-t border-border bg-muted/10 rounded-lg p-3'>
                  <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1'>
                    Notes
                  </p>
                  <p className='text-sm text-foreground'>{holding.notes}</p>
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
