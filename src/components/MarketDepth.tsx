"use client";

import { StockQuote } from "@/types";
import { BarChart3 } from "lucide-react";

interface MarketDepthProps {
  stock: StockQuote;
}

export default function MarketDepth({ stock }: MarketDepthProps) {
  // Generate mock order book data (in production, this would come from real market data)
  const generateOrderBook = () => {
    const basePrice = stock.price;
    const bids = [];
    const asks = [];

    // Generate 5 bid levels (buy orders below current price)
    for (let i = 0; i < 5; i++) {
      bids.push({
        price: basePrice - (i + 1) * 0.5,
        volume: Math.floor(Math.random() * 10000) + 1000,
        orders: Math.floor(Math.random() * 20) + 5,
      });
    }

    // Generate 5 ask levels (sell orders above current price)
    for (let i = 0; i < 5; i++) {
      asks.push({
        price: basePrice + (i + 1) * 0.5,
        volume: Math.floor(Math.random() * 10000) + 1000,
        orders: Math.floor(Math.random() * 20) + 5,
      });
    }

    return { bids, asks };
  };

  const { bids, asks } = generateOrderBook();
  const maxVolume = Math.max(
    ...bids.map((b) => b.volume),
    ...asks.map((a) => a.volume)
  );

  return (
    <div className='bg-white rounded-lg shadow-lg p-6'>
      <div className='flex items-center mb-6'>
        <BarChart3 className='w-6 h-6 mr-2 text-blue-600' />
        <h2 className='text-xl font-bold text-gray-900'>Market Depth</h2>
      </div>

      <div className='mb-6'>
        <div className='bg-gray-50 rounded-lg p-4'>
          <div className='flex justify-between items-center'>
            <div>
              <p className='text-sm text-gray-600'>Current Price</p>
              <p className='text-2xl font-bold text-gray-900'>
                Rs. {stock.price.toFixed(2)}
              </p>
            </div>
            <div className='text-right'>
              <p className='text-sm text-gray-600'>Spread</p>
              <p className='text-lg font-semibold text-gray-900'>
                Rs. {((asks[0]?.price || 0) - (bids[0]?.price || 0)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        {/* Bids (Buy Orders) */}
        <div>
          <h3 className='text-sm font-semibold text-green-600 mb-3 flex items-center justify-between'>
            <span>Bids (Buy)</span>
            <span className='text-xs text-gray-500'>
              Total:{" "}
              {bids.reduce((sum, b) => sum + b.volume, 0).toLocaleString()}
            </span>
          </h3>
          <div className='space-y-2'>
            {bids.map((bid, index) => {
              const widthPercent = (bid.volume / maxVolume) * 100;
              return (
                <div key={index} className='relative'>
                  <div
                    className='absolute inset-0 bg-green-100 rounded'
                    style={{ width: `${widthPercent}%` }}
                  />
                  <div className='relative px-3 py-2 flex justify-between text-sm'>
                    <span className='font-semibold text-green-700'>
                      {bid.price.toFixed(2)}
                    </span>
                    <span className='text-gray-600'>
                      {bid.volume.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Asks (Sell Orders) */}
        <div>
          <h3 className='text-sm font-semibold text-red-600 mb-3 flex items-center justify-between'>
            <span>Asks (Sell)</span>
            <span className='text-xs text-gray-500'>
              Total:{" "}
              {asks.reduce((sum, a) => sum + a.volume, 0).toLocaleString()}
            </span>
          </h3>
          <div className='space-y-2'>
            {asks.map((ask, index) => {
              const widthPercent = (ask.volume / maxVolume) * 100;
              return (
                <div key={index} className='relative'>
                  <div
                    className='absolute inset-0 bg-red-100 rounded'
                    style={{ width: `${widthPercent}%` }}
                  />
                  <div className='relative px-3 py-2 flex justify-between text-sm'>
                    <span className='font-semibold text-red-700'>
                      {ask.price.toFixed(2)}
                    </span>
                    <span className='text-gray-600'>
                      {ask.volume.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trading Statistics */}
      <div className='mt-6 pt-6 border-t border-gray-200'>
        <h3 className='text-sm font-semibold text-gray-700 mb-3'>
          Trading Statistics
        </h3>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div className='bg-gray-50 rounded p-3'>
            <p className='text-gray-600'>Day High</p>
            <p className='font-bold text-gray-900'>
              Rs. {(stock.high || stock.price).toFixed(2)}
            </p>
          </div>
          <div className='bg-gray-50 rounded p-3'>
            <p className='text-gray-600'>Day Low</p>
            <p className='font-bold text-gray-900'>
              Rs. {(stock.low || stock.price).toFixed(2)}
            </p>
          </div>
          <div className='bg-gray-50 rounded p-3'>
            <p className='text-gray-600'>Volume</p>
            <p className='font-bold text-gray-900'>
              {((stock.volume || 0) / 1000).toFixed(0)}K
            </p>
          </div>
          <div className='bg-gray-50 rounded p-3'>
            <p className='text-gray-600'>Prev Close</p>
            <p className='font-bold text-gray-900'>
              Rs. {(stock.close || stock.price).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
