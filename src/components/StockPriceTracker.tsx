"use client";

import { useState, useEffect } from "react";
import { CSE_SYMBOLS } from "@/lib/stockData";

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function StockPriceTracker() {
  const [stockPrices, setStockPrices] = useState<StockPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState(CSE_SYMBOLS[0]);

  useEffect(() => {
    loadLatestPrices();
  }, []);

  const loadLatestPrices = async () => {
    try {
      // In production, this would fetch from your data collection
      // For now, we'll use mock data
      const mockPrices: StockPrice[] = CSE_SYMBOLS.map((symbol) => ({
        symbol,
        price: Math.random() * 100 + 50,
        change: (Math.random() - 0.5) * 5,
        changePercent: (Math.random() - 0.5) * 10,
      }));

      setStockPrices(mockPrices);
    } catch (error) {
      console.error("Error loading stock prices:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className='text-center py-4'>Loading stock prices...</div>;
  }

  const selectedStock = stockPrices.find((s) => s.symbol === selectedSymbol);

  return (
    <div className='space-y-6 p-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm'>
      <div>
        <label
          htmlFor='symbol'
          className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
        >
          Select Stock
        </label>
        <select
          id='symbol'
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className='mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border'
        >
          {CSE_SYMBOLS.map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
        </select>
      </div>

      {selectedStock && (
        <div className='border border-gray-200 dark:border-gray-700/50 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-900/30'>
          <div className='flex justify-between items-start mb-2'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                {selectedStock.symbol}
              </h3>
              <p className='text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2'>
                Rs. {selectedStock.price.toFixed(2)}
              </p>
            </div>
            <div
              className={`text-right ${
                selectedStock.change >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              <p className='text-lg font-semibold'>
                {selectedStock.change >= 0 ? "+" : ""}
                {selectedStock.change.toFixed(2)}
              </p>
              <p className='text-sm'>
                ({selectedStock.changePercent >= 0 ? "+" : ""}
                {selectedStock.changePercent.toFixed(2)}%)
              </p>
            </div>
          </div>
          <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      )}

      <div className='border-t border-gray-200 dark:border-gray-700/50 pt-4'>
        <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
          All Tracked Stocks
        </h4>
        <div className='space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2'>
          {stockPrices.map((stock) => (
            <div
              key={stock.symbol}
              className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-all ${
                selectedSymbol === stock.symbol
                  ? "bg-indigo-100 dark:bg-indigo-900/50"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
              }`}
              onClick={() => setSelectedSymbol(stock.symbol)}
            >
              <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                {stock.symbol}
              </span>
              <div className='text-right'>
                <span className='text-sm text-gray-900 dark:text-gray-100'>
                  Rs. {stock.price.toFixed(2)}
                </span>
                <span
                  className={`ml-3 text-xs font-semibold w-16 text-right inline-block ${
                    stock.change >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {stock.change >= 0 ? "+" : ""}
                  {stock.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
