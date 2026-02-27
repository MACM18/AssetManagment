"use client";

import { StockQuote, ChartDataPoint, PortfolioHoldingWithMetrics } from "@/types";
import StockChart from "@/components/StockChart";
import TransactionHistory from "@/components/portfolio/TransactionHistory";
import { generateMockChartData, fetchStockHistory } from "@/lib/tradingData";
import { useEffect, useState } from "react";

interface StockDetailViewProps {
  stock: StockQuote;
  holdings?: PortfolioHoldingWithMetrics[];
}

export default function StockDetailView({ stock, holdings }: StockDetailViewProps) {
  const [history, setHistory] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const hist = await fetchStockHistory(stock.symbol, 90, stock.shareType);
        if (!cancelled) {
          if (hist.length > 0) setHistory(hist);
          else setHistory(generateMockChartData(stock.price, 90));
        }
      } catch {
        if (!cancelled) setHistory(generateMockChartData(stock.price, 90));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stock]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{stock.symbol} {stock.companyName ? `- ${stock.companyName}` : ''}</h2>
        <div className="mt-2 flex items-center gap-4">
          <div className="text-xl font-semibold">LKR {stock.price.toFixed(2)}</div>
          <div className={(stock.changePercent ?? 0) >= 0 ? 'text-success' : 'text-destructive'}>
            {(stock.change ?? 0) >= 0 ? '+' : ''}{(stock.change ?? 0).toFixed(2)} ({(stock.changePercent ?? 0).toFixed(2)}%)
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div>
          <StockChart
            data={history}
            symbol={stock.symbol}
            currentPrice={stock.price}
            change={stock.change ?? 0}
            changePercent={stock.changePercent ?? 0}
          />
        </div>
      )}

      {holdings && holdings.length > 0 && (
        <section>
          <h3 className="text-lg font-bold">Your Holdings</h3>
          <div className="mt-3 space-y-3">
            {holdings.map((h) => (
              <div key={h.id} className="p-3 border rounded bg-card">
                <div>Qty: {h.quantity.toLocaleString()}</div>
                <div>Avg. Buy: LKR {h.purchasePrice.toFixed(2)}</div>
                <div>Invested: LKR {(h.quantity * h.purchasePrice).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <TransactionHistory symbolFilter={stock.symbol} />
      </section>
    </div>
  );
}
