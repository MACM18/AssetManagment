"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  PortfolioHolding,
  Transaction,
  PortfolioSummary,
  StockQuote,
  PortfolioAsset,
  AssetsSummary,
} from "@/types";
import {
  getUserHoldings,
  getUserTransactions,
  getUserAssets,
  calculatePortfolioSummary,
  calculateAssetsSummary,
  updateAsset as libUpdateAsset,
  updateHolding as libUpdateHolding,
  deleteAsset as libDeleteAsset,
  deleteHolding as libDeleteHolding,
} from "@/lib/portfolio";

interface PortfolioContextType {
  holdings: PortfolioHolding[];
  transactions: Transaction[];
  summary: PortfolioSummary | null;
  assets: PortfolioAsset[];
  assetsSummary: AssetsSummary | null;
  loading: boolean;
  refreshPortfolio: (currentPrices?: StockQuote[]) => Promise<void>;
  updateAsset: (
    assetId: string,
    updates: Partial<Omit<PortfolioAsset, "id" | "userId" | "createdAt">>
  ) => Promise<void>;
  updateHolding: (
    holdingId: string,
    updates: Partial<Omit<PortfolioHolding, "id" | "userId" | "createdAt">>
  ) => Promise<void>;
  deleteAsset: (assetId: string) => Promise<void>;
  deleteHolding: (holdingId: string) => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType>({
  holdings: [],
  transactions: [],
  summary: null,
  assets: [],
  assetsSummary: null,
  loading: true,
  refreshPortfolio: async () => {},
  updateAsset: async () => {},
  updateHolding: async () => {},
  deleteAsset: async () => {},
  deleteHolding: async () => {},
});

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [assetsSummary, setAssetsSummary] = useState<AssetsSummary | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const refreshPortfolio = async (currentPrices: StockQuote[] = []) => {
    if (!isAuthenticated || !user) {
      setHoldings([]);
      setTransactions([]);
      setSummary(null);
      setAssets([]);
      setAssetsSummary(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [holdingsData, transactionsData, assetsData] = await Promise.all([
        getUserHoldings(user.uid),
        getUserTransactions(user.uid),
        getUserAssets(user.uid),
      ]);

      setHoldings(holdingsData);
      setTransactions(transactionsData);
      setAssets(assetsData);

      // Calculate summary if we have current prices
      if (currentPrices.length > 0) {
        const summaryData = await calculatePortfolioSummary(
          user.uid,
          currentPrices
        );
        setSummary(summaryData);
      }

      try {
        const aSummary = await calculateAssetsSummary(user.uid);
        setAssetsSummary(aSummary);
      } catch (e) {
        console.warn("Failed calculating assets summary", e);
      }
    } catch (error) {
      console.error("Error loading portfolio:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAsset = async (
    assetId: string,
    updates: Partial<Omit<PortfolioAsset, "id" | "userId" | "createdAt">>
  ) => {
    if (!isAuthenticated || !user) return;
    try {
      await libUpdateAsset(user.uid, assetId, updates);
      await refreshPortfolio();
    } catch (e) {
      console.error("Failed to update asset", e);
      throw e;
    }
  };

  const updateHolding = async (
    holdingId: string,
    updates: Partial<Omit<PortfolioHolding, "id" | "userId" | "createdAt">>
  ) => {
    if (!isAuthenticated || !user) return;
    try {
      await libUpdateHolding(user.uid, holdingId, updates);
      await refreshPortfolio();
    } catch (e) {
      console.error("Failed to update holding", e);
      throw e;
    }
  };

  const deleteAsset = async (assetId: string) => {
    if (!isAuthenticated || !user) return;
    try {
      await libDeleteAsset(user.uid, assetId);
      await refreshPortfolio();
    } catch (e) {
      console.error("Failed to delete asset", e);
      throw e;
    }
  };

  const deleteHolding = async (holdingId: string) => {
    if (!isAuthenticated || !user) return;
    try {
      await libDeleteHolding(user.uid, holdingId);
      await refreshPortfolio();
    } catch (e) {
      console.error("Failed to delete holding", e);
      throw e;
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshPortfolio();
    } else {
      setHoldings([]);
      setTransactions([]);
      setSummary(null);
      setAssets([]);
      setAssetsSummary(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated]);

  return (
    <PortfolioContext.Provider
      value={{
        holdings,
        transactions,
        summary,
        assets,
        assetsSummary,
        loading,
        refreshPortfolio,
        updateAsset,
        updateHolding,
        deleteAsset,
        deleteHolding,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}
