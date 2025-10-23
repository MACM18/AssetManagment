# CSE Trading Platform

A professional trading platform interface for the Colombo Stock Exchange (CSE) with real-time analytics and data visualization.

## 🚀 Features

### 📊 Market Overview

- **Market Summary Cards**: Track total volume, advancers, decliners, and total trades
- **Top Gainers**: View the best performing stocks of the day
- **Top Losers**: Monitor declining stocks
- **Most Active**: See stocks with highest trading volume

### 📈 Advanced Charting

- **Multiple Chart Types**: Line, Area, and Candlestick views
- **Multiple Timeframes**: 1D, 1W, 1M, 3M, 6M, 1Y, and ALL
- **Interactive Tooltips**: Detailed OHLCV (Open, High, Low, Close, Volume) data
- **Volume Analysis**: Integrated volume chart below price chart
- **Real-time Price Tracking**: Live price updates with change indicators

### 👁️ Watchlist Management

- **Customizable Watchlist**: Add/remove stocks from your watchlist
- **Search Functionality**: Quick search across stock symbols and company names
- **Detailed Stock Cards**: View OHLC data, volume, and percentage changes
- **Visual Indicators**: Color-coded trends (green for gains, red for losses)

### 📉 Market Depth

- **Order Book Visualization**: See bid and ask levels
- **Visual Volume Bars**: Understand market liquidity at different price levels
- **Trading Statistics**: Day high, low, volume, and previous close
- **Spread Analysis**: Monitor bid-ask spreads

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Database**: Firebase Firestore
- **Date Utilities**: date-fns
- **Language**: TypeScript

## 📦 Dependencies

```json
{
  "dependencies": {
    "axios": "^1.12.2",
    "firebase": "^12.4.0",
    "firebase-admin": "^13.5.0",
    "next": "^15.5.6",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "recharts": "^2.x",
    "lucide-react": "^0.x",
    "date-fns": "^3.x",
    "clsx": "^2.x"
  }
}
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Main trading platform UI
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── MarketOverview.tsx       # Market summary and movers
│   ├── StockChart.tsx           # Advanced charting component
│   ├── WatchList.tsx            # Stock watchlist
│   ├── MarketDepth.tsx          # Order book visualization
│   ├── InvestmentForm.tsx       # (Legacy - for future use)
│   ├── InvestmentList.tsx       # (Legacy - for future use)
│   └── StockPriceTracker.tsx    # (Legacy - for future use)
├── lib/
│   ├── firebase.ts              # Firebase client configuration
│   ├── firestoreAdmin.ts        # Firebase admin SDK
│   ├── stockData.ts             # CSE API integration
│   └── tradingData.ts           # Firestore data fetching
└── types/
    └── index.ts                 # TypeScript interfaces

scripts/
├── collectStockData.ts          # Fetch data from CSE API
├── saveStockDataToFirestore.ts  # Save to Firestore
└── monthlyExport.ts             # Generate monthly reports
```

## 🔧 Setup & Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

Create a `.env.local` file with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to view the trading platform.

### 4. Build for Production

```bash
npm run build
npm start
```

## 📊 Data Collection Workflow

### Automated Data Collection

The platform uses automated scripts to collect and store CSE stock data:

1. **Collect Stock Data** (Run daily/hourly):

```bash
npm run collect-data
```

This fetches latest stock prices from the CSE API and saves to Firestore.

2. **Monthly Export** (Run monthly):

```bash
npm run monthly-export
```

Generates monthly reports with aggregated stock data.

### Firestore Collections

#### `stock_prices`

Stores daily stock price data:

```typescript
{
  symbol: string;
  companyName: string;
  date: string; // YYYY-MM-DD
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePercent: number;
  volume: number;
  createdAt: string; // ISO timestamp
}
```

## 🎨 UI Components

### MarketOverview

Displays market-wide statistics and highlights top movers.

**Features:**

- Market summary cards with gradients
- Top 5 gainers, losers, and most active stocks
- Color-coded indicators
- Real-time updates

### StockChart

Advanced charting with multiple visualization options.

**Features:**

- Line, Area, and Candlestick chart types
- 7 timeframe options (1D to ALL)
- Interactive tooltips with OHLCV data
- Integrated volume chart
- Responsive design

### WatchList

Customizable stock monitoring interface.

**Features:**

- Search and filter stocks
- Add/remove from watchlist
- Quick stock selection
- Detailed stock cards with OHLC data
- Real-time price updates

### MarketDepth

Visual representation of market liquidity.

**Features:**

- Bid/Ask order book
- Visual volume bars
- Spread calculation
- Trading statistics

## 🔄 Data Flow

1. **Data Collection**: Scripts fetch data from CSE API
2. **Storage**: Data saved to Firestore with timestamps
3. **Retrieval**: Trading platform queries Firestore for latest data
4. **Visualization**: Components render data with charts and tables
5. **Updates**: Auto-refresh every 5 minutes

## 📱 Responsive Design

The platform is fully responsive and works on:

- Desktop (1920px+)
- Laptop (1280px+)
- Tablet (768px+)
- Mobile (375px+)

## 🚀 Future Enhancements

### Planned Features

- [ ] Real-time WebSocket updates
- [ ] Technical indicators (RSI, MACD, Bollinger Bands)
- [ ] Portfolio tracking and management
- [ ] Advanced filtering and sorting
- [ ] Export data to CSV/Excel
- [ ] Price alerts and notifications
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Comparison charts (multiple stocks)
- [ ] News integration
- [ ] ML-based price predictions

### Investment Management (Later Development)

The original investment tracking features have been preserved in separate components:

- `InvestmentForm.tsx`
- `InvestmentList.tsx`
- `StockPriceTracker.tsx`

These can be reintegrated in future versions for portfolio management.

## 🐛 Troubleshooting

### No Data Showing

- Ensure Firebase is configured correctly
- Run `npm run collect-data` to populate Firestore
- Check Firestore security rules

### Build Errors

- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

### Chart Not Rendering

- Ensure data has correct format
- Check browser console for errors
- Verify Recharts is installed correctly

## 📄 License

ISC

## 👥 Contributing

This is a private project. For questions or contributions, contact the repository owner.

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review the code comments
3. Check Firebase/Firestore documentation
4. Review Next.js documentation

---

**Last Updated**: October 2025
**Version**: 2.0.0
