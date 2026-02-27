"use client";

import { useState, useMemo } from "react";
import { StockQuote } from "@/types";
import { useStockModal } from "@/contexts/StockModalContext";

interface StockSearchProps {
  stocks: StockQuote[];
}

export default function StockSearch({ stocks }: StockSearchProps) {
  const [query, setQuery] = useState("");
  const { openModal } = useStockModal();

  const filtered = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return stocks.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.companyName.toLowerCase().includes(q)
    );
  }, [query, stocks]);

  const handleSelect = (symbol: string) => {
    setQuery("");
    const s = stocks.find((x) => x.symbol === symbol);
    if (s) openModal({ open: true, stock: s });
  };

  return (
    <div className="relative w-full max-w-sm">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search stocks..."
        className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {filtered.length > 0 && (
        <ul className="absolute z-20 w-full mt-1 bg-card border border-border rounded-lg max-h-60 overflow-y-auto">
          {filtered.map((s) => (
            <li
              key={s.symbol}
              onClick={() => handleSelect(s.symbol)}
              className="cursor-pointer px-4 py-2 hover:bg-secondary/10 transition-colors"
            >
              <span className="font-bold">{s.symbol}</span> - {s.companyName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
