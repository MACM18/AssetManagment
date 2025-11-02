"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { StockQuote } from "@/types";
import { fetchLatestStockPrices } from "@/lib/tradingData";
import PortfolioSummaryCard from "@/components/portfolio/PortfolioSummaryCard";
import HoldingsList from "@/components/portfolio/HoldingsList";
import TransactionHistory from "@/components/portfolio/TransactionHistory";
import AddHoldingModal from "@/components/portfolio/AddHoldingModal";
import AddAssetModal from "@/components/portfolio/assets/AddAssetModal";
import AssetsList from "@/components/portfolio/assets/AssetsList";
import PortfolioAllocationChart from "@/components/portfolio/PortfolioAllocationChart";
import PerformanceChart from "@/components/portfolio/PerformanceChart";
import PortfolioInsights from "@/components/portfolio/PortfolioInsights";
import TopHoldings from "@/components/portfolio/TopHoldings";
import NetWorthAllocationChart from "@/components/portfolio/NetWorthAllocationChart";
import Navigation from "@/components/Navigation";
import { Plus, RefreshCw } from "lucide-react";

export default function PortfolioDashboard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { refreshPortfolio } = usePortfolio();
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const stockData = await fetchLatestStockPrices();
      setStocks(stockData);

      if (isAuthenticated) {
        await refreshPortfolio(stockData);
      }
    } catch (error) {
      console.error("Error loading portfolio data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  const handleRefresh = async () => {
    await loadData();
  };

  const handleAddSuccess = async () => {
    await loadData();
  };

  if (authLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen flex items-center justify-center p-4 bg-background'>
        <div className='bg-card rounded-lg shadow-lg p-6 sm:p-8 max-w-md w-full text-center border border-border'>
          <h1 className='text-xl sm:text-2xl font-bold text-foreground mb-4'>
            Portfolio Dashboard
          </h1>
          <p className='text-muted-foreground mb-6'>
            Sign in to access your portfolio and track your CSE stock
            investments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background py-6 sm:py-8'>
      <Navigation />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-foreground'>
              My Portfolio
            </h1>
            <p className='text-sm sm:text-base text-muted-foreground mt-1'>
              Track your CSE stock investments and performance
            </p>
          </div>

          <div className='flex gap-2 sm:gap-3'>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className='flex items-center gap-2 px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md'
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className='hidden sm:inline'>Refresh</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className='flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 border border-primary rounded-lg transition-all shadow-md hover:shadow-lg'
            >
              <Plus className='w-4 h-4' />
              <span>Add Holding</span>
            </button>

            <button
              onClick={() => setShowAddAssetModal(true)}
              className='flex items-center gap-2 px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground border border-border rounded-lg transition-all shadow-sm hover:shadow-lg'
            >
              <Plus className='w-4 h-4' />
              <span>Add Asset</span>
            </button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className='mb-6 sm:mb-8'>
          <PortfolioSummaryCard />
        </div>

        {/* Analytics Section */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8'>
          <PortfolioAllocationChart />
          <NetWorthAllocationChart />
          <PerformanceChart />
        </div>

        {/* Insights and Top Holdings */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8'>
          <PortfolioInsights />
          <TopHoldings />
        </div>

        {/* Holdings and Transactions */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8'>
          {/* Holdings List */}
          <div className='lg:col-span-2'>
            <HoldingsList currentPrices={stocks} stocks={stocks} />
          </div>

          {/* Transaction History */}
          <div className='lg:col-span-1'>
            <TransactionHistory />
          </div>
        </div>

        {/* Other Assets */}
        <div className='mt-6 sm:mt-8'>
          <AssetsList />
        </div>
      </div>

      {/* Add Holding Modal */}
      {showAddModal && (
        <AddHoldingModal
          stocks={stocks}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {/* Add Asset Modal */}
      {showAddAssetModal && (
        <AddAssetModal
          onClose={() => setShowAddAssetModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
}
