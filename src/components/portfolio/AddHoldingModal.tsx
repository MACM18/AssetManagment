"use client";

import { useState } from "react";
import type { FirebaseError } from "firebase/app";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { addHolding } from "@/lib/portfolio";
import { StockQuote } from "@/types";
import { X } from "lucide-react";

interface AddHoldingModalProps {
  stocks: StockQuote[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddHoldingModal({
  stocks,
  onClose,
  onSuccess,
}: AddHoldingModalProps) {
  const { user } = useAuth();
  const { refreshPortfolio } = usePortfolio();

  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedStock = stocks.find((s) => s.symbol === symbol);

  const sanitizeNumber = (val: string) =>
    Number(String(val).replace(/,/g, "").trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("You must be logged in to add holdings");
      return;
    }

    if (!symbol || !quantity || !purchasePrice) {
      setError("Please fill in all required fields");
      return;
    }

    // Ensure the symbol exists in provided stock list
    if (!stocks.some((s) => s.symbol === symbol)) {
      setError("Please select a valid stock symbol from the list");
      return;
    }

    const quantityNum = sanitizeNumber(quantity);
    const priceNum = sanitizeNumber(purchasePrice);

    if (!Number.isFinite(quantityNum) || !Number.isFinite(priceNum)) {
      setError("Quantity and price must be valid numbers");
      return;
    }

    if (quantityNum <= 0 || priceNum <= 0) {
      setError("Quantity and price must be positive numbers");
      return;
    }

    setLoading(true);

    try {
      await addHolding(user.uid, {
        symbol,
        companyName: selectedStock?.companyName || symbol,
        quantity: quantityNum,
        purchasePrice: priceNum,
        purchaseDate,
        notes: notes.trim() || undefined,
      });

      await refreshPortfolio(stocks);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const code = (err as FirebaseError)?.code;
      if (code === "permission-denied") {
        setError(
          "Permission denied when writing to your portfolio. Please ensure your account has access."
        );
      } else if (code === "unavailable") {
        setError(
          "Service temporarily unavailable. Please check your connection and try again."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to add holding. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className='fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto'
      role='dialog'
      aria-modal='true'
      aria-labelledby='add-holding-title'
    >
      <div className='relative w-full max-w-lg mx-auto my-8 rounded-2xl shadow-2xl border backdrop-blur-lg'>
        <div className='sticky top-0 backdrop-blur-lg border-b px-6 py-4 flex justify-between items-center rounded-t-2xl'>
          <h2 id='add-holding-title' className='text-2xl font-bold'>
            Add Stock Holding
          </h2>
          <button onClick={onClose} className='transition-colors'>
            <X className='w-6 h-6' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          {error && (
            <div className='p-3 border rounded-lg text-sm'>{error}</div>
          )}

          {/* Stock Selection */}
          <div>
            <label htmlFor='symbol' className='block text-sm font-medium mb-1'>
              Stock Symbol *
            </label>
            <select
              id='symbol'
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              required
              className='w-full px-3 py-2 border rounded-lg focus:outline-none'
            >
              <option value=''>Select a stock</option>
              {stocks.map((stock) => (
                <option key={stock.symbol} value={stock.symbol}>
                  {stock.symbol} - {stock.companyName}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label
              htmlFor='quantity'
              className='block text-sm font-medium mb-1'
            >
              Quantity (Shares) *
            </label>
            <input
              id='quantity'
              type='number'
              step='1'
              min='1'
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              inputMode='numeric'
              className='w-full px-3 py-2 border rounded-lg focus:outline-none'
              placeholder='100'
            />
          </div>

          {/* Purchase Price */}
          <div>
            <label
              htmlFor='purchasePrice'
              className='block text-sm font-medium mb-1'
            >
              Purchase Price (LKR per share) *
            </label>
            <input
              id='purchasePrice'
              type='number'
              step='0.01'
              min='0.01'
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              required
              inputMode='decimal'
              className='w-full px-3 py-2 border rounded-lg focus:outline-none'
              placeholder='1250.00'
            />
            {selectedStock && (
              <p className='mt-1 text-sm'>
                Current price: LKR {selectedStock.price.toFixed(2)}
              </p>
            )}
          </div>

          {/* Purchase Date */}
          <div>
            <label
              htmlFor='purchaseDate'
              className='block text-sm font-medium mb-1'
            >
              Purchase Date *
            </label>
            <input
              id='purchaseDate'
              type='date'
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
              max={new Date().toISOString().split("T")[0]}
              className='w-full px-3 py-2 border rounded-lg focus:outline-none'
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor='notes' className='block text-sm font-medium mb-1'>
              Notes (Optional)
            </label>
            <textarea
              id='notes'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className='w-full px-3 py-2 border rounded-lg focus:outline-none'
              placeholder='Add any notes about this investment...'
            />
          </div>

          {/* Investment Summary */}
          {quantity && purchasePrice && (
            <div className='border rounded-lg p-4'>
              <p className='text-sm font-medium mb-2'>Investment Summary</p>
              <div className='space-y-1 text-sm'>
                <div className='flex justify-between'>
                  <span>Total Shares:</span>
                  <span className='font-medium'>{quantity}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Price per Share:</span>
                  <span className='font-medium'>
                    LKR {sanitizeNumber(purchasePrice).toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between border-t pt-1 mt-1'>
                  <span className='font-medium'>Total Investment:</span>
                  <span className='font-bold'>
                    LKR{" "}
                    {(
                      sanitizeNumber(quantity) * sanitizeNumber(purchasePrice)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className='flex gap-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-4 py-2 border rounded-lg font-medium'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2'
            >
              {loading && (
                <span className='inline-block h-4 w-4 border-2 border-t-transparent rounded-full animate-spin' />
              )}
              {loading ? "Adding..." : "Add Holding"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
