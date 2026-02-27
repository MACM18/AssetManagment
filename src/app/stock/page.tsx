"use client";

export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { StockQuote } from "@/types";
import Navigation from "@/components/Navigation";
import StockDetailView from "@/components/StockDetailView";
import TransactionHistory from "@/components/portfolio/TransactionHistory";
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
      <div className="w-full">
        {/* Header Section */}
        <div className="border-b border-border bg-card/50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Link href="/" className="flex items-center gap-2 text-primary hover:underline mb-6 text-sm">
              <ChevronLeft className="w-4 h-4" />
              Back to Market
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">{symbol}</h1>
                {stock && stock.companyName && (
                  <p className="text-lg text-muted-foreground mt-2">{stock.companyName}</p>
                )}
              </div>

              {stock && (
                <div className="md:col-span-2 flex items-end justify-between">
                  <div>
                    <div className="text-5xl font-bold">LKR {stock.price.toFixed(2)}</div>
                    <div className={`text-xl mt-2 ${(stock.changePercent ?? 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {(stock.change ?? 0) >= 0 ? '+' : ''}{(stock.change ?? 0).toFixed(2)} ({(stock.changePercent ?? 0).toFixed(2)}%)
                    </div>
                  </div>
                  {enrichedHoldings.length > 0 && (
                    <div className="text-right pb-2">
                      <div className="text-sm text-muted-foreground">Portfolio Value</div>
                      <div className="text-2xl font-semibold text-success">
                        LKR {enrichedHoldings.reduce((sum, h) => sum + h.currentValue, 0).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {stock && (
            <div className="space-y-8">
              {/* Chart */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Price Chart</h2>
                <div className="bg-card rounded-lg border border-border p-6">
                  <StockDetailView stock={stock} holdings={enrichedHoldings} />
                </div>
              </section>

              {/* Holdings and Transactions Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Holdings Section */}
                {enrichedHoldings.length > 0 && (
                  <section className="lg:col-span-1">
                    <h2 className="text-2xl font-bold mb-4">Your Holdings</h2>
                    <div className="bg-card rounded-lg border border-border p-6 space-y-4">
                      {enrichedHoldings.map((h) => (
                        <div key={h.id} className="pb-4 border-b last:border-b-0 last:pb-0">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Quantity</span>
                            <span className="font-semibold">{h.quantity.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Avg. Cost</span>
                            <span className="font-semibold">LKR {h.purchasePrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Cost Basis</span>
                            <span className="font-semibold">LKR {h.formattedInvested}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Current Value</span>
                            <span className="font-semibold text-success">LKR {h.formattedCurrentValue}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span className="text-sm text-muted-foreground">Gain/Loss</span>
                            <span className={`font-bold ${h.isPositive ? 'text-success' : 'text-destructive'}`}>
                              {h.isPositive ? '+' : ''}LKR {h.formattedGainLoss} ({h.gainLossPercent.toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Transactions Section */}
                <section className={enrichedHoldings.length > 0 ? 'lg:col-span-2' : ''}>
                  <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
                  <div className="bg-card rounded-lg border border-border p-6">
                    <TransactionHistory symbolFilter={stock.symbol} />
                  </div>
                </section>
              </div>
            </div>
          )}
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
