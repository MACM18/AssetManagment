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

// ===== Extended Portfolio Assets (Non-stock) =====

export type AssetType =
  | "fixed-asset" // Land/Gold/Property/Vehicle etc.
  | "fixed-deposit"
  | "savings"
  | "mutual-fund"
  | "treasury-bond";

export interface BaseAsset {
  id: string;
  userId: string;
  type: AssetType;
  name: string; // Display name e.g., "Land - Kandy", "FD - HNB", "NDB Savings", "ABC Equity Fund"
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Fixed Asset (Land/Gold/Property/Vehicle)
export interface FixedAsset extends BaseAsset {
  type: "fixed-asset";
  category: "land" | "gold" | "property" | "vehicle" | "other";
  purchaseDate: string;
  purchasePrice: number; // LKR
  currentValue?: number; // Manual appraisal value in LKR
  appraisalDate?: string; // When currentValue was last appraised
  locationOrDetails?: string; // address / description
}

// Fixed Deposit
export interface FixedDeposit extends BaseAsset {
  type: "fixed-deposit";
  bank: string;
  principal: number; // LKR
  interestRate: number; // annual % e.g., 12.5 means 12.5%
  compounding: "simple" | "monthly" | "quarterly" | "annually";
  startDate: string;
  maturityDate: string;
  autoRenewal?: boolean;
}

// Savings Account
export interface SavingsAccount extends BaseAsset {
  type: "savings";
  bank: string;
  balance: number; // current balance in LKR (manually updated)
  interestRate?: number; // annual % (optional informational)
  lastUpdated?: string;
}

// Mutual Fund (units * NAV)
export interface MutualFund extends BaseAsset {
  type: "mutual-fund";
  fundCode?: string; // optional code/ISIN
  units: number;
  buyNav?: number; // NAV at purchase (optional)
  lastNav?: number; // latest known NAV (manual for now)
  lastNavDate?: string;
}

// Treasury Bond (simplified)
export interface TreasuryBond extends BaseAsset {
  type: "treasury-bond";
  issueCode?: string;
  faceValue: number; // per unit face value (LKR)
  units: number; // number of units (face value lots)
  couponRate?: number; // annual %
  couponFrequency?: "annual" | "semi-annual" | "quarterly";
  purchasePrice?: number; // price per unit at purchase (LKR)
  purchaseDate?: string;
  maturityDate?: string;
  currentMarketPrice?: number; // price per unit (if known)
}

export type PortfolioAsset =
  | FixedAsset
  | FixedDeposit
  | SavingsAccount
  | MutualFund
  | TreasuryBond;

export type AssetWithMetrics = PortfolioAsset & {
  invested?: number; // principal/purchase total
  currentValue: number; // computed or stored
  gainLoss?: number;
  gainLossPercent?: number;
};

export interface AssetsSummary {
  totalCurrentValue: number;
  totalInvested: number;
  totalGainLoss: number;
  items: AssetWithMetrics[];
  byType: { type: AssetType; value: number }[];
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
