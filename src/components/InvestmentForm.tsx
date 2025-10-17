'use client';

import { useState } from 'react';
import { Investment } from '@/types';

interface InvestmentFormProps {
  onSubmit: (investment: Omit<Investment, 'id'>) => void;
}

export default function InvestmentForm({ onSubmit }: InvestmentFormProps) {
  const [formData, setFormData] = useState({
    type: 'stock' as Investment['type'],
    name: '',
    symbol: '',
    amount: '',
    quantity: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const investment: Omit<Investment, 'id'> = {
      type: formData.type,
      name: formData.name,
      symbol: formData.symbol || undefined,
      amount: parseFloat(formData.amount),
      quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
      purchaseDate: formData.purchaseDate,
      notes: formData.notes || undefined,
    };
    
    onSubmit(investment);
    
    // Reset form
    setFormData({
      type: 'stock',
      name: '',
      symbol: '',
      amount: '',
      quantity: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Investment Type
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as Investment['type'] })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
        >
          <option value="stock">Stock (CSE)</option>
          <option value="mutual-fund">Mutual Fund</option>
          <option value="fd">Fixed Deposit</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
          placeholder="e.g., John Keells Holdings"
        />
      </div>

      {formData.type === 'stock' && (
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">
            Symbol
          </label>
          <input
            type="text"
            id="symbol"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            placeholder="e.g., JKH.N0000"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount (Rs.) *
          </label>
          <input
            type="number"
            id="amount"
            required
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            placeholder="0.00"
          />
        </div>

        {(formData.type === 'stock' || formData.type === 'mutual-fund') && (
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              step="0.01"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              placeholder="0"
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">
          Purchase Date *
        </label>
        <input
          type="date"
          id="purchaseDate"
          required
          value={formData.purchaseDate}
          onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
          placeholder="Additional notes..."
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Add Investment
      </button>
    </form>
  );
}
