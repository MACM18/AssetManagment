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
}

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
