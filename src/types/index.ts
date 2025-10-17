export interface Investment {
  id: string;
  type: 'stock' | 'mutual-fund' | 'fd' | 'other';
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
