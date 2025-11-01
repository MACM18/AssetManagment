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
      <div className='rounded-lg shadow-lg p-6 border'>
        <h2 className='text-xl font-bold mb-4'>
          Transaction History
        </h2>
        <div className='animate-pulse space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-16 rounded border'></div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className='rounded-lg shadow-lg p-6 border'>
        <h2 className='text-xl font-bold mb-4'>
          Transaction History
        </h2>
        <div className='text-center py-8'>
          <p>No transactions yet</p>
          <p className='text-sm mt-1'>
            Your buy and sell history will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-lg shadow-lg border'>
      <div className='p-6 border-b'>
        <h2 className='text-xl font-bold'>Transaction History</h2>
      </div>

      <div className='divide-y max-h-96 overflow-y-auto'>
        {transactions.map((transaction) => {
          const isBuy = transaction.type === "buy";

          return (
            <div
              key={transaction.id}
              className='p-4 transition-colors'
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-start gap-3 flex-1'>
                  <div className='p-2 rounded-full border'>
                    {isBuy ? (
                      <ArrowDownRight className='w-4 h-4' />
                    ) : (
                      <ArrowUpRight className='w-4 h-4' />
                    )}
                  </div>

                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs font-semibold uppercase px-2 py-1 rounded border'>
                        {transaction.type}
                      </span>
                      <h3 className='text-sm font-bold'>
                        {transaction.symbol}
                      </h3>
                    </div>
                    <p className='text-xs mt-1'>
                      {transaction.companyName}
                    </p>

                    <div className='flex items-center gap-4 mt-2 text-xs'>
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
                      <p className='text-xs mt-2 italic'>
                        {transaction.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className='text-right ml-4'>
                  <p className='text-sm font-bold'>
                    LKR{" "}
                    {transaction.totalAmount.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className='text-xs mt-1'>Total</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
