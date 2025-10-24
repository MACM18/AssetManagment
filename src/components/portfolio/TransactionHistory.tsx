"use client";

import { usePortfolio } from "@/contexts/PortfolioContext";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";

export default function TransactionHistory() {
  const { transactions, loading } = usePortfolio();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700'>
        <h2 className='text-xl font-bold text-gray-900 mb-4'>
          Transaction History
        </h2>
        <div className='animate-pulse space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-16 bg-gray-200 dark:bg-gray-700 rounded'></div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700'>
        <h2 className='text-xl font-bold text-gray-900 mb-4'>
          Transaction History
        </h2>
        <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
          <p>No transactions yet</p>
          <p className='text-sm mt-1'>
            Your buy and sell history will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700'>
      <div className='p-6 border-b border-gray-200'>
        <h2 className='text-xl font-bold text-gray-900 dark:text-gray-100'>Transaction History</h2>
      </div>

      <div className='divide-y divide-gray-200 max-h-96 overflow-y-auto'>
        {transactions.map((transaction) => {
          const isBuy = transaction.type === "buy";

          return (
            <div
              key={transaction.id}
              className='p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-start gap-3 flex-1'>
                  <div
                    className={`p-2 rounded-full ${
                      isBuy ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {isBuy ? (
                      <ArrowDownRight className='w-4 h-4 text-green-600' />
                    ) : (
                      <ArrowUpRight className='w-4 h-4 text-red-600' />
                    )}
                  </div>

                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <span
                        className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                          isBuy
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.type}
                      </span>
                      <h3 className='text-sm font-bold text-gray-900 dark:text-gray-100'>
                        {transaction.symbol}
                      </h3>
                    </div>
                    <p className='text-xs text-gray-600 mt-1'>
                      {transaction.companyName}
                    </p>

                    <div className='flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400'>
                      <div className='flex items-center gap-1'>
                        <Calendar className='w-3 h-3' />
                        <span>
                          {new Date(transaction.date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <span>
                        {transaction.quantity} shares @ LKR{" "}
                        {transaction.price.toFixed(2)}
                      </span>
                    </div>

                    {transaction.notes && (
                      <p className='text-xs text-gray-500 mt-2 italic'>
                        {transaction.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className='text-right ml-4'>
                  <p className='text-sm font-bold text-gray-900 dark:text-gray-100'>
                    LKR{" "}
                    {transaction.totalAmount.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>Total</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
