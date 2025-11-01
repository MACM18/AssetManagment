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

  type HoldingWrite = Omit<PortfolioHolding, "id" | "createdAt" | "updatedAt"> & {
    createdAt: unknown;
    updatedAt: unknown;
  };
  const holdingPayload: HoldingWrite = {
    ...holding,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

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

  batch.set(newHoldingRef, holdingPayload);
  batch.set(newTransactionRef, transactionPayload);

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
  await updateDoc(holdingRef, {
    ...updates,
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
  const docRef = await addDoc(transactionsRef, {
    ...transaction,
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
      };
    }
  );

  const totalGainLoss = currentValue - totalInvested;
  const totalGainLossPercent =
    totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  return {
    totalInvested,
    currentValue,
    totalGainLoss,
    totalGainLossPercent,
    holdings: holdingsWithMetrics,
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
