"use client";

export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { StockQuote } from "@/types";
import Navigation from "@/components/Navigation";
import StockDetailView from "@/components/StockDetailView";
import { fetchLatestStockPrices } from "@/lib/tradingData";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

function StockPageContent() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const symbol = (searchParams.get("symbol") || "").toUpperCase();
  const [stock, setStock] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const { holdings } = usePortfolio();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!symbol) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const all = await fetchLatestStockPrices();
        const found = all.find((s) => s.symbol === symbol);
        setStock(found || null);
      } catch (e) {
        console.error("Failed to load stock", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [symbol]);

  if (!mounted) {
    return null;
  }

  const symbolHoldings = holdings.filter((h) => h.symbol === symbol);

  const enrichedHoldings = stock
    ? symbolHoldings.map((h) => {
        const currentPrice = stock.price;
        const currentValue = h.quantity * currentPrice;
        const invested = h.purchasePrice * h.quantity;
        const gainLoss = currentValue - invested;
        const gainLossPercent = (gainLoss / invested) * 100;
        const isPositive = gainLoss >= 0;
        
        return {
          ...h,
          currentPrice,
          currentValue,
          gainLoss,
          gainLossPercent,
          dayChangePercent: stock.changePercent,
          dayChange: stock.change,
          invested,
          isPositive,
          formattedGainLoss: gainLoss.toFixed(2),
          formattedCurrentValue: currentValue.toFixed(2),
          formattedInvested: invested.toFixed(2),
        };
      })
    : [];

  if (!symbol) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">No stock selected</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading stock data...</p>
        </div>
      </main>
    );
  }

  if (!stock) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link href="/" className="flex items-center gap-2 text-primary hover:underline mb-6">
            <ChevronLeft className="w-4 h-4" />
            Back to Market
          </Link>
          <p className="text-center text-muted-foreground">Stock {symbol} not found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link href="/" className="flex items-center gap-2 text-primary hover:underline mb-6">
          <ChevronLeft className="w-4 h-4" />
          Back to Market
        </Link>

        <div className="bg-card rounded-xl border border-border p-8">
          <StockDetailView stock={stock} holdings={enrichedHoldings} />
        </div>
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading stock data...</p>
      </div>
    </main>
  );
}

export default function StockPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <StockPageContent />
    </Suspense>
  );
}
