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
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4'>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4'>
            Portfolio Dashboard
          </h1>
          <p className='text-gray-600 dark:text-gray-300 mb-6'>
            Sign in to access your portfolio and track your CSE stock
            investments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-6 flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>My Portfolio</h1>
            <p className='text-gray-600 dark:text-gray-400 mt-1'>
              Track your CSE stock investments and performance
            </p>
          </div>

          <div className='flex gap-3'>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className='flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className='hidden sm:inline'>Refresh</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg'
            >
              <Plus className='w-4 h-4' />
              <span>Add Holding</span>
            </button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className='mb-6'>
          <PortfolioSummaryCard />
        </div>

        {/* Analytics Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          <PortfolioAllocationChart />
          <PerformanceChart />
        </div>

        {/* Insights and Top Holdings */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          <PortfolioInsights />
          <TopHoldings />
        </div>

        {/* Holdings and Transactions */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
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
