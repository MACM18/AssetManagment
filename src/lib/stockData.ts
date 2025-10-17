import axios from 'axios';
import { CSEStockData } from '@/types';

// CSE symbols to track
export const CSE_SYMBOLS = [
  'JKH.N0000',
  'COMB.N0000',
  'HNB.N0000',
  'DIAL.N0000',
  'SAMP.N0000',
  'LFIN.N0000',
  'NTB.N0000',
  'CINS.N0000',
  'BIL.N0000',
  'VONE.N0000'
];

// Throttle delay between API calls (in milliseconds)
const THROTTLE_DELAY = 2000; // 2 seconds between requests

/**
 * Sleep function for throttling
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch stock data from CSE (Colombo Stock Exchange)
 * Note: This is a placeholder. In production, you would use the actual CSE API
 * or a financial data provider like Alpha Vantage, Yahoo Finance, etc.
 */
export async function fetchCSEStockData(symbol: string): Promise<CSEStockData | null> {
  try {
    // Placeholder for CSE API call
    // In production, replace this with actual API endpoint
    // Example: const response = await axios.get(`https://api.cse.lk/stock/${symbol}`);
    
    console.log(`Fetching data for ${symbol}...`);
    
    // Simulated data for demonstration
    // Replace this with actual API call in production
    const mockData: CSEStockData = {
      symbol,
      date: new Date().toISOString().split('T')[0],
      price: Math.random() * 100 + 50,
      change: (Math.random() - 0.5) * 5,
      changePercent: (Math.random() - 0.5) * 10,
      volume: Math.floor(Math.random() * 1000000),
      high: Math.random() * 100 + 60,
      low: Math.random() * 100 + 40,
      open: Math.random() * 100 + 50,
      close: Math.random() * 100 + 50,
    };
    
    return mockData;
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch data for multiple symbols with throttling
 */
export async function fetchMultipleStocks(symbols: string[]): Promise<CSEStockData[]> {
  const results: CSEStockData[] = [];
  
  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    const data = await fetchCSEStockData(symbol);
    
    if (data) {
      results.push(data);
    }
    
    // Throttle between requests (except for the last one)
    if (i < symbols.length - 1) {
      await sleep(THROTTLE_DELAY);
    }
  }
  
  return results;
}

/**
 * Save stock data to local file (Node.js only - server-side)
 */
export function saveStockDataLocally(data: CSEStockData[], date: string): void {
  // Check if running in Node.js environment
  if (typeof window === 'undefined') {
    const fs = require('fs');
    const path = require('path');
    
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filename = path.join(dataDir, `cse-data-${date}.json`);
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`Data saved to ${filename}`);
  } else {
    console.warn('saveStockDataLocally can only be called on the server side');
  }
}
