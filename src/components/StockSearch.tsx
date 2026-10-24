"use client";

import { useState, useMemo } from "react";
import { StockQuote } from "@/types";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface StockSearchProps { stocks: StockQuote[]; }

export default function StockSearch({ stocks }: StockSearchProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return stocks.filter((stock) =>
      stock.symbol.toLowerCase().includes(q) ||
      stock.companyName.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query, stocks]);

  const selectStock = (symbol: string) => {
    setQuery("");
    setActiveIndex(0);
    router.push("/stock?symbol=" + encodeURIComponent(symbol));
  };

  return (
    <div className="relative w-full max-w-sm">
      <label htmlFor="market-stock-search" className="sr-only">Search stocks by symbol or company</label>
      <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id="market-stock-search"
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-controls="market-stock-results"
        aria-expanded={query.trim().length > 0}
        aria-activedescendant={filtered[activeIndex] ? "stock-option-" + activeIndex : undefined}
        value={query}
        onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && filtered.length) {
            event.preventDefault();
            setActiveIndex((index) => (index + 1) % filtered.length);
          } else if (event.key === "ArrowUp" && filtered.length) {
            event.preventDefault();
            setActiveIndex((index) => (index - 1 + filtered.length) % filtered.length);
          } else if (event.key === "Enter" && filtered[activeIndex]) {
            event.preventDefault();
            selectStock(filtered[activeIndex].symbol);
          } else if (event.key === "Escape") {
            setQuery("");
            setActiveIndex(0);
          }
        }}
        placeholder="Search stocks..."
        className="min-h-11 w-full rounded-lg border border-input bg-card py-2 pl-9 pr-3 text-foreground placeholder:text-muted-foreground"
      />
      {query.trim() && (
        <ul id="market-stock-results" role="listbox" aria-label="Stock search results" className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-xl">
          {filtered.length ? filtered.map((stock, index) => (
            <li id={"stock-option-" + index} key={stock.symbol + "-" + (stock.shareType || "N")} role="option" aria-selected={index === activeIndex} onMouseEnter={() => setActiveIndex(index)} onClick={() => selectStock(stock.symbol)} className={"cursor-pointer rounded-lg px-3 py-2.5 text-sm " + (index === activeIndex ? "bg-primary/10 text-foreground" : "text-foreground hover:bg-muted")}>
              <span className="font-semibold">{stock.symbol}</span>
              <span className="ml-2 text-muted-foreground">{stock.companyName}</span>
            </li>
          )) : <li className="px-3 py-3 text-sm text-muted-foreground">No matching stocks</li>}
        </ul>
      )}
    </div>
  );
}
