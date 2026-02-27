"use client";

import { StockQuote, ChartDataPoint, PortfolioHoldingWithMetrics } from "@/types";
import StockChart from "@/components/StockChart";
import { generateMockChartData, fetchStockHistory } from "@/lib/tradingData";
import { useEffect, useState } from "react";

interface StockDetailViewProps {
  stock: StockQuote;
  holdings?: PortfolioHoldingWithMetrics[];
}

export default function StockDetailView({ stock, holdings }: StockDetailViewProps) {
  const [history, setHistory] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stock]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading chart data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {history.length > 0 && (
        <StockChart
          data={history}
          symbol={stock.symbol}
          currentPrice={stock.price}
          change={stock.change ?? 0}
          changePercent={stock.changePercent ?? 0}
        />
      )}
    </div>
  );
}
