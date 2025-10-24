"use client";

import { useState } from "react";
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

    const quantityNum = parseFloat(quantity);
    const priceNum = parseFloat(purchasePrice);

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
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to add holding. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
        <div className='sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center'>
          <h2 className='text-2xl font-bold text-gray-900'>
            Add Stock Holding
          </h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          {error && (
            <div className='p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm'>
              {error}
            </div>
          )}

          {/* Stock Selection */}
          <div>
            <label
              htmlFor='symbol'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Stock Symbol *
            </label>
            <select
              id='symbol'
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
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
              className='block text-sm font-medium text-gray-700 mb-1'
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
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='100'
            />
          </div>

          {/* Purchase Price */}
          <div>
            <label
              htmlFor='purchasePrice'
              className='block text-sm font-medium text-gray-700 mb-1'
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
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='1250.00'
            />
            {selectedStock && (
              <p className='mt-1 text-sm text-gray-500'>
                Current price: LKR {selectedStock.price.toFixed(2)}
              </p>
            )}
          </div>

          {/* Purchase Date */}
          <div>
            <label
              htmlFor='purchaseDate'
              className='block text-sm font-medium text-gray-700 mb-1'
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
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor='notes'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Notes (Optional)
            </label>
            <textarea
              id='notes'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Add any notes about this investment...'
            />
          </div>

          {/* Investment Summary */}
          {quantity && purchasePrice && (
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <p className='text-sm font-medium text-gray-700 mb-2'>
                Investment Summary
              </p>
              <div className='space-y-1 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Total Shares:</span>
                  <span className='font-medium'>{quantity}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Price per Share:</span>
                  <span className='font-medium'>
                    LKR {parseFloat(purchasePrice).toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between border-t border-blue-300 pt-1 mt-1'>
                  <span className='font-medium text-gray-700'>
                    Total Investment:
                  </span>
                  <span className='font-bold text-blue-700'>
                    LKR{" "}
                    {(parseFloat(quantity) * parseFloat(purchasePrice)).toFixed(
                      2
                    )}
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
              className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
            >
              {loading ? "Adding..." : "Add Holding"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
