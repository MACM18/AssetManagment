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
    console.debug(
      "fetchLatestStockPrices: FIREBASE_AVAILABLE=",
      FIREBASE_AVAILABLE
    );
    // If Firebase is available, try to fetch from Firestore first
    if (FIREBASE_AVAILABLE) {
      try {
        // Data is stored in stock_prices_by_date collection
        // Each document represents one date with all stocks in an array
        console.debug(
          "fetchLatestStockPrices: querying Firestore collection 'stock_prices_by_date' for latest document"
        );
        const byDateRef = collection(db, "stock_prices_by_date");
        const latestQuery = query(byDateRef, orderBy("date", "desc"), limit(1));
        const latestSnapshot = await getDocs(latestQuery);
        console.debug(
          "fetchLatestStockPrices: latestSnapshot.size=",
          latestSnapshot.size
        );

        if (!latestSnapshot.empty) {
          const latestDoc = latestSnapshot.docs[0];
          console.debug("fetchLatestStockPrices: latest doc id=", latestDoc.id);
          const data = latestDoc.data() as FirestoreStockPricesByDate;
          console.debug(
            "fetchLatestStockPrices: latest doc keys=",
            Object.keys(data)
          );
          const stocksArray = data.stocks || [];
          console.debug(
            "fetchLatestStockPrices: stocksArray.length=",
            stocksArray.length
          );
          if (stocksArray.length > 0)
            console.debug(
              "fetchLatestStockPrices: sample stock=",
              stocksArray[0]
            );

          // Convert stocks array to StockQuote format
          const stocks: StockQuote[] = stocksArray.map(
            (stock: FirestoreStockData) => {
              // Extract shareType from symbol if not present (e.g., 'JKH.N0000' -> 'N')
              let shareType = stock.shareType;
              if (!shareType) {
                const shareTypeMatch = String(stock.symbol).match(
                  /\.([NXPZV])\d*$/i
                );
                shareType = shareTypeMatch
                  ? (shareTypeMatch[1].toUpperCase() as
                      | "N"
                      | "X"
                      | "P"
                      | "Z"
                      )
                  : "N";
              }
              return {
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
                prevClose: stock.close || stock.price || 0,
                shareType: shareType,
              };
            }
          );

          lastDataSource = "firestore";
          console.info(
            `fetchLatestStockPrices: returning ${stocks.length} stocks from Firestore (date=${data.date})`
          );
          return stocks;
        }
        // If Firestore returned empty, fallthrough: we'll return an empty array (mock) below
      } catch (fsError) {
        console.error(
          "fetchLatestStockPrices: Error reading from Firestore:",
          fsError
        );
        console.warn(
          "fetchLatestStockPrices: Firestore read failed; frontend will return mock/empty results for debugging"
        );
      }
    }

    // If Firestore is not available or no data was found, do not call the CSE API.
    // The frontend should rely on Firestore. If Firestore is unavailable we
    // return an empty array so UI can render mock/demo state and show debug logs.
    lastDataSource = "mock";
    console.info(
      "fetchLatestStockPrices: returning empty array (mock/demo mode)"
    );
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
  daysBack: number = 30,
  shareType?: "N" | "X" | "P" | "Z" | "V"
): Promise<ChartDataPoint[]> {
  try {
    console.debug(
      "fetchStockHistory: FIREBASE_AVAILABLE=",
      FIREBASE_AVAILABLE,
      "symbol=",
      symbol,
      "daysBack=",
      daysBack,
      "shareType=",
      shareType ?? "N"
    );
    if (!FIREBASE_AVAILABLE) {
      console.warn(
        "fetchStockHistory: Firebase not available; returning empty history for symbol=",
        symbol
      );
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
    console.debug("fetchStockHistory: querySnapshot.size=", querySnapshot.size);

    const chartData: ChartDataPoint[] = [];

    // Iterate through each date document and find the specific stock (matching symbol and shareType when provided)
    querySnapshot.docs.forEach((doc) => {
      const data = doc.data() as FirestoreStockPricesByDate;
      const stocksArray = data.stocks || [];
      console.debug(
        "fetchStockHistory: visiting doc=",
        doc.id,
        "date=",
        data.date,
        "stocks=",
        stocksArray.length
      );

      // Find the stock with matching symbol (check both normalizedSymbol and symbol) AND matching shareType if provided
      const stockData = stocksArray.find((s: FirestoreStockData) => {
        const symbolMatch =
          s.normalizedSymbol === symbol || s.symbol === symbol;
        if (!symbolMatch) return false;
        // If shareType is provided, require equality (default to 'N' for comparison)
        const targetST = (shareType ?? "N").toUpperCase();
        const thisST = (s.shareType ?? "N").toUpperCase();
        return thisST === targetST;
      });

      if (stockData) {
        console.debug(
          "fetchStockHistory: found stockData for",
          symbol,
          "in doc=",
          doc.id,
          stockData
        );
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

    console.info(
      `fetchStockHistory: returning ${chartData.length} data points for ${symbol}`
    );
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
