# CSE Trading Platform - Investment Tracker + ML Pipeline

A professional trading platform for the Colombo Stock Exchange (CSE) with real-time analytics, advanced charting, and automated data collection workflows.

## 🚀 Features

### 📊 Trading Platform UI

- **Market Overview**: Real-time market summary with advancers, decliners, and volume stats
- **Advanced Charts**: Line, Area, and Candlestick charts with multiple timeframes (1D to 1Y)
- **Watchlist**: Customizable stock watchlist with search and filtering
- **Market Depth**: Order book visualization with bid/ask levels
- **Real-time Updates**: Auto-refresh every 5 minutes

### 🤖 Automated Data Collection

- **Daily Collection**: GitHub Actions workflow fetches CSE data daily at 9 AM UTC
- **Bulk API Requests**: Single request fetches all stocks (~5 seconds)
- **Firestore Storage**: All data stored in Firebase Firestore for fast querying
- **Monthly Exports**: Automated monthly aggregation and archival

### 📈 Analytics & Visualization

- **Top Movers**: Track top gainers, losers, and most active stocks
- **Price Charts**: Interactive charts with OHLCV data and volume analysis
- **Historical Data**: View price history across multiple timeframes
- **Technical Analysis**: Foundation ready for indicators (RSI, MACD, etc.)

## 📦 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Database**: Firebase Firestore
- **Icons**: Lucide React
- **API**: CSE TradeSummary API
- **Automation**: GitHub Actions

## Project Structure

```
AssetManagment/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Trading platform main page
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── MarketOverview.tsx  # Market summary & top movers
│   │   ├── StockChart.tsx      # Advanced charting component
│   │   ├── WatchList.tsx       # Stock watchlist
│   │   ├── MarketDepth.tsx     # Order book visualization
│   │   ├── InvestmentForm.tsx  # (Legacy - for future use)
│   │   └── InvestmentList.tsx  # (Legacy - for future use)
│   ├── lib/                    # Utility libraries
│   │   ├── firebase.ts         # Firebase client config
│   │   ├── firestoreAdmin.ts   # Firebase admin SDK
│   │   ├── stockData.ts        # CSE API integration
│   │   └── tradingData.ts      # Firestore data queries
│   └── types/                  # TypeScript definitions
│       └── index.ts
├── scripts/                    # Automation scripts
│   ├── collectStockData.ts     # Daily data collection
│   ├── saveStockDataToFirestore.ts  # Save to Firestore
│   └── monthlyExport.ts        # Monthly export
├── .github/
│   └── workflows/              # GitHub Actions
│       ├── daily-data-collection.yml
│       └── monthly-export.yml
└── data/                       # Local data storage (gitignored)
```

## 🎨 UI Components

### Market Overview

Displays market-wide statistics and highlights top movers.

- Market summary cards (Volume, Advancers, Decliners, Trades)
- Top 5 Gainers, Losers, and Most Active stocks
- Color-coded indicators and gradients

### Stock Chart

Advanced charting with multiple visualization options.

- **Chart Types**: Line, Area, Candlestick
- **Timeframes**: 1D, 1W, 1M, 3M, 6M, 1Y, ALL
- Interactive tooltips with OHLCV data
- Integrated volume chart

### Watch List

Customizable stock monitoring interface.

- Search and filter stocks
- Add/remove from watchlist
- Real-time price updates
- Quick stock selection

### Market Depth

Visual representation of market liquidity.

- Bid/Ask order book
- Visual volume bars
- Trading statistics (High, Low, Volume)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

#### Frontend Configuration (Required for Web App)

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore Database** in Firebase Console
3. Get your Web App configuration:
   - Go to Project Settings (gear icon) → Your apps
   - Select or add a Web App
   - Copy the Firebase SDK configuration values
4. Copy `.env.example` to `.env.local` and fill in your Firebase web app config:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase web app credentials:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### GitHub Actions Configuration (Required for Data Collection)

