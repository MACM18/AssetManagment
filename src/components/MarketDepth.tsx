"use client";

import { StockQuote } from "@/types";
import { BarChart3 } from "lucide-react";

interface MarketDepthProps {
  stock: StockQuote;
}

export default function MarketDepth({ stock }: MarketDepthProps) {
  console.debug("MarketDepth: stock=", stock);
  // Generate mock order book data (in production, this would come from real market data)
  const generateOrderBook = () => {
    const basePrice = typeof stock.price === "number" ? stock.price : 0;
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

  return (
    <div className='rounded-xl p-6 border'>
      <div className='flex items-center mb-6'>
        <BarChart3 className='w-6 h-6 mr-3' />
        <h2 className='text-xl font-bold'>Market Depth</h2>
      </div>

      <div className='mb-6'>
        <div className='rounded-lg p-4 border'>
          <div className='flex justify-between items-center'>
            <div>
              <p className='text-sm'>Current Price</p>
              <p className='text-2xl font-bold'>
                Rs.{" "}
                {typeof stock.price === "number"
                  ? stock.price.toFixed(2)
                  : "N/A"}
              </p>
            </div>
            <div className='text-right'>
              <p className='text-sm'>Spread</p>
              <p className='text-lg font-semibold'>
                Rs. {((asks[0]?.price || 0) - (bids[0]?.price || 0)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        {/* Bids (Buy Orders) */}
        <div>
          <h3 className='text-sm font-semibold mb-3 flex items-center justify-between'>
            <span>Bids (Buy)</span>
            <span className='text-xs'>
              Total:{" "}
              {bids.reduce((sum, b) => sum + b.volume, 0).toLocaleString()}
            </span>
          </h3>
          <div className='space-y-2'>
            {bids.map((bid, index) => {
              return (
                <div key={index} className='relative'>
                  {/* visual bar removed to keep neutral styling */}
                  <div className='relative px-3 py-2 flex justify-between text-sm'>
                    <span className='font-semibold'>
                      {bid.price.toFixed(2)}
                    </span>
                    <span>{bid.volume.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Asks (Sell Orders) */}
        <div>
          <h3 className='text-sm font-semibold mb-3 flex items-center justify-between'>
            <span>Asks (Sell)</span>
            <span className='text-xs'>
              Total:{" "}
              {asks.reduce((sum, a) => sum + a.volume, 0).toLocaleString()}
            </span>
          </h3>
          <div className='space-y-2'>
            {asks.map((ask, index) => {
              return (
                <div key={index} className='relative'>
                  {/* visual bar removed to keep neutral styling */}
                  <div className='relative px-3 py-2 flex justify-between text-sm'>
                    <span className='font-semibold'>
                      {ask.price.toFixed(2)}
                    </span>
                    <span>{ask.volume.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trading Statistics */}
      <div className='mt-6 pt-6 border-t'>
        <h3 className='text-sm font-semibold mb-3'>Trading Statistics</h3>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div className='rounded p-3 border'>
            <p>Day High</p>
            <p className='font-bold'>
              Rs. {(stock.high || stock.price).toFixed(2)}
            </p>
          </div>
          <div className='rounded p-3 border'>
            <p>Day Low</p>
            <p className='font-bold'>
              Rs. {(stock.low || stock.price).toFixed(2)}
            </p>
          </div>
          <div className='rounded p-3 border'>
            <p>Volume</p>
            <p className='font-bold'>
              {((stock.volume || 0) / 1000).toFixed(0)}K
            </p>
          </div>
          <div className='rounded p-3 border'>
            <p>Prev Close</p>
            <p className='font-bold'>
              Rs. {(stock.close || stock.price).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
