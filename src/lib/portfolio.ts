"use client";

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db, FIREBASE_AVAILABLE } from "./firebase";
import {
  PortfolioHolding,
  Transaction,
  PortfolioSummary,
  PortfolioHoldingWithMetrics,
  StockQuote,
  PortfolioAsset,
  AssetWithMetrics,
  AssetsSummary,
  AssetType,
  SectorAllocation,
} from "@/types";

/**
 * Add a new holding to the user's portfolio
 */
export async function addHolding(
  userId: string,
  holding: Omit<PortfolioHolding, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<string> {
  if (!FIREBASE_AVAILABLE) {
    throw new Error(
      "Unable to add holding: Firebase is not configured. Please set NEXT_PUBLIC_FIREBASE_* environment variables."
    );
  }

  // Use a write batch so the holding and its transaction are written atomically
  const batch = writeBatch(db);

  const holdingsCol = collection(db, "portfolios", userId, "holdings");
  const newHoldingRef = doc(holdingsCol);

  const transactionsCol = collection(db, "portfolios", userId, "transactions");
  const newTransactionRef = doc(transactionsCol);

  type HoldingWrite = Omit<
    PortfolioHolding,
    "id" | "createdAt" | "updatedAt"
  > & {
    createdAt: unknown;
    updatedAt: unknown;
  };
  const holdingPayload: HoldingWrite = {
    ...holding,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Filter out undefined values to avoid Firestore errors
  const cleanHoldingPayload = Object.fromEntries(
    Object.entries(holdingPayload).filter(([, value]) => value !== undefined)
  );

  type TransactionWrite = Omit<Transaction, "id" | "createdAt"> & {
    createdAt: unknown;
  };
  const transactionPayload: TransactionWrite = {
    symbol: holding.symbol,
    companyName: holding.companyName,
    type: "buy",
    quantity: holding.quantity,
    price: holding.purchasePrice,
    totalAmount: holding.quantity * holding.purchasePrice,
    date: holding.purchaseDate,
    notes: holding.notes,
    userId,
    createdAt: serverTimestamp(),
  };

  // Filter out undefined values
  const cleanTransactionPayload = Object.fromEntries(
    Object.entries(transactionPayload).filter(
      ([, value]) => value !== undefined
    )
  );

  batch.set(newHoldingRef, cleanHoldingPayload);
  batch.set(newTransactionRef, cleanTransactionPayload);

  await batch.commit();

  return newHoldingRef.id;
}

/**
 * Update an existing holding
 */
export async function updateHolding(
  userId: string,
  holdingId: string,
  updates: Partial<Omit<PortfolioHolding, "id" | "userId" | "createdAt">>
): Promise<void> {
  if (!FIREBASE_AVAILABLE) {
    throw new Error("Firebase is not initialized");
  }

  const holdingRef = doc(db, "portfolios", userId, "holdings", holdingId);
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );
  await updateDoc(holdingRef, {
    ...cleanUpdates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a holding
 */
export async function deleteHolding(
  userId: string,
  holdingId: string
): Promise<void> {
  if (!FIREBASE_AVAILABLE) {
    throw new Error("Firebase is not initialized");
  }

  const holdingRef = doc(db, "portfolios", userId, "holdings", holdingId);
  await deleteDoc(holdingRef);
}

/**
 * Get all holdings for a user
 */
export async function getUserHoldings(
  userId: string
): Promise<PortfolioHolding[]> {
  if (!FIREBASE_AVAILABLE) {
    return [];
  }

  const holdingsRef = collection(db, "portfolios", userId, "holdings");
  const q = query(holdingsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
      updatedAt:
        data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt,
    } as PortfolioHolding;
  });
}

/**
 * Get a single holding
 */
export async function getHolding(
  userId: string,
  holdingId: string
): Promise<PortfolioHolding | null> {
  if (!FIREBASE_AVAILABLE) {
    return null;
  }

  const holdingRef = doc(db, "portfolios", userId, "holdings", holdingId);
  const snapshot = await getDoc(holdingRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt,
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : data.updatedAt,
  } as PortfolioHolding;
}

/**
 * Add a transaction record
 */
export async function addTransaction(
  userId: string,
  transaction: Omit<Transaction, "id" | "userId" | "createdAt">
): Promise<string> {
  if (!FIREBASE_AVAILABLE) {
    throw new Error("Firebase is not initialized");
  }

  const transactionsRef = collection(db, "portfolios", userId, "transactions");
  const cleanTransaction = Object.fromEntries(
    Object.entries(transaction).filter(([, value]) => value !== undefined)
  );
  const docRef = await addDoc(transactionsRef, {
    ...cleanTransaction,
    userId,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Get all transactions for a user
 */
export async function getUserTransactions(
  userId: string
): Promise<Transaction[]> {
  if (!FIREBASE_AVAILABLE) {
    return [];
  }

  const transactionsRef = collection(db, "portfolios", userId, "transactions");
  const q = query(transactionsRef, orderBy("date", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
    } as Transaction;
  });
}

/**
 * Get transactions for a specific symbol
 */
export async function getSymbolTransactions(
  userId: string,
  symbol: string
): Promise<Transaction[]> {
  if (!FIREBASE_AVAILABLE) {
    return [];
  }

  const transactionsRef = collection(db, "portfolios", userId, "transactions");
  const q = query(
    transactionsRef,
    where("symbol", "==", symbol),
    orderBy("date", "desc")
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
    } as Transaction;
  });
}

/**
 * Calculate portfolio summary with current market prices
 */
export async function calculatePortfolioSummary(
  userId: string,
  currentStockPrices: StockQuote[]
): Promise<PortfolioSummary> {
  const holdings = await getUserHoldings(userId);

  // Create a map for quick price lookups
  const priceMap = new Map(
    currentStockPrices.map((stock) => [stock.symbol, stock.price])
  );

  let totalInvested = 0;
  let currentValue = 0;

  const holdingsWithMetrics: PortfolioHoldingWithMetrics[] = holdings.map(
    (holding) => {
      const invested = holding.quantity * holding.purchasePrice;
      const currentPrice =
        priceMap.get(holding.symbol) || holding.purchasePrice;
      const current = holding.quantity * currentPrice;
      const gainLoss = current - invested;
      const gainLossPercent = invested > 0 ? (gainLoss / invested) * 100 : 0;

      totalInvested += invested;
      currentValue += current;

      return {
        ...holding,
        currentPrice,
        currentValue: current,
        gainLoss,
        gainLossPercent,
        invested,
        isPositive: gainLoss >= 0,
        formattedGainLoss: new Intl.NumberFormat("en-LK", {
          style: "currency",
          currency: "LKR",
          minimumFractionDigits: 2,
        }).format(Math.abs(gainLoss)),
        formattedCurrentValue: new Intl.NumberFormat("en-LK", {
          style: "currency",
          currency: "LKR",
          minimumFractionDigits: 2,
        }).format(current),
        formattedInvested: new Intl.NumberFormat("en-LK", {
          style: "currency",
          currency: "LKR",
          minimumFractionDigits: 2,
        }).format(invested),
      };
    }
  );

  const totalGainLoss = currentValue - totalInvested;
  const totalGainLossPercent =
    totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  // Sort for top/worst performers
  const sortedByGain = [...holdingsWithMetrics].sort(
    (a, b) => b.gainLossPercent - a.gainLossPercent
  );
  const topPerformers = sortedByGain.slice(0, 5);
  const worstPerformers = sortedByGain.slice(-5).reverse();

  // Calculate sector allocation
  const sectorMap = new Map<string, { value: number; holdings: number }>();
  holdingsWithMetrics.forEach((holding) => {
    const sector = holding.sector || "Unknown";
    const existing = sectorMap.get(sector) || { value: 0, holdings: 0 };
    sectorMap.set(sector, {
      value: existing.value + holding.currentValue,
      holdings: existing.holdings + 1,
    });
  });

  const sectorAllocation: SectorAllocation[] = Array.from(sectorMap.entries())
    .map(([sector, data]) => ({
      sector,
      value: data.value,
      percentage: totalInvested > 0 ? (data.value / totalInvested) * 100 : 0,
      holdings: data.holdings,
    }))
    .sort((a, b) => b.value - a.value);

  return {
    totalInvested,
    currentValue,
    totalGainLoss,
    totalGainLossPercent,
    holdings: holdingsWithMetrics,
    topPerformers,
    worstPerformers,
    sectorAllocation,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Aggregate holdings by symbol (combine multiple purchases of same stock)
 */
export function aggregateHoldingsBySymbol(
  holdings: PortfolioHoldingWithMetrics[]
): PortfolioHoldingWithMetrics[] {
  const aggregated = new Map<string, PortfolioHoldingWithMetrics>();

  holdings.forEach((holding) => {
    if (aggregated.has(holding.symbol)) {
      const existing = aggregated.get(holding.symbol)!;
      const totalQuantity = existing.quantity + holding.quantity;
      const totalInvested = existing.invested + holding.invested;
      const avgPurchasePrice = totalInvested / totalQuantity;

      aggregated.set(holding.symbol, {
        ...existing,
        quantity: totalQuantity,
        purchasePrice: avgPurchasePrice,
        invested: totalInvested,
        currentValue: existing.currentValue + holding.currentValue,
        gainLoss: existing.gainLoss + holding.gainLoss,
        gainLossPercent:
          totalInvested > 0
            ? ((existing.gainLoss + holding.gainLoss) / totalInvested) * 100
            : 0,
      });
    } else {
      aggregated.set(holding.symbol, holding);
    }
  });

  return Array.from(aggregated.values());
}

// ===== Assets (Non-stock) API =====

/** Add a new portfolio asset (non-stock) */
export async function addAsset(
  userId: string,
  asset: Omit<PortfolioAsset, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<string> {
  if (!FIREBASE_AVAILABLE) {
    throw new Error("Firebase is not initialized");
  }
  const assetsCol = collection(db, "portfolios", userId, "assets");
  const docRef = doc(assetsCol);
  const assetPayload = {
    ...asset,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const cleanPayload = Object.fromEntries(
    Object.entries(assetPayload).filter(([, value]) => value !== undefined)
  );
  await writeBatch(db).set(docRef, cleanPayload).commit();
  return docRef.id;
}

/** Update an asset */
export async function updateAsset(
  userId: string,
  assetId: string,
  updates: Partial<Omit<PortfolioAsset, "id" | "userId" | "createdAt">>
): Promise<void> {
  if (!FIREBASE_AVAILABLE) throw new Error("Firebase is not initialized");
  const ref = doc(db, "portfolios", userId, "assets", assetId);
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );
  await updateDoc(ref, { ...cleanUpdates, updatedAt: serverTimestamp() });
}

/** Delete an asset */
export async function deleteAsset(
  userId: string,
  assetId: string
): Promise<void> {
  if (!FIREBASE_AVAILABLE) throw new Error("Firebase is not initialized");
  const ref = doc(db, "portfolios", userId, "assets", assetId);
  await deleteDoc(ref);
}

/** Get all assets for a user */
export async function getUserAssets(userId: string): Promise<PortfolioAsset[]> {
  if (!FIREBASE_AVAILABLE) return [];
  const assetsRef = collection(db, "portfolios", userId, "assets");
  const q = query(assetsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    const created = (data as { createdAt?: unknown }).createdAt;
    const updated = (data as { updatedAt?: unknown }).updatedAt;
    const toIso = (v: unknown) =>
      v && typeof (v as { toDate?: () => Date }).toDate === "function"
        ? (v as { toDate: () => Date }).toDate().toISOString()
        : (v as string | undefined);
    return {
      id: d.id,
      ...data,
      createdAt: toIso(created) || new Date().toISOString(),
      updatedAt: toIso(updated) || new Date().toISOString(),
    } as unknown as PortfolioAsset;
  });
}

// Helpers to compute current value for each asset type
function yearsBetween(startDateISO: string, endDateISO: string): number {
  const start = new Date(startDateISO).getTime();
  const end = new Date(endDateISO).getTime();
  const msInYear = 365.25 * 24 * 60 * 60 * 1000;
  return Math.max(0, (end - start) / msInYear);
}

function periodsPerYear(
  freq: "simple" | "monthly" | "quarterly" | "annually"
): number {
  switch (freq) {
    case "monthly":
      return 12;
    case "quarterly":
      return 4;
    case "annually":
      return 1;
    default:
      return 0; // simple interest handled separately
  }
}

export function computeAssetMetrics(
  asset: PortfolioAsset,
  asOfISO = new Date().toISOString()
): AssetWithMetrics {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(value);

  switch (asset.type) {
    case "fixed-asset": {
      const invested = asset.purchasePrice;
      const currentValue = asset.currentValue ?? invested;
      const gainLoss = currentValue - invested;
      const gainLossPercent = invested > 0 ? (gainLoss / invested) * 100 : 0;
      return {
        ...asset,
        invested,
        currentValue,
        gainLoss,
        gainLossPercent,
        isPositive: gainLoss >= 0,
        formattedGainLoss: formatCurrency(Math.abs(gainLoss)),
        formattedCurrentValue: formatCurrency(currentValue),
        formattedInvested: formatCurrency(invested),
      };
    }
    case "fixed-deposit": {
      const p = asset.principal;
      const r = (asset.interestRate || 0) / 100;
      const endISO =
        asset.maturityDate && asset.autoRenewal !== true
          ? new Date(
              Math.min(
                new Date(asOfISO).getTime(),
                new Date(asset.maturityDate).getTime()
              )
            ).toISOString()
          : asOfISO;
      const t = yearsBetween(asset.startDate, endISO);
      let currentValue = p;
      if (
        asset.compounding === "simple" ||
        periodsPerYear(asset.compounding) === 0
      ) {
        currentValue = p * (1 + r * t);
      } else {
        const m = periodsPerYear(asset.compounding);
        currentValue = p * Math.pow(1 + r / m, m * t);
      }
      const invested = p;
      const gainLoss = currentValue - invested;
      const gainLossPercent = invested > 0 ? (gainLoss / invested) * 100 : 0;

      // Calculate days to maturity
      const daysToMaturity = asset.maturityDate
        ? Math.max(
            0,
            Math.ceil(
              (new Date(asset.maturityDate).getTime() -
                new Date(asOfISO).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          )
        : undefined;

      const isMatured = daysToMaturity === 0;

      return {
        ...asset,
        invested,
        currentValue,
        gainLoss,
        gainLossPercent,
        isPositive: gainLoss >= 0,
        formattedGainLoss: formatCurrency(Math.abs(gainLoss)),
        formattedCurrentValue: formatCurrency(currentValue),
        formattedInvested: formatCurrency(invested),
        status: isMatured ? "matured" : "active",
        daysToMaturity,
      };
    }
    case "savings": {
      const currentValue = asset.balance;
      return {
        ...asset,
        currentValue,
        formattedCurrentValue: formatCurrency(currentValue),
        status: "active",
      };
    }
    case "mutual-fund": {
      const invested =
        asset.buyNav && asset.units ? asset.buyNav * asset.units : undefined;
      const currentValue =
        asset.lastNav && asset.units
          ? asset.lastNav * asset.units
          : invested ?? 0;
      const gainLoss =
        invested !== undefined ? currentValue - invested : undefined;
      const gainLossPercent =
        invested && invested > 0 && gainLoss !== undefined
          ? (gainLoss / invested) * 100
          : undefined;
      return {
        ...asset,
        invested,
        currentValue,
        gainLoss,
        gainLossPercent,
        isPositive: gainLoss ? gainLoss >= 0 : undefined,
        formattedGainLoss: gainLoss
          ? formatCurrency(Math.abs(gainLoss))
          : undefined,
        formattedCurrentValue: formatCurrency(currentValue),
        formattedInvested: invested ? formatCurrency(invested) : undefined,
        status: "active",
      };
    }
    case "treasury-bond": {
      const price = asset.currentMarketPrice ?? asset.faceValue;
      const currentValue = (asset.units || 0) * price;
      const invested = asset.purchasePrice
        ? asset.purchasePrice * (asset.units || 0)
        : asset.faceValue * (asset.units || 0);
      const gainLoss = currentValue - invested;
      const gainLossPercent = invested > 0 ? (gainLoss / invested) * 100 : 0;

      // Calculate days to maturity
      const daysToMaturity = asset.maturityDate
        ? Math.max(
            0,
            Math.ceil(
              (new Date(asset.maturityDate).getTime() -
                new Date(asOfISO).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          )
        : undefined;

      const isMatured = daysToMaturity === 0;

      return {
        ...asset,
        invested,
        currentValue,
        gainLoss,
        gainLossPercent,
        isPositive: gainLoss >= 0,
        formattedGainLoss: formatCurrency(Math.abs(gainLoss)),
        formattedCurrentValue: formatCurrency(currentValue),
        formattedInvested: formatCurrency(invested),
        status: isMatured ? "matured" : "active",
        daysToMaturity,
      };
    }
    default: {
      const neverType: never = asset as never;
      return {
        ...(neverType as unknown as PortfolioAsset),
        currentValue: 0,
        formattedCurrentValue: formatCurrency(0),
      } as AssetWithMetrics;
    }
  }
}

export async function calculateAssetsSummary(
  userId: string
): Promise<AssetsSummary> {
  const assets = await getUserAssets(userId);
  const withMetrics = assets.map((a) => computeAssetMetrics(a));
  const totalCurrentValue = withMetrics.reduce(
    (sum, a) => sum + (a.currentValue || 0),
    0
  );
  const totalInvested = withMetrics.reduce(
    (sum, a) => sum + (a.invested || 0),
    0
  );
  const totalGainLoss = totalCurrentValue - totalInvested;
  const byMap = new Map<string, number>();
  withMetrics.forEach((a) => {
    byMap.set(a.type, (byMap.get(a.type) || 0) + (a.currentValue || 0));
  });
  const byType = Array.from(byMap.entries()).map(([type, value]) => ({
    type: type as AssetType,
    value,
    percentage: totalCurrentValue > 0 ? (value / totalCurrentValue) * 100 : 0,
  }));

  // Calculate by category
  const categoryMap = new Map<string, number>();
  withMetrics.forEach((a) => {
    let category = "Other";
    if (a.type === "fixed-asset" && a.category) {
      category = a.category;
    } else if (a.type === "mutual-fund" && a.category) {
      category = a.category;
    } else {
      category = a.type;
    }
    categoryMap.set(
      category,
      (categoryMap.get(category) || 0) + (a.currentValue || 0)
    );
  });

  const byCategory = Array.from(categoryMap.entries()).map(
    ([category, value]) => ({
      category,
      value,
      percentage: totalCurrentValue > 0 ? (value / totalCurrentValue) * 100 : 0,
    })
  );

  // Find matured assets
  const maturedAssets = withMetrics.filter((a) => a.status === "matured");

  return {
    totalCurrentValue,
    totalInvested,
    totalGainLoss,
    totalGainLossPercent:
      totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0,
    items: withMetrics,
    byType,
    byCategory,
    maturedAssets,
    lastUpdated: new Date().toISOString(),
  };
}