For automated data collection workflows, add the following secrets to your GitHub repository:
   - `FIREBASE_SERVICE_ACCOUNT`: Your Firebase service account JSON (from Firebase Console → Project Settings → Service Accounts)
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket name (e.g., `your_project.appspot.com`)

**Note**: The frontend and workflows use different authentication methods:
- Frontend: Web app credentials (NEXT_PUBLIC_* variables)
- Workflows: Service account credentials (GitHub Secrets)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the trading platform.

## 📊 Data Collection & Storage

### Firestore Collections

The application uses two Firestore collections:

#### `stock_prices_by_date` (Primary Collection)

Each document represents one trading date and contains all stock data for that date:

```typescript
{
  date: string;              // YYYY-MM-DD (document ID)
  count: number;             // Number of stocks
  stocks: [                  // Array of all stocks for this date
    {
      symbol: string;        // Original symbol (e.g., "JKH.N0000")
      normalizedSymbol: string; // Cleaned symbol (e.g., "JKH")
      companyName: string;
      date: string;          // YYYY-MM-DD
      price: number;
      open: number;
      high: number;
      low: number;
      close: number;
      change: number;
      changePercent: number;
      volume: number;
    }
  ],
  updatedAt: timestamp;      // Server timestamp
}
```

#### `stock_prices/_last_run` (Metadata)

Stores metadata about the last data collection run:

```typescript
{
  date: string;              // Last collection date
  count: number;             // Number of stocks collected
  updatedAt: timestamp;      // Last update time
}
```

### Data Collection Workflow

1. **Collect Data**: Fetch from CSE API

```bash
npm run collect-data
```

2. **Save to Firestore**: Automatically saves during collection
3. **Monthly Export**: Aggregate and archive

```bash
npm run monthly-export
```

## GitHub Actions Workflows

### Daily Data Collection

Runs every day at 9:00 AM UTC (3:00 PM Sri Lanka Time) to fetch CSE stock data.

- **Workflow**: `.github/workflows/daily-data-collection.yml`
- **Script**: `scripts/collectStockData.ts`
- **Features**:
  - Fetches data for all CSE stocks in a single bulk request
  - Filters to include only tracked symbols
  - Much faster: completes in ~5 seconds (vs. 110+ seconds with old approach)
  - Saves data to `data/` directory
  - Commits data back to repository

**Manual trigger:**

```bash
npm run collect-data
```

### Monthly Export

Runs on the first day of each month to aggregate collected data and upload to Firebase Storage.

- **Workflow**: `.github/workflows/monthly-export.yml`
- **Script**: `scripts/monthlyExport.ts`
- **Features**:
  - Aggregates all data from the previous month
  - Uploads to Firebase Storage as JSON
  - Saves metadata to Firestore

**Manual trigger:**

```bash
npm run monthly-export
```

## 🚀 Future Enhancements

### Planned Features

- Real-time WebSocket updates
- Technical indicators (RSI, MACD, Bollinger Bands)
- Portfolio tracking and management (reintegrate legacy components)
- Price alerts and notifications
- Export to CSV/Excel
- Dark mode support
- News integration
- ML-based price predictions

### Legacy Investment Management

The original investment tracking features are preserved for future integration:

- `InvestmentForm.tsx` - Add investments
- `InvestmentList.tsx` - Manage portfolio
- Portfolio analytics and returns calculation

See [TRADING_PLATFORM.md](./TRADING_PLATFORM.md) for detailed documentation.

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run collect-data` - Fetch stock data from CSE
- `npm run monthly-export` - Generate monthly report

## 📚 Documentation

- [TRADING_PLATFORM.md](./TRADING_PLATFORM.md) - Complete trading platform guide
- [FIREBASE_DEPLOYMENT.md](./FIREBASE_DEPLOYMENT.md) - Deployment setup
- [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) - CI/CD configuration
- [STOCK_DATA_UPDATE.md](./STOCK_DATA_UPDATE.md) - Data collection details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.
