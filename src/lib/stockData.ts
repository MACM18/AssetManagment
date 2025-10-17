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
    
    // Make request to CSE API - no body required for tradeSummary endpoint
    const response = await axios.post(CSE_API_URL, {}, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout for all data
    });
    
    // Extract data from API response - expecting an array
    const apiDataArray = Array.isArray(response.data) ? response.data : [];
    
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
        // Only process stocks that are in our tracking list
        const symbol = apiData.symbol;
        if (!CSE_SYMBOLS.includes(symbol)) {
          continue;
        }
        
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
        console.log(`✓ Processed ${symbol}: ${currentPrice}`);
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
