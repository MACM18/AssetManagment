"use client";

import { useState, useEffect } from "react";
import { StockQuote, ChartDataPoint, MarketSummary } from "@/types";
import MarketOverview from "@/components/MarketOverview";
import StockChart from "@/components/StockChart";
import WatchList from "@/components/WatchList";
import MarketDepth from "@/components/MarketDepth";
import {
  fetchLatestStockPrices,
  fetchStockHistory,
  calculateMarketSummary,
  generateMockChartData,
  getLastDataSource,
} from "@/lib/tradingData";
import { FIREBASE_AVAILABLE } from "@/lib/firebase";
import { TrendingUp, RefreshCw } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signInAnonymously } from "firebase/auth";

export default function Home() {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
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
        if (!selectedSymbol && stockData.length > 0) {
          setSelectedSymbol(stockData[0].symbol);
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

  const loadStockChart = async (symbol: string) => {
    try {
      const history = await fetchStockHistory(symbol, 90);

      if (history.length > 0) {
        setChartData(history);
      } else {
        // Fallback to mock data if no historical data
        const selectedStock = stocks.find((s) => s.symbol === symbol);
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
      if (FIREBASE_AVAILABLE) {
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
    if (selectedSymbol) {
      loadStockChart(selectedSymbol);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSymbol]);

  const handleRefresh = () => {
    setLoading(true);
    loadMarketData();
  };

  if (loading && stocks.length === 0) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4'></div>
          <p className='text-xl text-gray-700'>Loading Market Data...</p>
        </div>
      </div>
    );
  }

  const selectedStock = stocks.find((s) => s.symbol === selectedSymbol);

  return (
    <main className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      <div className='max-w-[1920px] mx-auto p-6'>
        {/* Header */}
        <div className='flex justify-between items-center mb-6'>
          <div className='flex items-center space-x-4'>
            <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-3'>
              <TrendingUp className='w-8 h-8 text-white' />
            </div>
            <div>
              <h1 className='text-4xl font-bold text-gray-900'>
                CSE Trading Platform
              </h1>
              <p className='text-gray-600 mt-1'>
                Colombo Stock Exchange - Real-time Market Data
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-4'>
            <div className='text-right'>
              <p className='text-sm text-gray-600'>Last Updated</p>
              <p className='text-sm font-semibold text-gray-900'>
                {lastUpdate.toLocaleTimeString()}
              </p>
            </div>

            {/* Data source badge */}
            <div className='flex items-center space-x-2'>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  FIREBASE_AVAILABLE
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {FIREBASE_AVAILABLE ? "Firestore" : "No Firestore"}
              </span>
              <span className='text-sm text-gray-500'>
                Source: {getLastDataSource()}
              </span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className='flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors shadow-lg'
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Market Overview */}
        <div className='mb-6'>
          <MarketOverview stocks={stocks} marketSummary={marketSummary} />
        </div>

        {/* Main Trading Interface */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Watchlist */}
          <div className='lg:col-span-1'>
            <WatchList
              stocks={stocks}
              onSelectStock={setSelectedSymbol}
              selectedSymbol={selectedSymbol}
            />
          </div>

          {/* Center Column - Chart */}
          <div className='lg:col-span-2 space-y-6'>
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
        <div className='mt-8 text-center text-sm text-gray-600'>
          <p>Data provided by Colombo Stock Exchange (CSE)</p>
          <p className='mt-1'>
            Market data may be delayed. For informational purposes only.
          </p>
        </div>
      </div>
    </main>
  );
}
