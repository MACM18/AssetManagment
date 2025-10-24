"use client";

import { StockQuote, MarketSummary } from "@/types";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { getLastDataSource } from "@/lib/tradingData";

interface MarketOverviewProps {
  stocks: StockQuote[];
  marketSummary: MarketSummary;
}

export default function MarketOverview({
  stocks,
  marketSummary,
}: MarketOverviewProps) {
  const dataSource = getLastDataSource();
  console.debug(
    "MarketOverview: dataSource=",
    dataSource,
    "stocks.length=",
    stocks.length
  );
  const isMockData = dataSource === "mock" || stocks.length === 0;

  // Get top gainers and losers
  const sortedByChange = [...stocks].sort(
    (a, b) => (b.changePercent || 0) - (a.changePercent || 0)
  );
  const topGainers = sortedByChange.slice(0, 5);
  const topLosers = sortedByChange.slice(-5).reverse();
  const mostActive = [...stocks]
    .sort((a, b) => (b.volume || 0) - (a.volume || 0))
    .slice(0, 5);

  return (
    <div className='space-y-6 animate-slide-up'>
      {/* Mock Data Warning Banner */}
      {isMockData && (
        <div className='bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-amber-500 rounded-lg p-4 shadow-md hover-lift'>
          <div className='flex items-start'>
            <AlertCircle className='w-6 h-6 text-amber-600 dark:text-amber-400 mr-3 flex-shrink-0 mt-0.5' />
            <div>
              <h3 className='text-amber-900 dark:text-amber-100 font-semibold text-sm'>
                Demo Mode - Sample Data
              </h3>
              <p className='text-amber-800 text-sm mt-1'>
                No live data available. Showing sample market data for
                demonstration. Connect to Firestore or run data collection to
                see real CSE data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Market Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-glow-blue hover-lift transform transition-all'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-blue-100 text-sm font-medium mb-1'>
                Total Volume
              </p>
              <p className='text-3xl font-bold'>
                {(marketSummary.totalVolume / 1000000).toFixed(2)}M
              </p>
              <div className='mt-2 text-xs text-blue-200'>
                {dataSource === "firestore" && "📊 Live Data"}
                {dataSource === "mock" && "🎭 Sample"}
              </div>
            </div>
            <Activity className='w-14 h-14 opacity-70' />
          </div>
        </div>

        <div className='bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-xl p-6 text-white shadow-glow-green hover-lift transform transition-all'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-green-100 text-sm font-medium mb-1'>
                Advancers
              </p>
              <p className='text-3xl font-bold'>{marketSummary.advancers}</p>
              <div className='mt-2 text-xs text-green-200'>
                {(
                  (marketSummary.advancers / (marketSummary.totalTrades || 1)) *
                  100
                ).toFixed(0)}
                % gaining
              </div>
            </div>
            <TrendingUp className='w-14 h-14 opacity-70' />
          </div>
        </div>

        <div className='bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-xl p-6 text-white shadow-glow-red hover-lift transform transition-all'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-red-100 text-sm font-medium mb-1'>Decliners</p>
              <p className='text-3xl font-bold'>{marketSummary.decliners}</p>
              <div className='mt-2 text-xs text-red-200'>
                {(
                  (marketSummary.decliners / (marketSummary.totalTrades || 1)) *
                  100
                ).toFixed(0)}
                % declining
              </div>
            </div>
            <TrendingDown className='w-14 h-14 opacity-70' />
          </div>
        </div>

        <div className='bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-lg hover-lift transform transition-all'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-purple-100 text-sm font-medium mb-1'>
                Total Trades
              </p>
              <p className='text-3xl font-bold'>{marketSummary.totalTrades}</p>
              <div className='mt-2 text-xs text-purple-200'>
                {marketSummary.unchanged} unchanged
              </div>
            </div>
            <DollarSign className='w-14 h-14 opacity-70' />
          </div>
        </div>
      </div>

      {/* Market Movers */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Top Gainers */}
        <div className='glass-card rounded-xl p-6 border-t-4 border-green-500 hover-lift'>
          <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center'>
            <div className='bg-green-100 p-2 rounded-lg mr-3'>
              <TrendingUp className='w-5 h-5 text-green-600' />
            </div>
            <span className='gradient-text'>Top Gainers</span>
          </h3>
          <div className='space-y-3'>
            {topGainers.length > 0 ? (
              topGainers.map((stock, idx) => (
                <div
                  key={stock.symbol}
                  className='flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-transparent rounded-lg hover:from-green-100 transition-colors animate-slide-up'
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div>
                    <p className='font-bold text-gray-900 dark:text-gray-100'>{stock.symbol}</p>
                    <p className='text-xs text-gray-500 truncate max-w-[150px]'>
                      {stock.companyName}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold text-gray-900 dark:text-gray-100'>
                      Rs.{" "}
                      {typeof stock.price === "number"
                        ? stock.price.toFixed(2)
                        : "N/A"}
                    </p>
                    <p className='text-sm font-bold text-green-600 flex items-center justify-end'>
                      <TrendingUp className='w-3 h-3 mr-1' />+
                      {stock.changePercent?.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-center text-gray-400 py-4'>
                No data available
              </p>
            )}
          </div>
        </div>

        {/* Top Losers */}
        <div className='glass-card rounded-xl p-6 border-t-4 border-red-500 hover-lift'>
          <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center'>
            <div className='bg-red-100 p-2 rounded-lg mr-3'>
              <TrendingDown className='w-5 h-5 text-red-600' />
            </div>
            <span className='gradient-text'>Top Losers</span>
          </h3>
          <div className='space-y-3'>
            {topLosers.length > 0 ? (
              topLosers.map((stock, idx) => (
                <div
                  key={stock.symbol}
                  className='flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-transparent rounded-lg hover:from-red-100 transition-colors animate-slide-up'
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div>
                    <p className='font-bold text-gray-900 dark:text-gray-100'>{stock.symbol}</p>
                    <p className='text-xs text-gray-500 truncate max-w-[150px]'>
                      {stock.companyName}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold text-gray-900 dark:text-gray-100'>
                      Rs.{" "}
                      {typeof stock.price === "number"
                        ? stock.price.toFixed(2)
                        : "N/A"}
                    </p>
                    <p className='text-sm font-bold text-red-600 flex items-center justify-end'>
                      <TrendingDown className='w-3 h-3 mr-1' />
                      {stock.changePercent?.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-center text-gray-400 py-4'>
                No data available
              </p>
            )}
          </div>
        </div>

        {/* Most Active */}
        <div className='glass-card rounded-xl p-6 border-t-4 border-blue-500 hover-lift'>
          <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center'>
            <div className='bg-blue-100 p-2 rounded-lg mr-3'>
              <Activity className='w-5 h-5 text-blue-600' />
            </div>
            <span className='gradient-text'>Most Active</span>
          </h3>
          <div className='space-y-3'>
            {mostActive.length > 0 ? (
              mostActive.map((stock, idx) => (
                <div
                  key={stock.symbol}
                  className='flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg hover:from-blue-100 transition-colors animate-slide-up'
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div>
                    <p className='font-bold text-gray-900 dark:text-gray-100'>{stock.symbol}</p>
                    <p className='text-xs text-gray-500 truncate max-w-[150px]'>
                      {stock.companyName}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold text-gray-900 dark:text-gray-100'>
                      Rs.{" "}
                      {typeof stock.price === "number"
                        ? stock.price.toFixed(2)
                        : "N/A"}
                    </p>
                    <div className='flex items-center justify-end gap-1'>
                      <Activity className='w-3 h-3 text-blue-600' />
                      <p className='text-xs font-semibold text-blue-600'>
                        {((stock.volume || 0) / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-center text-gray-400 py-4'>
                No data available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
