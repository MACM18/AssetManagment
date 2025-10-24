# Portfolio Data Model - Phase 2 Complete

## Overview

Complete portfolio management data model with TypeScript types, Firestore integration, and context provider for global state management.

## Firestore Schema

### Collections Structure

```
portfolios/{userId}/
  holdings/{holdingId}
  transactions/{transactionId}

users/{userId}
```

### Holdings Collection

**Path:** `/portfolios/{userId}/holdings`

Each holding document represents a stock purchase:

```typescript
{
  id: string,              // Auto-generated
  userId: string,          // Owner UID
  symbol: string,          // Stock symbol (e.g., "CTC.N0000")
  companyName: string,     // Company name
  quantity: number,        // Number of shares
  purchasePrice: number,   // Price per share at purchase
  purchaseDate: string,    // ISO date string
  notes?: string,          // Optional user notes
  createdAt: Timestamp,    // Auto-generated
  updatedAt: Timestamp     // Auto-updated
}
```

### Transactions Collection

**Path:** `/portfolios/{userId}/transactions`

Historical record of all buy/sell actions:

```typescript
{
  id: string,              // Auto-generated
  userId: string,          // Owner UID
  symbol: string,          // Stock symbol
  companyName: string,     // Company name
  type: "buy" | "sell",    // Transaction type
  quantity: number,        // Number of shares
  price: number,           // Price per share
  totalAmount: number,     // Total transaction value
  date: string,            // ISO date string
  notes?: string,          // Optional notes
  createdAt: Timestamp     // Auto-generated
}
```

## TypeScript Types

### Core Portfolio Types

Located in `src/types/index.ts`:

- **PortfolioHolding** - Base holding structure
- **Transaction** - Transaction record
- **PortfolioSummary** - Aggregated portfolio metrics
- **PortfolioHoldingWithMetrics** - Holding with calculated performance
- **PortfolioPerformance** - Performance over time periods
- **SectorAllocation** - Diversification data

## API Functions

### Portfolio Management (`src/lib/portfolio.ts`)

#### Holdings

- `addHolding(userId, holding)` - Add new stock to portfolio
- `updateHolding(userId, holdingId, updates)` - Modify existing holding
- `deleteHolding(userId, holdingId)` - Remove holding
- `getUserHoldings(userId)` - Get all holdings for user
- `getHolding(userId, holdingId)` - Get specific holding

#### Transactions

- `addTransaction(userId, transaction)` - Record buy/sell transaction
- `getUserTransactions(userId)` - Get all transactions
- `getSymbolTransactions(userId, symbol)` - Get transactions for specific stock

#### Analytics

- `calculatePortfolioSummary(userId, currentStockPrices)` - Calculate real-time portfolio metrics
- `aggregateHoldingsBySymbol(holdings)` - Combine multiple purchases of same stock

## Context Provider

### PortfolioContext (`src/contexts/PortfolioContext.tsx`)

Global state management for portfolio data:

```typescript
const {
  holdings, // All user holdings
  transactions, // All transactions
  summary, // Calculated portfolio summary
  loading, // Loading state
  refreshPortfolio, // Refresh function
} = usePortfolio();
```

**Features:**

- Automatic loading on auth state change
- Real-time portfolio summary calculation
- Integrates with stock price data
- Loading states for UI feedback

## Security Rules

Updated `firestore.rules`:

```
match /portfolios/{userId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if request.auth != null && request.auth.uid == userId;

  match /holdings/{holdingId} {
    allow read: if request.auth != null && request.auth.uid == userId;
    allow write: if request.auth != null && request.auth.uid == userId;
  }

  match /transactions/{transactionId} {
    allow read: if request.auth != null && request.auth.uid == userId;
    allow write: if request.auth != null && request.auth.uid == userId;
  }
}
```

## Usage Examples

### Adding a Holding

```typescript
import { addHolding } from "@/lib/portfolio";
import { useAuth } from "@/contexts/AuthContext";

const { user } = useAuth();

await addHolding(user.uid, {
  symbol: "CTC.N0000",
  companyName: "Ceylon Tobacco Company PLC",
  quantity: 100,
  purchasePrice: 1250.0,
  purchaseDate: "2025-01-15",
  notes: "Long-term hold",
});
```

### Getting Portfolio Summary

```typescript
import { usePortfolio } from "@/contexts/PortfolioContext";

const { summary } = usePortfolio();

console.log(`Total Invested: ${summary.totalInvested}`);
console.log(`Current Value: ${summary.currentValue}`);
console.log(
  `Gain/Loss: ${summary.totalGainLoss} (${summary.totalGainLossPercent}%)`
);
```

### Refreshing Portfolio with Current Prices

```typescript
import { usePortfolio } from "@/contexts/PortfolioContext";

const { refreshPortfolio } = usePortfolio();
const currentStockPrices = await fetchLatestStockPrices();

await refreshPortfolio(currentStockPrices);
```

## What's Next (Phase 3)

With the data model in place, Phase 3 will build:

- Portfolio dashboard UI
- Add/Edit holding forms
- Transaction history viewer
- Real-time performance tracking
- Portfolio overview cards

## Data Flow

```
User Auth → PortfolioContext → Firestore
                ↓
    Holdings + Transactions
                ↓
    Current Stock Prices (from tradingData)
                ↓
    Calculate Metrics
                ↓
    PortfolioSummary
                ↓
    UI Components (Phase 3)
```
