export interface Investment {
  id: string;
  type: "stock" | "mutual-fund" | "fd" | "other";
  name: string;
  symbol?: string;
  amount: number;
  quantity?: number;
  purchaseDate: string;
  currentValue?: number;
  notes?: string;
}

export interface StockData {
  symbol: string;
  companyName: string;
  date: string;
  price: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
  change?: number;
  changePercent?: number;
  shareType?: "N" | "X" | "P" | "Z"; // N=Normal, X=Exclusive, P=Preferred, Z=Zero Board Lot
}
export type ShareTypeCode = "N" | "X" | "P" | "Z";

export interface CSEStockData {
  symbol: string;
  rawSymbol?: string;
  companyName: string;
  date: string;
  price: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
  shareType?: "N" | "X" | "P" | "Z"; // N=Normal, X=Exclusive, P=Preferred, Z=Zero Board Lot
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalInvestments: number;
  totalValue: number;
  stocksData: StockData[];
  createdAt: string;
}

// Trading Platform Types
export interface MarketSummary {
  totalVolume: number;
  totalTrades: number;
  advancers: number;
  decliners: number;
  unchanged: number;
  marketCap?: number;
}

export interface StockQuote extends CSEStockData {
  id?: string;
  timestamp?: string;
  prevClose?: number;
}

export interface ChartDataPoint {
  date: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface WatchlistItem {
  symbol: string;
  companyName: string;
  addedAt: string;
}

export type TimeFrame = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";
export type ChartType = "line" | "candlestick" | "area";

// Firestore document structure for stock_prices_by_date collection
export interface FirestoreStockPricesByDate {
  date: string;
  count: number;
  stocks: FirestoreStockData[];
  updatedAt: FirebaseTimestamp | string;
}

export interface FirestoreStockData {
  symbol: string;
  normalizedSymbol?: string;
  companyName: string;
  date: string;
  price: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  change: number | null;
  changePercent: number | null;
  volume: number | null;
  shareType?: "N" | "X" | "P" | "Z";
}

// UI selection key for a stock variant (symbol + shareType)
export interface SelectedStockKey {
  symbol: string;
  shareType?: ShareTypeCode; // defaults to 'N' in UI if missing
}

// Firebase Timestamp type (can be Firestore Timestamp or ISO string)
export interface FirebaseTimestamp {
  toDate?: () => Date;
  seconds?: number;
  nanoseconds?: number;
}

// User Profile Types
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  lastLogin: string;
  isAnonymous: boolean;
}

// Portfolio Types
export interface PortfolioHolding {
  id: string;
  userId: string;
  symbol: string;
  companyName: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  symbol: string;
  companyName: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  totalAmount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  holdings: PortfolioHoldingWithMetrics[];
}

export interface PortfolioHoldingWithMetrics extends PortfolioHolding {
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  invested: number;
}

export interface PortfolioPerformance {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  allTime: number;
}

export interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
  holdings: number;
}
