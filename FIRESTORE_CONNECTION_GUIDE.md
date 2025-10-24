# Firestore Connection Guide

This document explains how the application connects to Firestore and how data flows from collection workflows to the frontend.

## Overview

The AssetManagement application uses Firebase Firestore to store and retrieve stock market data. The system has two main components:

1. **Data Collection Workflow** (Backend) - Collects and stores data
2. **Frontend Application** - Reads and displays data

## Data Flow

```
CSE API → GitHub Actions → Firestore (stock_prices_by_date) → Frontend App
```

### 1. Data Collection (GitHub Actions)

**Workflow**: `.github/workflows/daily-data-collection.yml`

- Runs daily at 9:00 AM UTC (3:00 PM Sri Lanka Time)
- Fetches stock data from CSE API
- Saves to Firestore using Firebase Admin SDK

**Authentication**: Uses service account credentials from GitHub Secrets
- `FIREBASE_SERVICE_ACCOUNT` - Service account JSON
- `FIREBASE_PROJECT_ID` - Project ID

**Storage Structure**: Saves to `stock_prices_by_date` collection
- Each document = one date
- Document ID = YYYY-MM-DD format
- Contains array of all stocks for that date

### 2. Data Storage (Firestore)

**Collection**: `stock_prices_by_date`

Each document structure:
```javascript
{
  date: "2025-01-15",           // Document ID
  count: 250,                    // Number of stocks
  stocks: [                      // Array of stock data
    {
      symbol: "JKH.N0000",       // Original symbol from API
      normalizedSymbol: "JKH",   // Cleaned symbol
      companyName: "John Keells Holdings",
      date: "2025-01-15",
      price: 125.50,
      open: 124.00,
      high: 126.00,
      low: 123.50,
      close: 125.50,
      change: 1.50,
      changePercent: 1.21,
      volume: 150000
    },
    // ... more stocks
  ],
  updatedAt: Timestamp          // Server timestamp
}
```

**Metadata**: `stock_prices/_last_run`
```javascript
{
  date: "2025-01-15",
  count: 250,
  updatedAt: Timestamp
}
```

### 3. Frontend Data Reading

**Library**: `src/lib/tradingData.ts`

The frontend uses the Firebase client SDK to read data:

#### Fetch Latest Stock Prices
```typescript
fetchLatestStockPrices()
```
- Queries `stock_prices_by_date` collection
- Gets the most recent date document
- Extracts stocks array and converts to `StockQuote[]`
- Falls back to CSE API if Firestore is unavailable

#### Fetch Stock History
```typescript
fetchStockHistory(symbol, daysBack)
```
- Queries date range from `stock_prices_by_date`
- Iterates through date documents
- Finds specific stock in each date's stocks array
- Returns array of `ChartDataPoint[]` for charting

## Configuration

### Prerequisites

1. Firebase project with Firestore enabled
2. Web app registered in Firebase project
3. Service account for GitHub Actions

### Frontend Configuration

Create `.env.local` with Firebase web app config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

**How to get these values:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click gear icon → Project Settings
4. Scroll to "Your apps" section
5. Select or add a Web App
6. Copy values from Firebase SDK snippet

### GitHub Actions Configuration

Add repository secrets:

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `FIREBASE_SERVICE_ACCOUNT` - Service account JSON
   - `FIREBASE_PROJECT_ID` - Your project ID
   - `FIREBASE_STORAGE_BUCKET` - Your storage bucket

**How to get service account:**
1. Go to Firebase Console → Project Settings
2. Click "Service Accounts" tab
3. Click "Generate new private key"
4. Copy entire JSON content
5. Paste as `FIREBASE_SERVICE_ACCOUNT` secret

## Firestore Security Rules

Recommended security rules for Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to stock prices for authenticated users
    match /stock_prices_by_date/{date} {
      allow read: if true;  // Public read access
      allow write: if false; // Only admin SDK can write
    }
    
    match /stock_prices/{document=**} {
      allow read: if true;  // Public read access
      allow write: if false; // Only admin SDK can write
    }
  }
}
```

## Troubleshooting

### Frontend shows "Demo Mode - Sample Data"

**Cause**: Firebase not configured or no data in Firestore

**Solutions**:
1. Check `.env.local` exists and has correct values
2. Verify Firestore has data in `stock_prices_by_date` collection
3. Check browser console for Firebase errors
4. Ensure Firebase project has Firestore enabled

### Workflow fails to save to Firestore

**Cause**: Invalid service account or permissions

**Solutions**:
1. Verify `FIREBASE_SERVICE_ACCOUNT` secret is valid JSON
2. Check service account has Firestore write permissions
3. Ensure `FIREBASE_PROJECT_ID` matches your project
4. Review workflow logs in GitHub Actions

### Stock history charts show no data

**Cause**: Data not found for specific stock or date range

**Solutions**:
1. Check stock symbol is correct (use normalized symbol)
2. Verify date range has data in Firestore
3. Check if workflow has run successfully
4. Inspect Firestore documents to confirm data exists

## Data Migration

If you need to migrate from old structure (`stock_prices` with individual documents) to new structure (`stock_prices_by_date` with date-based documents), contact the repository maintainer for migration scripts.

## Performance Considerations

- Each date document contains all stocks (~250 stocks per date)
- Efficient for fetching all stocks for a date (single read)
- Requires iteration for stock history (one read per date in range)
- Consider implementing caching for frequently accessed data

## Related Documentation

- [README.md](./README.md) - General setup and usage
- [FIREBASE_DEPLOYMENT.md](./FIREBASE_DEPLOYMENT.md) - Deployment guide
- [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) - Workflow setup
- [Firebase Documentation](https://firebase.google.com/docs/firestore)
