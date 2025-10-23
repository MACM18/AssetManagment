import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from "firebase/firestore";
import { db, FIREBASE_AVAILABLE } from "./firebase";
import { StockQuote, ChartDataPoint, MarketSummary } from "@/types";
import { subDays } from "date-fns";
import { fetchAllCSEStockData } from "./stockData";

// lastDataSource: 'firestore' | 'cse-api' | 'mock' - exported for UI visibility
let lastDataSource: "firestore" | "cse-api" | "mock" = "mock";

export function getLastDataSource() {
  return lastDataSource;
}

/**
 * Fetch latest stock prices from Firestore
 */
export async function fetchLatestStockPrices(): Promise<StockQuote[]> {
  try {
    // If Firebase is available, try to fetch from Firestore first
    if (FIREBASE_AVAILABLE) {
      try {
        const stocksRef = collection(db, "stock_prices");
        // Get the latest date first
        const latestQuery = query(stocksRef, orderBy("date", "desc"), limit(1));
        const latestSnapshot = await getDocs(latestQuery);

        if (!latestSnapshot.empty) {
          const latestDate = latestSnapshot.docs[0].data().date;

          // Get all stocks from the latest date
          const stockQuery = query(
            stocksRef,
            where("date", "==", latestDate),
            orderBy("symbol", "asc")
          );

          const querySnapshot = await getDocs(stockQuery);
          const stocks: StockQuote[] = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              symbol: data.symbol || "",
              companyName: data.companyName || data.symbol || "",
              date: data.date || "",
              price: data.price || 0,
              change: data.change || 0,
              changePercent: data.changePercent || 0,
              volume: data.volume || 0,
              high: data.high || data.price || 0,
              low: data.low || data.price || 0,
              open: data.open || data.price || 0,
              close: data.close || data.price || 0,
              timestamp: data.createdAt || new Date().toISOString(),
            } as StockQuote;
          });

          lastDataSource = "firestore";
          return stocks;
        }
        // If Firestore returned empty, fallthrough to CSE API below
      } catch (fsError) {
        console.warn(
          "Error reading from Firestore, falling back to CSE API",
          fsError
        );
      }
    }

    // Fallback: fetch latest from CSE API (bulk) and map to StockQuote
    try {
      const cseData = await fetchAllCSEStockData();
      if (cseData.length > 0) {
        const stocks: StockQuote[] = cseData.map((d) => ({
          id: undefined,
          symbol: d.symbol,
          companyName: d.companyName || d.symbol,
          date: d.date,
          price: d.price || 0,
          change: d.change || 0,
          changePercent: d.changePercent || 0,
          volume: d.volume || 0,
          high: d.high || d.price || 0,
          low: d.low || d.price || 0,
          open: d.open || d.price || 0,
          close: d.close || d.price || 0,
          timestamp: new Date().toISOString(),
        }));

        lastDataSource = "cse-api";
        return stocks;
      }
    } catch (apiError) {
      console.warn(
        "Error fetching from CSE API, falling back to mock data",
        apiError
      );
    }

    // Final fallback: return empty array (UI will handle mock generation for charts)
    lastDataSource = "mock";
    return [];
  } catch (error) {
    console.error("Error fetching latest stock prices:", error);
    return [];
  }
}

/**
 * Fetch historical data for a specific stock for charting
 */
export async function fetchStockHistory(
  symbol: string,
  daysBack: number = 30
): Promise<ChartDataPoint[]> {
  try {
    const stocksRef = collection(db, "stock_prices");
    const cutoffDate = subDays(new Date(), daysBack)
      .toISOString()
      .split("T")[0];

    const stockQuery = query(
      stocksRef,
      where("symbol", "==", symbol),
      where("date", ">=", cutoffDate),
      orderBy("date", "asc")
    );

    const querySnapshot = await getDocs(stockQuery);

    const chartData: ChartDataPoint[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        date: data.date || "",
        timestamp: new Date(data.date).getTime(),
        open: data.open || data.price || 0,
        high: data.high || data.price || 0,
        low: data.low || data.price || 0,
        close: data.close || data.price || 0,
        volume: data.volume || 0,
      };
    });

    return chartData;
  } catch (error) {
    console.error(`Error fetching stock history for ${symbol}:`, error);
    return [];
  }
}

/**
 * Calculate market summary from stock data
 */
export function calculateMarketSummary(stocks: StockQuote[]): MarketSummary {
  const advancers = stocks.filter((s) => (s.changePercent || 0) > 0).length;
  const decliners = stocks.filter((s) => (s.changePercent || 0) < 0).length;
  const unchanged = stocks.filter((s) => (s.changePercent || 0) === 0).length;
  const totalVolume = stocks.reduce((sum, s) => sum + (s.volume || 0), 0);
  const totalTrades = stocks.length;

  return {
    totalVolume,
    totalTrades,
    advancers,
    decliners,
    unchanged,
  };
}

/**
 * Generate mock historical data for a stock (fallback when no data in Firestore)
 */
export function generateMockChartData(
  basePrice: number,
  days: number = 30
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  let currentPrice = basePrice;

  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = date.toISOString().split("T")[0];

    // Random walk with some volatility
    const change = (Math.random() - 0.5) * basePrice * 0.02;
    currentPrice = Math.max(
      basePrice * 0.8,
      Math.min(basePrice * 1.2, currentPrice + change)
    );

    const high = currentPrice * (1 + Math.random() * 0.02);
    const low = currentPrice * (1 - Math.random() * 0.02);
    const open = low + Math.random() * (high - low);
    const close = low + Math.random() * (high - low);

    data.push({
      date: dateStr,
      timestamp: date.getTime(),
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 50000) + 10000,
    });
  }

  return data;
}
