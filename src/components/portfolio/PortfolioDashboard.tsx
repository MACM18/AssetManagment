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
import PortfolioAllocationChart from "@/components/portfolio/PortfolioAllocationChart";
import PerformanceChart from "@/components/portfolio/PerformanceChart";
import PortfolioInsights from "@/components/portfolio/PortfolioInsights";
import TopHoldings from "@/components/portfolio/TopHoldings";
import { Plus, RefreshCw } from "lucide-react";

export default function PortfolioDashboard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { refreshPortfolio } = usePortfolio();
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

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
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border'></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <div className='rounded-lg shadow-lg p-8 max-w-md w-full text-center border'>
          <h1 className='text-2xl font-bold mb-4'>
            Portfolio Dashboard
          </h1>
          <p className='mb-6'>
            Sign in to access your portfolio and track your CSE stock
            investments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8 flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold'>
              My Portfolio
            </h1>
            <p className='mt-1'>
              Track your CSE stock investments and performance
            </p>
          </div>

          <div className='flex gap-3'>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className='flex items-center gap-2 px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm'
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className='hidden sm:inline'>Refresh</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className='flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors shadow-lg'
            >
              <Plus className='w-4 h-4' />
              <span>Add Holding</span>
            </button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className='mb-8'>
          <PortfolioSummaryCard />
        </div>

        {/* Analytics Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          <PortfolioAllocationChart />
          <PerformanceChart />
        </div>

        {/* Insights and Top Holdings */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          <PortfolioInsights />
          <TopHoldings />
        </div>

        {/* Holdings and Transactions */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Holdings List */}
          <div className='lg:col-span-2'>
            <HoldingsList currentPrices={stocks} />
          </div>

          {/* Transaction History */}
          <div className='lg:col-span-1'>
            <TransactionHistory />
          </div>
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
    </div>
  );
}
