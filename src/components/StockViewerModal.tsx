"use client";

import { useStockModal } from "@/contexts/StockModalContext";
import StockDetailView from "@/components/StockDetailView";
import { X } from "lucide-react";

export default function StockViewerModal() {
  const { state, closeModal } = useStockModal();

  if (!state.open || !state.stock) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-auto bg-background border rounded-2xl shadow-2xl overflow-auto">
        <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b p-4 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">{state.stock.symbol}</h3>
            <p className="text-sm text-muted-foreground">{state.stock.companyName}</p>
          </div>
          <button onClick={closeModal} className="p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <StockDetailView stock={state.stock} holdings={state.holdings} />
        </div>
      </div>
    </div>
  );
}
