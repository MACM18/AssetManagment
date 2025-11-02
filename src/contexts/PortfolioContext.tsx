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
} from "@/lib/portfolio";

interface PortfolioContextType {
  holdings: PortfolioHolding[];
  transactions: Transaction[];
  summary: PortfolioSummary | null;
  assets: PortfolioAsset[];
  assetsSummary: AssetsSummary | null;
  loading: boolean;
  refreshPortfolio: (currentPrices?: StockQuote[]) => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType>({
  holdings: [],
  transactions: [],
  summary: null,
  assets: [],
  assetsSummary: null,
  loading: true,
  refreshPortfolio: async () => {},
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
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}
