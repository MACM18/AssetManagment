"use client";

import Link from "next/link";
import { aggregateHoldingsBySymbol } from "@/lib/portfolio";
import { PortfolioHoldingWithMetrics, StockQuote } from "@/types";

interface HoldingsGridProps {
  holdings: PortfolioHoldingWithMetrics[];
  currentPrices: StockQuote[];
}

export default function HoldingsGrid({ holdings, currentPrices }: HoldingsGridProps) {
  if (!holdings || holdings.length === 0) {
    return null;
  }

  const aggregated = aggregateHoldingsBySymbol(holdings);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {aggregated.map((h) => {
        const priceObj = currentPrices.find((s) => s.symbol === h.symbol);
        const currentPrice = priceObj ? priceObj.price : h.currentPrice || 0;

        return (
          <Link
            key={h.symbol}
            href={`/stocks/${h.symbol}`}
            className="block p-4 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow h-full flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-bold text-foreground">{h.symbol}</h3>
              <p className="text-sm text-muted-foreground">{h.companyName}</p>
            </div>
            <div className="mt-4 text-sm space-y-1">
              <p>Qty: {h.quantity.toLocaleString()}</p>
              <p>Avg. Buy: LKR {h.purchasePrice.toFixed(2)}</p>
              <p>Current: LKR {currentPrice.toFixed(2)}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
