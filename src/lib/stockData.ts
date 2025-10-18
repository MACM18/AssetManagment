import { CSEStockData } from '@/types';
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

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

// CSE API endpoint - updated to use tradeSummary endpoint
// This endpoint returns all trade summary data in a single request
const CSE_API_URL = 'https://www.cse.lk/api/tradeSummary';

/**
 * Fetch all stock data from CSE (Colombo Stock Exchange) in a single request
 * Uses the new tradeSummary endpoint which returns all stocks at once
 */
export async function fetchAllCSEStockData(): Promise<CSEStockData[]> {
  try {
    console.log('Fetching trade summary for all stocks...');
    
    // Make request to CSE API - using explicit axios.request config
    const config: AxiosRequestConfig = {
      method: 'post',
      maxBodyLength: Infinity,
      url: CSE_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      // Empty body for tradeSummary endpoint
      data: {},
      timeout: 30000 // 30 second timeout for all data
    };

    const response = await axios.request(config);

    // Extract data array from API response - support multiple possible keys used by the CSE API
    // known shapes: { tradeSummary: [...] } or { reqTradeSummery: [...] } or raw array
    const dataObj = response.data || {};
    const apiDataArray = Array.isArray(dataObj.tradeSummary)
      ? dataObj.tradeSummary
      : Array.isArray(dataObj.reqTradeSummery)
        ? dataObj.reqTradeSummery
        : Array.isArray(dataObj.reqTradeSummary)
          ? dataObj.reqTradeSummary
          : Array.isArray(dataObj)
            ? dataObj
            : [];
    
    if (!apiDataArray.length) {
      console.warn('No trade summary data returned from API');
      return [];
    }
    
    console.log(`Received data for ${apiDataArray.length} stocks`);
    
    // Convert each stock to our CSEStockData format
    const results: CSEStockData[] = [];
    const date = new Date().toISOString().split('T')[0];
    
    for (const apiData of apiDataArray) {
      try {
        // Normalize symbol: API sometimes returns 'JKH.N0000' - strip suffix after '.' to match our CSE_SYMBOLS
        const rawSymbol = apiData.symbol || apiData.Symbol || apiData.symbolCode || '';
        const normalizedSymbol = String(rawSymbol).split('.')[0].toUpperCase();

        // Only process stocks that are in our tracking list (compare normalized symbols)
        if (!CSE_SYMBOLS.includes(normalizedSymbol)) {
          continue;
        }

        // Extract price fields from various possible keys used in the API
        const currentPriceRaw = apiData.price ?? apiData.closingPrice ?? apiData.priceInfo?.currentPrice ?? apiData.lastPrice ?? 0;
        const previousCloseRaw = apiData.previousClose ?? apiData.closingPrice ?? apiData.priceInfo?.previousClose ?? 0;
  const changeRaw = apiData.change ?? (currentPriceRaw - previousCloseRaw);
        const percentageChangeRaw = apiData.percentageChange ?? apiData.percentageChanged ?? apiData.percentage ?? 0;
        const openRaw = apiData.open ?? apiData.priceInfo?.open ?? 0;
        const highRaw = apiData.high ?? apiData.priceInfo?.high ?? 0;
        const lowRaw = apiData.low ?? apiData.priceInfo?.low ?? 0;
        const volumeRaw = apiData.sharevolume ?? apiData.shareVolume ?? apiData.shareVolumeCount ?? apiData.tradevolume ?? 0;

        const currentPrice = Number(currentPriceRaw) || 0;
        const previousClose = Number(previousCloseRaw) || 0;
        const change = Number(changeRaw) || 0;
        const percentageChange = Number(percentageChangeRaw) || 0;
        const open = Number(openRaw) || 0;
        const high = Number(highRaw) || 0;
        const low = Number(lowRaw) || 0;
        const volume = parseInt(String(volumeRaw || '0'), 10) || 0;

        // Convert to our CSEStockData format
        const stockData: CSEStockData = {
          symbol: rawSymbol,
          date,
          price: currentPrice,
          change: change,
          changePercent: percentageChange,
          volume: volume,
          high: high,
          low: low,
          open: open,
          close: previousClose,
        };
        
  results.push(stockData);
  console.log(`✓ Processed ${normalizedSymbol}: ${currentPrice}`);
      } catch (itemError) {
        console.error(`Error parsing data for stock:`, itemError);
        // Continue processing other stocks
      }
    }
    
    return results;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching trade summary:', error.message);
      if (error.response) {
        console.error(`Response status: ${error.response.status}`);
        console.error(`Response data:`, error.response.data);
      }
    } else {
      console.error('Error fetching trade summary:', error);
    }
    return [];
  }
}

/**
 * Fetch stock data for a single symbol from CSE
 * This function is kept for backward compatibility but now uses the bulk endpoint
 */
export async function fetchCSEStockData(symbol: string): Promise<CSEStockData | null> {
  try {
    console.log(`Fetching data for ${symbol}...`);
    
    // Use the bulk fetch and filter for the specific symbol
    const allStocks = await fetchAllCSEStockData();
    const stockData = allStocks.find(stock => stock.symbol === symbol);
    
    if (stockData) {
      console.log(`✓ Found ${symbol}: ${stockData.price}`);
      return stockData;
    } else {
      console.warn(`Stock ${symbol} not found in trade summary`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch data for multiple symbols
 * Now uses the bulk tradeSummary endpoint for efficiency (single request)
 */
export async function fetchMultipleStocks(symbols: string[]): Promise<CSEStockData[]> {
  console.log(`Fetching data for ${symbols.length} symbols using bulk endpoint...`);
  
  // Use the new bulk fetch - no need for throttling anymore!
  const allStocks = await fetchAllCSEStockData();
  
  // Filter to only include the requested symbols
  const results = allStocks.filter(stock => symbols.includes(stock.symbol));
  
  console.log(`Successfully fetched ${results.length} out of ${symbols.length} requested stocks`);
  
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

/**
 * Save stock data to Firestore (server-side only)
 * Documents will be created under collection: `stock_prices` with auto-ids
 * Each document shape (good for CSV export / ML training):
 * { symbol, date, price, open, high, low, close, change, changePercent, volume, createdAt }
 */
// Firestore-saving moved to server-only script to avoid client bundling (see scripts/saveStockDataToFirestore.ts)
