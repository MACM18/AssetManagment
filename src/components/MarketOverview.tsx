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
        <div className='rounded-lg p-4 shadow-md'>
          <div className='flex items-start gap-3'>
            <AlertCircle className='w-6 h-6 flex-shrink-0 mt-0.5' />
            <div>
              <h3 className='font-semibold text-sm'>Demo Mode - Sample Data</h3>
              <p className='text-sm mt-1'>
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
        <div className='rounded-xl p-6 shadow transform transition-all'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium mb-1'>Total Volume</p>
              <p className='text-3xl font-bold'>
                {(marketSummary.totalVolume / 1000000).toFixed(2)}M
              </p>
              <div className='mt-2 text-xs'>
                {dataSource === "firestore" && "📊 Live Data"}
                {dataSource === "mock" && "🎭 Sample"}
              </div>
            </div>
            <Activity className='w-14 h-14 opacity-70' />
          </div>
        </div>

        <div className='rounded-xl p-6 shadow transform transition-all'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium mb-1'>Advancers</p>
              <p className='text-3xl font-bold'>{marketSummary.advancers}</p>
              <div className='mt-2 text-xs'>
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

        <div className='rounded-xl p-6 shadow transform transition-all'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium mb-1'>Decliners</p>
              <p className='text-3xl font-bold'>{marketSummary.decliners}</p>
              <div className='mt-2 text-xs'>
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

        <div className='rounded-xl p-6 shadow transform transition-all'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium mb-1'>Total Trades</p>
              <p className='text-3xl font-bold'>{marketSummary.totalTrades}</p>
              <div className='mt-2 text-xs'>
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
        <div className='rounded-xl p-6 shadow'>
          <h3 className='text-lg font-bold mb-4 flex items-center gap-3'>
            <TrendingUp className='w-5 h-5' />
            <span>Top Gainers</span>
          </h3>
          <div className='space-y-3'>
            {topGainers.length > 0 ? (
              topGainers.map((stock, idx) => (
                <div
                  key={stock.symbol}
                  className='flex justify-between items-center p-3 rounded-lg animate-slide-up'
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div>
                    <p className='font-bold'>{stock.symbol}</p>
                    <p className='text-xs truncate max-w-[150px]'>
                      {stock.companyName}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold'>
                      Rs.{" "}
                      {typeof stock.price === "number"
                        ? stock.price.toFixed(2)
                        : "N/A"}
                    </p>
                    <p className='text-sm font-bold flex items-center justify-end'>
                      <TrendingUp className='w-3 h-3 mr-1' />+
                      {stock.changePercent?.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-center py-4'>No data available</p>
            )}
          </div>
        </div>

        {/* Top Losers */}
        <div className='rounded-xl p-6 shadow'>
          <h3 className='text-lg font-bold mb-4 flex items-center gap-3'>
            <TrendingDown className='w-5 h-5' />
            <span>Top Losers</span>
          </h3>
          <div className='space-y-3'>
            {topLosers.length > 0 ? (
              topLosers.map((stock, idx) => (
                <div
                  key={stock.symbol}
                  className='flex justify-between items-center p-3 rounded-lg animate-slide-up'
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div>
                    <p className='font-bold'>{stock.symbol}</p>
                    <p className='text-xs truncate max-w-[150px]'>
                      {stock.companyName}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold'>
                      Rs.{" "}
                      {typeof stock.price === "number"
                        ? stock.price.toFixed(2)
                        : "N/A"}
                    </p>
                    <p className='text-sm font-bold flex items-center justify-end'>
                      <TrendingDown className='w-3 h-3 mr-1' />
                      {stock.changePercent?.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-center py-4'>No data available</p>
            )}
          </div>
        </div>

        {/* Most Active */}
        <div className='rounded-xl p-6 shadow'>
          <h3 className='text-lg font-bold mb-4 flex items-center gap-3'>
            <Activity className='w-5 h-5' />
            <span>Most Active</span>
          </h3>
          <div className='space-y-3'>
            {mostActive.length > 0 ? (
              mostActive.map((stock, idx) => (
                <div
                  key={stock.symbol}
                  className='flex justify-between items-center p-3 rounded-lg animate-slide-up'
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div>
                    <p className='font-bold'>{stock.symbol}</p>
                    <p className='text-xs truncate max-w-[150px]'>
                      {stock.companyName}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold'>
                      Rs.{" "}
                      {typeof stock.price === "number"
                        ? stock.price.toFixed(2)
                        : "N/A"}
                    </p>
                    <div className='flex items-center justify-end gap-1'>
                      <Activity className='w-3 h-3' />
                      <p className='text-xs font-semibold'>
                        {((stock.volume || 0) / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-center py-4'>No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
