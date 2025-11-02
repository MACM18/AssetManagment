"use client";

import { useState, useEffect } from "react";
import {
  StockQuote,
  ChartDataPoint,
  MarketSummary,
  SelectedStockKey,
} from "@/types";
import MarketOverview from "@/components/MarketOverview";
import StockChart from "@/components/StockChart";
import WatchList from "@/components/WatchList";
import MarketDepth from "@/components/MarketDepth";
import Navigation from "@/components/Navigation";
import {
  fetchLatestStockPrices,
  fetchStockHistory,
  calculateMarketSummary,
  generateMockChartData,
  getLastDataSource,
} from "@/lib/tradingData";
import { FIREBASE_AVAILABLE } from "@/lib/firebase";
import { RefreshCw } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signInAnonymously } from "firebase/auth";

export default function Home() {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [selected, setSelected] = useState<SelectedStockKey | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [marketSummary, setMarketSummary] = useState<MarketSummary>({
    totalVolume: 0,
    totalTrades: 0,
    advancers: 0,
    decliners: 0,
    unchanged: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadMarketData = async () => {
    try {
      const stockData = await fetchLatestStockPrices();

      if (stockData.length > 0) {
        setStocks(stockData);
        const summary = calculateMarketSummary(stockData);
        setMarketSummary(summary);
        setLastUpdate(new Date());

        // Set default selected symbol if not set
        if (!selected && stockData.length > 0) {
          setSelected({
            symbol: stockData[0].symbol,
            shareType: stockData[0].shareType ?? "N",
          });
        }
      } else {
        console.warn("No stock data available");
      }
    } catch (error) {
      console.error("Error loading market data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStockChart = async (
    symbol: string,
    shareType?: "N" | "X" | "P" | "Z" | "V"
  ) => {
    try {
      const history = await fetchStockHistory(symbol, 90, shareType);

      if (history.length > 0) {
        setChartData(history);
      } else {
        // Fallback to mock data if no historical data
        const stKey = (shareType ?? "N").toUpperCase();
        const selectedStock = stocks.find(
          (s) => s.symbol === symbol && (s.shareType ?? "N") === stKey
        );
        if (selectedStock) {
          const mockData = generateMockChartData(selectedStock.price, 90);
          setChartData(mockData);
        }
      }
    } catch (error) {
      console.error(`Error loading chart data for ${symbol}:`, error);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      // Attempt anonymous auth so Firestore rules that require auth can pass
      // Only sign in anonymously if not already authenticated
      if (FIREBASE_AVAILABLE && !auth.currentUser) {
        try {
          const cred = await signInAnonymously(auth);
          console.debug("Anonymous sign-in success:", cred.user?.uid);
        } catch (e) {
          console.warn("Anonymous sign-in failed:", e);
        }
      }

      if (!cancelled) {
        await loadMarketData();
        // Refresh data every 5 minutes
        const interval = setInterval(() => {
          loadMarketData();
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
      }
      return () => {};
    };

    let intervalCleanup: (() => void) | undefined;
    init().then((ret) => {
      // If the async init returned a cleanup, capture it
      if (typeof ret === "function") intervalCleanup = ret;
    });

    return () => {
      cancelled = true;
      if (intervalCleanup) intervalCleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selected?.symbol) {
      loadStockChart(selected.symbol, selected.shareType ?? "N");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.symbol, selected?.shareType]);

  const handleRefresh = () => {
    setLoading(true);
    loadMarketData();
  };

  if (loading && stocks.length === 0) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4'></div>
          <p className='text-xl font-semibold text-foreground'>
            Loading Market Data...
          </p>
        </div>
      </div>
    );
  }

  const selectedStock = selected
    ? stocks.find(
        (s) =>
          s.symbol === selected.symbol &&
          (s.shareType ?? "N") === (selected.shareType ?? "N")
      )
    : undefined;

  return (
    <main className='min-h-screen bg-background'>
      <Navigation />

      <div className='max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        {/* Header */}
        <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-foreground'>
              Market Overview
            </h1>
            <p className='text-sm sm:text-base text-muted-foreground mt-1'>
              Colombo Stock Exchange - Real-time Market Data
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2 sm:gap-4'>
            <div className='text-left sm:text-right'>
              <p className='text-xs sm:text-sm text-muted-foreground'>
                Last Updated
              </p>
              <p className='text-sm font-semibold text-foreground'>
                {lastUpdate.toLocaleTimeString()}
              </p>
            </div>

            {/* Data source badge */}
            <div className='flex flex-wrap items-center gap-2'>
              <span className='px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs sm:text-sm font-medium'>
                {FIREBASE_AVAILABLE ? "Firestore" : "No Firestore"}
              </span>
              <span className='text-xs sm:text-sm text-muted-foreground'>
                Source: {getLastDataSource()}
              </span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className='flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md'
            >
              <RefreshCw
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  loading ? "animate-spin" : ""
                }`}
              />
              <span className='hidden sm:inline'>Refresh</span>
            </button>
          </div>
        </div>

        {/* Market Overview */}
        <div className='mb-6'>
          <MarketOverview stocks={stocks} marketSummary={marketSummary} />
        </div>

        {/* Main Trading Interface */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6'>
          {/* Left Column - Watchlist */}
          <div className='lg:col-span-1'>
            <WatchList
              stocks={stocks}
              onSelectStock={(symbol, shareType) =>
                setSelected({ symbol, shareType: shareType ?? "N" })
              }
              selected={selected ?? undefined}
            />
          </div>

          {/* Center Column - Chart */}
          <div className='lg:col-span-2 space-y-4 lg:space-y-6'>
            {selectedStock && (
              <>
                <StockChart
                  data={chartData}
                  symbol={selectedStock.symbol}
                  currentPrice={selectedStock.price}
                  change={selectedStock.change || 0}
                  changePercent={selectedStock.changePercent || 0}
                />
                <MarketDepth stock={selectedStock} />
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className='mt-8 text-center text-xs sm:text-sm text-muted-foreground border-t border-border pt-6'>
          <p className='font-semibold text-foreground'>stock.macm.dev</p>
          <p className='mt-2'>Data provided by Colombo Stock Exchange (CSE)</p>
          <p className='mt-1'>
            Market data may be delayed. This platform is for informational
            purposes only.
          </p>
          <p className='mt-1 text-xs'>
            Not financial advice. Please consult with a licensed financial
            advisor before making investment decisions.
          </p>
        </div>
      </div>
    </main>
  );
}
