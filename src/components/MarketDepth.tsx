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
    <div className='bg-card rounded-xl p-4 sm:p-6 border border-border shadow-md'>
      <div className='flex items-center mb-6'>
        <BarChart3 className='w-5 h-5 sm:w-6 sm:h-6 text-primary mr-3' />
        <h2 className='text-lg sm:text-xl font-bold text-foreground'>
          Market Depth
        </h2>
      </div>

      <div className='mb-6'>
        <div className='rounded-lg p-4 border border-border bg-muted/30'>
          <div className='flex justify-between items-center'>
            <div>
              <p className='text-xs sm:text-sm text-muted-foreground'>
                Current Price
              </p>
              <p className='text-xl sm:text-2xl font-bold text-foreground'>
                Rs.{" "}
                {typeof stock.price === "number"
                  ? stock.price.toFixed(2)
                  : "N/A"}
              </p>
            </div>
            <div className='text-right'>
              <p className='text-xs sm:text-sm text-muted-foreground'>Spread</p>
              <p className='text-base sm:text-lg font-semibold text-foreground'>
                Rs. {((asks[0]?.price || 0) - (bids[0]?.price || 0)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        {/* Bids (Buy Orders) */}
        <div>
          <h3 className='text-xs sm:text-sm font-semibold mb-3 flex items-center justify-between text-success'>
            <span>Bids (Buy)</span>
            <span className='text-xs text-muted-foreground'>
              Total:{" "}
              {bids.reduce((sum, b) => sum + b.volume, 0).toLocaleString()}
            </span>
          </h3>
          <div className='space-y-2'>
            {bids.map((bid, index) => {
              return (
                <div key={index} className='relative'>
                  <div className='relative px-2 sm:px-3 py-2 flex justify-between text-xs sm:text-sm bg-success/10 border border-success/20 rounded'>
                    <span className='font-semibold text-success'>
                      {bid.price.toFixed(2)}
                    </span>
                    <span className='text-foreground'>
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
          <h3 className='text-xs sm:text-sm font-semibold mb-3 flex items-center justify-between text-destructive'>
            <span>Asks (Sell)</span>
            <span className='text-xs text-muted-foreground'>
              Total:{" "}
              {asks.reduce((sum, a) => sum + a.volume, 0).toLocaleString()}
            </span>
          </h3>
          <div className='space-y-2'>
            {asks.map((ask, index) => {
              return (
                <div key={index} className='relative'>
                  <div className='relative px-2 sm:px-3 py-2 flex justify-between text-xs sm:text-sm bg-destructive/10 border border-destructive/20 rounded'>
                    <span className='font-semibold text-destructive'>
                      {ask.price.toFixed(2)}
                    </span>
                    <span className='text-foreground'>
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
      <div className='mt-6 pt-6 border-t border-border'>
        <h3 className='text-sm font-semibold text-foreground mb-3'>
          Trading Statistics
        </h3>
        <div className='grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm'>
          <div className='rounded p-3 bg-muted/30 border border-border'>
            <p className='text-muted-foreground'>Day High</p>
            <p className='font-bold text-success'>
              Rs. {(stock.high || stock.price).toFixed(2)}
            </p>
          </div>
          <div className='rounded p-3 bg-muted/30 border border-border'>
            <p className='text-muted-foreground'>Day Low</p>
            <p className='font-bold text-destructive'>
              Rs. {(stock.low || stock.price).toFixed(2)}
            </p>
          </div>
          <div className='rounded p-3 bg-muted/30 border border-border'>
            <p className='text-muted-foreground'>Volume</p>
            <p className='font-bold text-foreground'>
              {((stock.volume || 0) / 1000).toFixed(0)}K
            </p>
          </div>
          <div className='rounded p-3 bg-muted/30 border border-border'>
            <p className='text-muted-foreground'>Prev Close</p>
            <p className='font-bold text-foreground'>
              Rs. {(stock.close || stock.price).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
