"use client";

import React, { createContext, useContext, useState } from "react";
import { StockQuote, PortfolioHoldingWithMetrics, Transaction } from "@/types";

type StockModalState = {
  open: boolean;
  stock?: StockQuote | null;
  holdings?: PortfolioHoldingWithMetrics[];
  transactions?: Transaction[];
};

type StockModalContextType = {
  state: StockModalState;
  openModal: (payload: StockModalState) => void;
  closeModal: () => void;
};

const StockModalContext = createContext<StockModalContextType | undefined>(
  undefined
);

export function StockModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StockModalState>({ open: false });

  const openModal = (payload: StockModalState) => {
    // Ensure `open` from payload doesn't conflict with the explicit true flag
    const { open: _open, ...rest } = payload as StockModalState;
    setState({ open: true, ...rest });
  };

  const closeModal = () => setState({ open: false });

  return (
    <StockModalContext.Provider value={{ state, openModal, closeModal }}>
      {children}
    </StockModalContext.Provider>
  );
}

export function useStockModal() {
  const ctx = useContext(StockModalContext);
  if (!ctx) throw new Error("useStockModal must be used within StockModalProvider");
  return ctx;
}
