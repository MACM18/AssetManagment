'use client';

import { useState, useEffect } from 'react';
import { Investment } from '@/types';
import InvestmentForm from '@/components/InvestmentForm';
import InvestmentList from '@/components/InvestmentList';
import StockPriceTracker from '@/components/StockPriceTracker';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Home() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'investments'));
      const investmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Investment));
      setInvestments(investmentsData);
    } catch (error) {
      console.error('Error loading investments:', error);
      // If Firebase is not configured, use empty array
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvestment = async (investment: Omit<Investment, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'investments'), investment);
      setInvestments([...investments, { id: docRef.id, ...investment }]);
    } catch (error) {
      console.error('Error adding investment:', error);
      alert('Failed to add investment. Please check Firebase configuration.');
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'investments', id));
      setInvestments(investments.filter(inv => inv.id !== id));
    } catch (error) {
      console.error('Error deleting investment:', error);
      alert('Failed to delete investment.');
    }
  };

  const handleUpdateInvestment = async (id: string, updates: Partial<Investment>) => {
    try {
      await updateDoc(doc(db, 'investments', id), updates);
      setInvestments(investments.map(inv => 
        inv.id === id ? { ...inv, ...updates } : inv
      ));
    } catch (error) {
      console.error('Error updating investment:', error);
      alert('Failed to update investment.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalValue = investments.reduce((sum, inv) => sum + (inv.currentValue || inv.amount), 0);
  const totalReturn = totalValue - totalInvested;
  const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested * 100).toFixed(2) : '0.00';

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Investment Tracker</h1>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Invested</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  Rs. {totalInvested.toLocaleString()}
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Current Value</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  Rs. {totalValue.toLocaleString()}
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Return</dt>
                <dd className={`mt-1 text-3xl font-semibold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Rs. {totalReturn.toLocaleString()}
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Return %</dt>
                <dd className={`mt-1 text-3xl font-semibold ${parseFloat(returnPercentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {returnPercentage}%
                </dd>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Investment Form */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Investment</h2>
              <InvestmentForm onSubmit={handleAddInvestment} />
            </div>

            {/* Stock Price Tracker */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">CSE Stock Tracker</h2>
              <StockPriceTracker />
            </div>
          </div>

          {/* Investment List */}
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Investments</h2>
            <InvestmentList 
              investments={investments}
              onDelete={handleDeleteInvestment}
              onUpdate={handleUpdateInvestment}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
