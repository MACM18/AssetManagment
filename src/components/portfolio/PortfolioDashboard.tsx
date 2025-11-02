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
import {
  Plus,
  RefreshCw,
  LayoutDashboard,
  TrendingUp,
  Wallet,
  History,
  PieChart,
  Menu,
  X,
} from "lucide-react";

type TabView =
  | "overview"
  | "holdings"
  | "assets"
  | "analytics"
  | "transactions";

export default function PortfolioDashboard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { refreshPortfolio } = usePortfolio();
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabView>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const tabs = [
    { id: "overview" as TabView, label: "Overview", icon: LayoutDashboard },
    { id: "holdings" as TabView, label: "Stock Holdings", icon: TrendingUp },
    { id: "assets" as TabView, label: "Other Assets", icon: Wallet },
    { id: "analytics" as TabView, label: "Analytics", icon: PieChart },
    { id: "transactions" as TabView, label: "Transactions", icon: History },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className='space-y-6'>
            <PortfolioSummaryCard />
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <TopHoldings />
              <PortfolioInsights />
            </div>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              <PortfolioAllocationChart />
              <NetWorthAllocationChart />
              <PerformanceChart />
            </div>
          </div>
        );
      case "holdings":
        return (
          <div className='space-y-6'>
            <HoldingsList currentPrices={stocks} stocks={stocks} />
          </div>
        );
      case "assets":
        return (
          <div className='space-y-6'>
            <AssetsList />
          </div>
        );
      case "analytics":
        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              <PortfolioAllocationChart />
              <NetWorthAllocationChart />
              <PerformanceChart />
            </div>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <PortfolioInsights />
              <TopHoldings />
            </div>
          </div>
        );
      case "transactions":
        return (
          <div className='space-y-6'>
            <TransactionHistory />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      <div className='flex'>
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className='lg:hidden fixed bottom-6 right-6 z-40 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:opacity-90 transition-all'
          aria-label='Toggle sidebar'
        >
          {sidebarOpen ? (
            <X className='w-6 h-6' />
          ) : (
            <Menu className='w-6 h-6' />
          )}
        </button>

        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div
            className='lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30'
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 h-screen bg-card border-r border-border z-40
            transition-transform duration-300 ease-in-out
            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
            w-64 flex flex-col
          `}
        >
          {/* Sidebar Header */}
          <div className='p-6 border-b border-border'>
            <h2 className='text-xl font-bold text-foreground'>Portfolio</h2>
            <p className='text-xs text-muted-foreground mt-1'>
              Manage your investments
            </p>
          </div>

          {/* Navigation Tabs */}
          <nav className='flex-1 p-4 space-y-2 overflow-y-auto'>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }
                  `}
                >
                  <Icon className='w-5 h-5' />
                  <span className='font-medium'>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className='p-4 border-t border-border space-y-2'>
            <button
              onClick={() => setShowAddModal(true)}
              className='w-full flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground hover:opacity-90 rounded-lg transition-all shadow-md'
            >
              <Plus className='w-5 h-5' />
              <span className='font-medium'>Add Holding</span>
            </button>
            <button
              onClick={() => setShowAddAssetModal(true)}
              className='w-full flex items-center gap-3 px-4 py-3 bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground border border-border rounded-lg transition-all'
            >
              <Plus className='w-5 h-5' />
              <span className='font-medium'>Add Asset</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className='flex-1 min-h-screen'>
          {/* Header */}
          <div className='sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border'>
            <div className='px-6 py-4 flex justify-between items-center'>
              <div>
                <h1 className='text-2xl font-bold text-foreground'>
                  {tabs.find((t) => t.id === activeTab)?.label}
                </h1>
                <p className='text-sm text-muted-foreground mt-1'>
                  {activeTab === "overview" && "Your portfolio at a glance"}
                  {activeTab === "holdings" && "Manage your stock investments"}
                  {activeTab === "assets" && "Track other assets and deposits"}
                  {activeTab === "analytics" &&
                    "Deep dive into performance metrics"}
                  {activeTab === "transactions" &&
                    "View your transaction history"}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className='flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md'
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span className='hidden sm:inline'>Refresh</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className='p-6'>{renderContent()}</div>
        </main>
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
