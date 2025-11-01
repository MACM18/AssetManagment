"use client";

import { useState } from "react";
import { StockQuote } from "@/types";
import {
  Star,
  TrendingUp,
  TrendingDown,
  Search,
  X,
  AlertCircle,
} from "lucide-react";
import { CSE_SYMBOLS } from "@/lib/stockData";
import { getLastDataSource } from "@/lib/tradingData";

interface WatchListProps {
  stocks: StockQuote[];
  onSelectStock: (symbol: string) => void;
  selectedSymbol?: string;
}

export default function WatchList({
  stocks,
  onSelectStock,
  selectedSymbol,
}: WatchListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [watchlist, setWatchlist] = useState<string[]>(CSE_SYMBOLS.slice(0, 8));

  const dataSource = getLastDataSource();
  console.debug(
    "WatchList: dataSource=",
    dataSource,
    "stocks.length=",
    stocks.length
  );
  const isMockData = dataSource === "mock" || stocks.length === 0;

  const toggleWatchlist = (symbol: string) => {
    setWatchlist((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  // Build displayed list from watchlist: prefer real stock entries from `stocks`, otherwise show placeholders
  const displayedStocks = watchlist.map((symbol) => {
    const found = stocks.find((s) => s.symbol === symbol);
    if (found) return found;
    return {
      symbol,
      companyName: symbol,
      date: "",
      price: null,
      change: null,
      changePercent: null,
      volume: 0,
      high: null,
      low: null,
      open: null,
      close: null,
    } as unknown as StockQuote;
  });

  const filteredStocks = displayedStocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stock.companyName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='bg-card rounded-xl p-4 sm:p-6 border border-border shadow-md'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-lg sm:text-xl font-bold text-foreground'>
          Watchlist
        </h2>
        <div className='flex items-center gap-2'>
          <span className='text-xs sm:text-sm text-muted-foreground'>
            {filteredStocks.length} stocks
          </span>
          {isMockData && (
            <div className='text-xs px-2 py-1 bg-warning/10 text-warning rounded-full font-medium border border-warning/20'>
              Demo
            </div>
          )}
        </div>
      </div>

      <div className='relative mb-4'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground' />
        <input
          type='text'
          placeholder='Search stocks...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full pl-9 sm:pl-10 pr-10 py-2 sm:py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm sm:text-base text-foreground placeholder:text-muted-foreground'
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
          >
            <X className='w-4 h-4 sm:w-5 sm:h-5' />
          </button>
        )}
      </div>

      <div className='space-y-2 max-h-[500px] sm:max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent'>
        {filteredStocks.length === 0 ? (
          <div className='text-center py-12'>
            <AlertCircle className='w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3' />
            <p className='text-foreground font-medium'>
              No stocks in watchlist
            </p>
            <p className='text-sm text-muted-foreground mt-1'>
              Click the star icon to add stocks
            </p>
          </div>
        ) : (
          filteredStocks.map((stock) => {
            const isPositive = (stock.changePercent || 0) >= 0;
            const isSelected = stock.symbol === selectedSymbol;

            return (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer animate-slide-up ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:bg-muted/50 hover:border-muted"
                }`}
              >
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(stock.symbol);
                        }}
                        className='text-primary hover:text-primary/80 transition-colors'
                        aria-label={`Remove ${stock.symbol} from watchlist`}
                      >
                        <Star className='w-4 h-4 fill-primary' />
                      </button>
                      <h3 className='font-bold text-foreground text-sm sm:text-base'>
                        {stock.symbol}
                      </h3>
                      {isSelected && (
                        <span className='text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full font-medium'>
                          Active
                        </span>
                      )}
                    </div>
                    <p className='text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]'>
                      {stock.companyName}
                    </p>
                  </div>

                  <div className='text-right'>
                    <p className='text-base sm:text-lg font-bold text-foreground'>
                      Rs.{" "}
                      {typeof stock.price === "number"
                        ? stock.price.toFixed(2)
                        : "N/A"}
                    </p>
                    <div
                      className={`flex items-center justify-end text-xs sm:text-sm font-semibold mt-1 ${
                        isPositive ? "text-success" : "text-destructive"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                      ) : (
                        <TrendingDown className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                      )}
                      <span>
                        {isPositive ? "+" : ""}
                        {stock.changePercent?.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className='mt-3 pt-3 border-t border-border grid grid-cols-4 gap-2 text-xs'>
                  <div>
                    <p className='text-muted-foreground mb-1'>Open</p>
                    <p className='font-semibold text-foreground'>
                      {stock.open?.toFixed(2) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className='text-muted-foreground mb-1'>High</p>
                    <p className='font-semibold text-success'>
                      {stock.high?.toFixed(2) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className='text-muted-foreground mb-1'>Low</p>
                    <p className='font-semibold text-destructive'>
                      {stock.low?.toFixed(2) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className='text-muted-foreground mb-1'>Volume</p>
                    <p className='font-semibold text-foreground'>
                      {((stock.volume || 0) / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className='mt-4 pt-4 border-t border-border'>
        <p className='text-xs sm:text-sm font-medium text-foreground mb-3 flex items-center'>
          <Star className='w-4 h-4 text-muted-foreground mr-1' />
          Add more stocks:
        </p>
        <div className='flex flex-wrap gap-2'>
          {CSE_SYMBOLS.filter((symbol) => !watchlist.includes(symbol))
            .slice(0, 6)
            .map((symbol) => (
              <button
                key={symbol}
                onClick={() => toggleWatchlist(symbol)}
                className='px-3 py-1.5 bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground border border-border rounded-full text-xs sm:text-sm font-medium transition-all hover:shadow-sm'
              >
                + {symbol}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
