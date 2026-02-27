"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { StockQuote, ChartDataPoint } from "@/types";
import Navigation from "@/components/Navigation";
import StockChart from "@/components/StockChart";
import { fetchLatestStockPrices, fetchStockHistory, generateMockChartData } from "@/lib/tradingData";
import { usePortfolio } from "@/contexts/PortfolioContext";
import TransactionHistory from "@/components/portfolio/TransactionHistory";

export default function StockPage() {
  const params = useParams();
  const symbolParam = params?.symbol || "";
  // params could be string or string[] when using catch-all routes
  const rawSymbol = Array.isArray(symbolParam) ? symbolParam[0] : symbolParam;
  const symbol = rawSymbol.toUpperCase();

  const [stock, setStock] = useState<StockQuote | null>(null);
  const [history, setHistory] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const { holdings, transactions, loading: portfolioLoading } = usePortfolio();

  // filter portfolio data for this symbol
  const symbolHoldings = holdings.filter((h) => h.symbol === symbol);
  const symbolTransactions = transactions.filter((t) => t.symbol === symbol);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const all = await fetchLatestStockPrices();
        let found: StockQuote | undefined;

        if (!cancelled) {
          found = all.find((s) => s.symbol === symbol);
          if (found) {
            setStock(found);
          }
        }

        // history for 90 days by default; pass shareType from found if available
        const hist = await fetchStockHistory(symbol, 90, found?.shareType);
        if (!cancelled) {
          if (hist.length > 0) {
            setHistory(hist);
          } else if (found) {
            // fallback to mock data if firestore has none
            setHistory(generateMockChartData(found.price, 90));
          }
        }
      } catch (e) {
        console.error("Error loading stock page data", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading && !stock && (
          <p className="text-center text-muted-foreground">Loading...</p>
        )}

        {stock && (
          <>
            <h1 className="text-3xl font-bold text-foreground">
              {stock.symbol} {stock.companyName && `- ${stock.companyName}`}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <p className="text-xl font-semibold">
                LKR {stock.price.toFixed(2)}
              </p>
              <p
                className={`${
                  (stock.changePercent ?? 0) >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {(stock.change ?? 0) >= 0 ? "+" : ""}{(stock.change ?? 0).toFixed(2)} (
                {(stock.changePercent ?? 0).toFixed(2)}%)
              </p>
            </div>

            {/* chart */}
            {history.length > 0 && (
              <div className="mt-8">
                <StockChart
                  data={history}
                  symbol={symbol}
                  currentPrice={stock.price}
                  change={stock.change ?? 0}
                  changePercent={stock.changePercent ?? 0}
                />
              </div>
            )}

            {/* portfolio info */}
            {!portfolioLoading && (
              <div className="mt-12 space-y-8">
                {symbolHoldings.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold text-foreground">
                      Your Holdings
                    </h2>
                    <div className="mt-4">
                      {symbolHoldings.map((h) => (
                        <div key={h.id} className="mb-4 border border-border rounded-lg p-4 bg-card">
                          <p>
                            Quantity: {h.quantity.toLocaleString()} shares
                          </p>
                          <p>Avg. Buy: LKR {h.purchasePrice.toFixed(2)}</p>
                          <p>
                            Invested: LKR {(h.quantity * h.purchasePrice).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <TransactionHistory symbolFilter={symbol} />
                </section>
              </div>
            )}
          </>
        )}

        {!loading && !stock && (
          <p className="text-center text-muted-foreground">
            Stock {symbol} not found
          </p>
        )}
      </div>
    </main>
  );
}
