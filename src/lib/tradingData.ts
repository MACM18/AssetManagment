import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from "firebase/firestore";
import { db, FIREBASE_AVAILABLE } from "./firebase";
import {
  StockQuote,
  ChartDataPoint,
  MarketSummary,
  FirestoreStockPricesByDate,
  FirestoreStockData,
} from "@/types";
import { subDays } from "date-fns";

// lastDataSource: 'firestore' | 'mock' - exported for UI visibility
let lastDataSource: "firestore" | "mock" = "mock";

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
        // Data is stored in stock_prices_by_date collection
        // Each document represents one date with all stocks in an array
        const byDateRef = collection(db, "stock_prices_by_date");
        const latestQuery = query(byDateRef, orderBy("date", "desc"), limit(1));
        const latestSnapshot = await getDocs(latestQuery);

        if (!latestSnapshot.empty) {
          const latestDoc = latestSnapshot.docs[0];
          const data = latestDoc.data() as FirestoreStockPricesByDate;
          const stocksArray = data.stocks || [];

          // Convert stocks array to StockQuote format
          const stocks: StockQuote[] = stocksArray.map(
            (stock: FirestoreStockData) => ({
              id: `${stock.symbol}_${data.date}`,
              symbol: stock.normalizedSymbol || stock.symbol || "",
              companyName: stock.companyName || stock.symbol || "",
              date: stock.date || data.date || "",
              price: stock.price || 0,
              change: stock.change || 0,
              changePercent: stock.changePercent || 0,
              volume: stock.volume || 0,
              high: stock.high || stock.price || 0,
              low: stock.low || stock.price || 0,
              open: stock.open || stock.price || 0,
              close: stock.close || stock.price || 0,
              timestamp:
                typeof data.updatedAt === "object" && data.updatedAt?.toDate
                  ? data.updatedAt.toDate().toISOString()
                  : new Date().toISOString(),
            })
          );

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

    // If Firestore is not available or no data was found, do not call the CSE API
    // The frontend should rely on Firestore. If Firestore is unavailable we
    // fall back to returning an empty array (UI can render mock/demo state).
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
    if (!FIREBASE_AVAILABLE) {
      return [];
    }

    const byDateRef = collection(db, "stock_prices_by_date");
    const cutoffDate = subDays(new Date(), daysBack)
      .toISOString()
      .split("T")[0];

    const dateQuery = query(
      byDateRef,
      where("date", ">=", cutoffDate),
      orderBy("date", "asc")
    );

    const querySnapshot = await getDocs(dateQuery);

    const chartData: ChartDataPoint[] = [];

    // Iterate through each date document and find the specific stock
    querySnapshot.docs.forEach((doc) => {
      const data = doc.data() as FirestoreStockPricesByDate;
      const stocksArray = data.stocks || [];

      // Find the stock with matching symbol (check both normalizedSymbol and symbol)
      const stockData = stocksArray.find(
        (s: FirestoreStockData) =>
          s.normalizedSymbol === symbol || s.symbol === symbol
      );

      if (stockData) {
        chartData.push({
          date: data.date || "",
          timestamp: new Date(data.date).getTime(),
          open: stockData.open || stockData.price || 0,
          high: stockData.high || stockData.price || 0,
          low: stockData.low || stockData.price || 0,
          close: stockData.close || stockData.price || 0,
          volume: stockData.volume || 0,
        });
      }
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
