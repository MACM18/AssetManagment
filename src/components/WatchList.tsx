"use client";

import { useState, useEffect } from "react";
import { StockQuote } from "@/types";
import {
  Star,
  TrendingUp,
  TrendingDown,
  Search,
  X,
  AlertCircle,
  Heart,
} from "lucide-react";
import { CSE_SYMBOLS } from "@/lib/stockData";
import { getLastDataSource } from "@/lib/tradingData";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, FIREBASE_AVAILABLE } from "@/lib/firebase";

interface WatchListProps {
  stocks: StockQuote[];
  onSelectStock: (symbol: string) => void;
  selectedSymbol?: string;
}

export default function WatchList({
  stocks,
  onSelectStock,
  selectedSymbol,
}: WatchListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [shareTypeFilter, setShareTypeFilter] = useState<
    "all" | "N" | "X" | "P" | "Z" | "V"
  >("all");
  const { isAuthenticated, user } = useAuth();

  const dataSource = getLastDataSource();
  console.debug(
    "WatchList: dataSource=",
    dataSource,
    "stocks.length=",
    stocks.length,
    "isAuthenticated=",
    isAuthenticated
  );
  const isMockData = dataSource === "mock" || stocks.length === 0;

  // Load user's watchlist from Firestore
  useEffect(() => {
    if (isAuthenticated && user && FIREBASE_AVAILABLE) {
      loadUserWatchlist();
    } else {
      // For non-authenticated users, show empty watchlist
      setWatchlist([]);
    }
  }, [isAuthenticated, user]);

  const loadUserWatchlist = async () => {
    if (!user || !FIREBASE_AVAILABLE) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setWatchlist(userData.watchlist || []);
      } else {
        // Initialize empty watchlist for new users
        setWatchlist([]);
      }
    } catch (error) {
      console.error("Error loading watchlist:", error);
      setWatchlist([]);
    }
  };

  const saveUserWatchlist = async (newWatchlist: string[]) => {
    if (!user || !FIREBASE_AVAILABLE) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        await updateDoc(userDocRef, { watchlist: newWatchlist });
      } else {
        await setDoc(userDocRef, {
          watchlist: newWatchlist,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Error saving watchlist:", error);
    }
  };

  const toggleWatchlist = async (symbol: string) => {
    if (!isAuthenticated) return;

    setLoading(true);
    const newWatchlist = watchlist.includes(symbol)
      ? watchlist.filter((s) => s !== symbol)
      : [...watchlist, symbol];

    setWatchlist(newWatchlist);
    await saveUserWatchlist(newWatchlist);
    setLoading(false);
  };

  // Show all stocks by default, but highlight watchlist items for authenticated users
  const filteredStocks = stocks
    .filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (stock.companyName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
    .filter((stock) => {
      if (shareTypeFilter === "all") return true;
      return (stock.shareType ?? "N") === shareTypeFilter;
    });

  return (
    <div className='bg-card rounded-xl p-4 sm:p-6 border border-border shadow-md'>
      <div className='flex justify-between items-center mb-4'>
        <div className='flex items-center gap-2'>
          <h2 className='text-lg sm:text-xl font-bold text-foreground'>
            Market Overview
          </h2>
          {isAuthenticated && (
            <div className='flex items-center gap-1 text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium'>
              <Heart className='w-3 h-3 fill-current' />
              Watchlist
            </div>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-xs sm:text-sm text-muted-foreground'>
            {filteredStocks.length} stocks
          </span>
          {isMockData && (
            <div className='text-xs px-2 py-1 bg-warning/10 text-warning rounded-full font-medium border border-warning/20'>
              Demo
            </div>
          )}
        </div>
      </div>

      <div className='relative mb-4'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground' />
        <input
          type='text'
          placeholder='Search stocks...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full pl-9 sm:pl-10 pr-10 py-2 sm:py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm sm:text-base text-foreground placeholder:text-muted-foreground'
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
          >
            <X className='w-4 h-4 sm:w-5 sm:h-5' />
          </button>
        )}
      </div>

      {/* Share Type Filter */}
      <div className='mb-4'>
        <div className='flex flex-wrap gap-2'>
          {[
            { value: "all", label: "All Shares", count: stocks.length },
            {
              value: "N",
              label: "Normal (N)",
              count: stocks.filter((s) => (s.shareType ?? "N") === "N").length,
            },
            {
              value: "X",
              label: "Exclusive (X)",
              count: stocks.filter((s) => (s.shareType ?? "N") === "X").length,
            },
            {
              value: "P",
              label: "Preferred (P)",
              count: stocks.filter((s) => (s.shareType ?? "N") === "P").length,
            },
            {
              value: "Z",
              label: "Zero Board (Z)",
              count: stocks.filter((s) => (s.shareType ?? "N") === "Z").length,
            },
            {
              value: "V",
              label: "Voting (V)",
              count: stocks.filter((s) => (s.shareType ?? "N") === "V").length,
            },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() =>
                setShareTypeFilter(
                  filter.value as "all" | "N" | "X" | "P" | "Z" | "V"
                )
              }
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
                shareTypeFilter === filter.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {filter.label}
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs ${
                  shareTypeFilter === filter.value
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted-foreground/20 text-muted-foreground"
                }`}
              >
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className='space-y-2 max-h-[500px] sm:max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent'>
        {filteredStocks.length === 0 ? (
          <div className='text-center py-12'>
            <AlertCircle className='w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3' />
            <p className='text-foreground font-medium'>No stocks found</p>
            <p className='text-sm text-muted-foreground mt-1'>
              Try adjusting your search terms
            </p>
          </div>
        ) : (
          filteredStocks.map((stock) => {
            const isPositive = (stock.changePercent || 0) >= 0;
            const isSelected = stock.symbol === selectedSymbol;
            const isInWatchlist = watchlist.includes(stock.symbol);
            const st = stock.shareType ?? "N";

            return (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer animate-slide-up ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md"
                    : isInWatchlist && isAuthenticated
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-card hover:bg-muted/50 hover:border-muted"
                }`}
              >
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      {isAuthenticated && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(stock.symbol);
                          }}
                          disabled={loading}
                          className={`transition-colors ${
                            isInWatchlist
                              ? "text-primary hover:text-primary/80"
                              : "text-muted-foreground hover:text-primary"
                          }`}
                          aria-label={`${isInWatchlist ? "Remove" : "Add"} ${
                            stock.symbol
                          } to watchlist`}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isInWatchlist ? "fill-current" : ""
                            }`}
                          />
                        </button>
                      )}
                      <h3 className='font-bold text-foreground text-sm sm:text-base'>
                        {stock.symbol}
                      </h3>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          st === "N"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : st === "X"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                            : st === "P"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            : st === "Z"
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                            : st === "V"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        }`}
                      >
                        {st}
                      </span>
                      {isSelected && (
                        <span className='text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full font-medium'>
                          Active
                        </span>
                      )}
                      {isInWatchlist && isAuthenticated && !isSelected && (
                        <span className='text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full font-medium'>
                          Watchlist
                        </span>
                      )}
                    </div>
                    <p className='text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]'>
                      {stock.companyName}
                    </p>
                  </div>

                  <div className='text-right'>
                    <p className='text-base sm:text-lg font-bold text-foreground'>
                      Rs.{" "}
                      {typeof stock.price === "number"
                        ? stock.price.toFixed(2)
                        : "N/A"}
                    </p>
                    <div
                      className={`flex items-center justify-end text-xs sm:text-sm font-semibold mt-1 ${
                        isPositive ? "text-success" : "text-destructive"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                      ) : (
                        <TrendingDown className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                      )}
                      <span>
                        {isPositive ? "+" : ""}
                        {stock.changePercent?.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className='mt-3 pt-3 border-t border-border grid grid-cols-4 gap-2 text-xs'>
                  <div>
                    <p className='text-muted-foreground mb-1'>Open</p>
                    <p className='font-semibold text-foreground'>
                      {stock.open?.toFixed(2) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className='text-muted-foreground mb-1'>High</p>
                    <p className='font-semibold text-success'>
                      {stock.high?.toFixed(2) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className='text-muted-foreground mb-1'>Low</p>
                    <p className='font-semibold text-destructive'>
                      {stock.low?.toFixed(2) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className='text-muted-foreground mb-1'>Volume</p>
                    <p className='font-semibold text-foreground'>
                      {((stock.volume || 0) / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!isAuthenticated && (
        <div className='mt-4 pt-4 border-t border-border'>
          <div className='text-center py-4'>
            <Heart className='w-8 h-8 text-muted-foreground mx-auto mb-2' />
            <p className='text-sm font-medium text-foreground mb-1'>
              Create a Watchlist
            </p>
            <p className='text-xs text-muted-foreground'>
              Sign in to save your favorite stocks and get personalized alerts
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
