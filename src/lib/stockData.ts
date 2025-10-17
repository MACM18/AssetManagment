import { CSEStockData } from '@/types';
import axios from 'axios';

// CSE symbols to track
// Add or remove stock symbols here as needed
export const CSE_SYMBOLS = [
  'JKH',
  'COMB',
  'HNB',
  'DIAL',
  'SAMP',
  'LFIN',
  'NTB',
  'CINS',
  'BIL',
  'VONE',
  'LOLC'
];

// Throttle delay between API calls (in milliseconds)
// This prevents being blocked by the API server
const THROTTLE_DELAY = 10000; // 10 seconds between requests

// CSE API endpoint
const CSE_API_URL = 'https://www.cse.lk/api/companyInfoSummery';

/**
 * Sleep function for throttling
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch stock data from CSE (Colombo Stock Exchange)
 * Uses the official CSE API endpoint
 */
export async function fetchCSEStockData(symbol: string): Promise<CSEStockData | null> {
  try {
    console.log(`Fetching data for ${symbol}...`);
    
    // Make request to CSE API with symbol in request body
    const response = await axios.post(CSE_API_URL, {
      symbol: symbol
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
    
    // Extract data from API response
    const apiData = response.data;
    
    // Parse price information from the response
    const currentPrice = parseFloat(apiData.priceInfo?.currentPrice || '0');
    const previousClose = parseFloat(apiData.priceInfo?.previousClose || '0');
    const change = parseFloat(apiData.priceInfo?.change || '0');
    const percentageChange = parseFloat(apiData.priceInfo?.percentageChange || '0');
    const open = parseFloat(apiData.priceInfo?.open || '0');
    const high = parseFloat(apiData.priceInfo?.high || '0');
    const low = parseFloat(apiData.priceInfo?.low || '0');
    const volume = parseInt(apiData.shareVolume || '0', 10);
    
    // Convert to our CSEStockData format
    const stockData: CSEStockData = {
      symbol,
      date: new Date().toISOString().split('T')[0],
      price: currentPrice,
      change: change,
      changePercent: percentageChange,
      volume: volume,
      high: high,
      low: low,
      open: open,
      close: previousClose,
    };
    
    return stockData;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching data for ${symbol}:`, error.message);
      if (error.response) {
        console.error(`Response status: ${error.response.status}`);
      }
    } else {
      console.error(`Error fetching data for ${symbol}:`, error);
    }
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
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
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
