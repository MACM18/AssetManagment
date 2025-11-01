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
    <div className='rounded-xl p-6 border'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold'>Watchlist</h2>
        <div className='flex items-center gap-2'>
          <span className='text-sm'>{filteredStocks.length} stocks</span>
          {isMockData && (
            <div className='text-xs px-2 py-1 rounded-full font-medium border'>
              Demo
            </div>
          )}
        </div>
      </div>

      <div className='relative mb-4'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5' />
        <input
          type='text'
          placeholder='Search stocks...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full pl-10 pr-10 py-3 border rounded-lg transition-all'
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        )}
      </div>

      <div className='space-y-2 max-h-[600px] overflow-y-auto pr-2'>
        {filteredStocks.length === 0 ? (
          <div className='text-center py-12'>
            <AlertCircle className='w-12 h-12 mx-auto mb-3' />
            <p>No stocks in watchlist</p>
            <p className='text-sm mt-1'>Click the star icon to add stocks</p>
          </div>
        ) : (
          filteredStocks.map((stock) => {
            const isPositive = (stock.changePercent || 0) >= 0;
            const isSelected = stock.symbol === selectedSymbol;

            return (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer animate-slide-up ${
                  isSelected ? "" : "hover:opacity-90"
                }`}
              >
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2 mb-1'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(stock.symbol);
                        }}
                        className='transition-colors'
                      >
                        <Star className='w-4 h-4' />
                      </button>
                      <h3 className='font-bold'>{stock.symbol}</h3>
                      {isSelected && (
                        <span className='text-xs px-2 py-0.5 rounded-full font-medium border'>
                          Active
                        </span>
                      )}
                    </div>
                    <p className='text-xs truncate'>{stock.companyName}</p>
                  </div>

                  <div className='text-right'>
                    <p className='text-lg font-bold'>
                      Rs.{" "}
                      {typeof stock.price === "number"
                        ? stock.price.toFixed(2)
                        : "N/A"}
                    </p>
                    <div
                      className={`flex items-center justify-end text-sm font-semibold mt-1`}
                    >
                      {isPositive ? (
                        <TrendingUp className='w-4 h-4 mr-1' />
                      ) : (
                        <TrendingDown className='w-4 h-4 mr-1' />
                      )}
                      <span>
                        {isPositive ? "+" : ""}
                        {stock.changePercent?.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className='mt-3 pt-3 border-t grid grid-cols-4 gap-2 text-xs'>
                  <div>
                    <p className='mb-1'>Open</p>
                    <p className='font-semibold'>
                      {stock.open?.toFixed(2) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className='mb-1'>High</p>
                    <p className='font-semibold'>
                      {stock.high?.toFixed(2) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className='mb-1'>Low</p>
                    <p className='font-semibold'>
                      {stock.low?.toFixed(2) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className='mb-1'>Volume</p>
                    <p className='font-semibold'>
                      {((stock.volume || 0) / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className='mt-4 pt-4 border-t'>
        <p className='text-sm font-medium mb-3 flex items-center'>
          <Star className='w-4 h-4 mr-1' />
          Add more stocks:
        </p>
        <div className='flex flex-wrap gap-2'>
          {CSE_SYMBOLS.filter((symbol) => !watchlist.includes(symbol))
            .slice(0, 6)
            .map((symbol) => (
              <button
                key={symbol}
                onClick={() => toggleWatchlist(symbol)}
                className='px-3 py-1.5 border rounded-full text-sm font-medium transition-all'
              >
                + {symbol}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
