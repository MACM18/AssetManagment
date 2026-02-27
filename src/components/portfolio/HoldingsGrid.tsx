"use client";

import { aggregateHoldingsBySymbol, deleteHolding } from "@/lib/portfolio";
import { PortfolioHoldingWithMetrics, StockQuote, PortfolioHolding } from "@/types";
import { useRouter } from "next/navigation";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, Eye, Edit3 } from "lucide-react";
import { useState } from "react";

interface HoldingsGridProps {
  holdings: PortfolioHoldingWithMetrics[];
  currentPrices: StockQuote[];
}

export default function HoldingsGrid({ holdings, currentPrices }: HoldingsGridProps) {
  const router = useRouter();
  const { refreshPortfolio, summary } = usePortfolio();
  const { user, isAuthenticated } = useAuth();
  const [deleting, setDeleting] = useState<string | null>(null);

  if (!holdings || holdings.length === 0) {
    return null;
  }

  const aggregated = aggregateHoldingsBySymbol(holdings);

  const handleDelete = async (symbol: string) => {
    if (!user || !summary) return;
    if (!confirm(`Delete all holdings for ${symbol}?`)) return;
    setDeleting(symbol);
    try {
      // delete every holding matching symbol
      const toDelete = summary.holdings.filter((h) => h.symbol === symbol);
      for (const h of toDelete) {
        await deleteHolding(user.uid, h.id);
      }
      await refreshPortfolio(currentPrices);
    } catch (e) {
      console.error("delete error", e);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {aggregated.map((h) => {
        const priceObj = currentPrices.find((s) => s.symbol === h.symbol);
        const currentPrice = priceObj ? priceObj.price : h.currentPrice || 0;
        const isGain = h.gainLoss >= 0;

        return (
          <div
            key={h.symbol}
            className="p-4 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow h-full flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  <button
                    onClick={() => router.push(`/stock?symbol=${h.symbol}`)}
                    className="hover:underline"
                  >
                    {h.symbol}
                  </button>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {h.companyName}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => router.push(`/stock?symbol=${h.symbol}`)}
                  className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                  title="View"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    /* open add holding modal? skipping for now */
                  }}
                  className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(h.symbol)}
                  disabled={deleting === h.symbol}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 text-sm space-y-1">
              <p>Qty: {h.quantity.toLocaleString()}</p>
              <p>Avg. Buy: LKR {h.purchasePrice.toFixed(2)}</p>
              <p className="flex items-center gap-1">
                Current: LKR {currentPrice.toFixed(2)}
                <span className={isGain ? "text-success" : "text-destructive"}>
                  ({isGain ? "+" : ""}{h.gainLossPercent.toFixed(2)}%)
                </span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
