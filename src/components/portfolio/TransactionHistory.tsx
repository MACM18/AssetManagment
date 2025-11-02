"use client";

import { usePortfolio } from "@/contexts/PortfolioContext";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowUpRight, ArrowDownRight, Calendar, Receipt } from "lucide-react";

export default function TransactionHistory() {
  const { transactions, loading } = usePortfolio();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className='rounded-xl shadow-lg p-6 border border-border bg-card'>
        <h2 className='text-xl font-bold mb-4 text-foreground'>
          Transaction History
        </h2>
        <div className='animate-pulse space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-16 rounded-lg bg-muted/30'></div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className='rounded-xl shadow-lg p-6 border border-border bg-card'>
        <h2 className='text-xl font-bold mb-4 text-foreground'>
          Transaction History
        </h2>
        <div className='text-center py-12'>
          <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center'>
            <Receipt className='w-8 h-8 text-muted-foreground' />
          </div>
          <p className='text-muted-foreground font-medium'>
            No transactions yet
          </p>
          <p className='text-sm mt-2 text-muted-foreground'>
            Your buy and sell history will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-xl shadow-lg border border-border bg-card hover:shadow-xl transition-shadow'>
      <div className='p-6 border-b border-border bg-secondary/20'>
        <h2 className='text-xl font-bold text-foreground'>
          Transaction History
        </h2>
        <p className='text-sm text-muted-foreground mt-1'>
          {transactions.length} transaction
          {transactions.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className='divide-y divide-border max-h-96 overflow-y-auto'>
        {transactions.map((transaction) => {
          const isBuy = transaction.type === "buy";

          return (
            <div
              key={transaction.id}
              className='p-4 transition-colors hover:bg-secondary/10'
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-start gap-3 flex-1'>
                  <div
                    className={`p-2 rounded-full border ${
                      isBuy
                        ? "bg-primary/10 border-primary/30"
                        : "bg-success/10 border-success/30"
                    }`}
                  >
                    {isBuy ? (
                      <ArrowDownRight className='w-4 h-4 text-primary' />
                    ) : (
                      <ArrowUpRight className='w-4 h-4 text-success' />
                    )}
                  </div>

                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span
                        className={`text-xs font-bold uppercase px-2 py-1 rounded-full border ${
                          isBuy
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "bg-success/10 text-success border-success/30"
                        }`}
                      >
                        {transaction.type}
                      </span>
                      <h3 className='text-sm font-bold text-foreground'>
                        {transaction.symbol}
                      </h3>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {transaction.companyName}
                    </p>

                    <div className='flex items-center gap-4 mt-2 text-xs text-muted-foreground'>
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
                      <span className='font-medium text-foreground'>
                        {transaction.quantity} shares @ LKR{" "}
                        {transaction.price.toFixed(2)}
                      </span>
                    </div>

                    {transaction.notes && (
                      <p className='text-xs mt-2 italic text-muted-foreground bg-muted/20 p-2 rounded'>
                        {transaction.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className='text-right ml-4'>
                  <p className='text-sm font-bold text-foreground'>
                    LKR{" "}
                    {transaction.totalAmount.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className='text-xs mt-1 text-muted-foreground'>Total</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
