# Investment Tracker + ML Pipeline

A modular investment tracking and forecasting system built with Next.js, Firebase, and GitHub Actions.

## Features

- 📊 **Next.js Dashboard**: Track investments across stocks (Colombo Stock Exchange), mutual funds, FDs, and other assets
- 📈 **Stock Price Tracking**: Monitor CSE stock prices in real-time
- 🤖 **Automated Data Collection**: Daily GitHub Actions workflow to fetch stock data with throttling
- 📦 **Monthly Exports**: Automated monthly aggregation and storage in Firebase
- 🔥 **Firebase Integration**: Firestore for data storage, Firebase Storage for exports

## Project Structure

```
AssetManagment/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page with dashboard
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── InvestmentForm.tsx  # Form to add investments
│   │   ├── InvestmentList.tsx  # List of investments
│   │   └── StockPriceTracker.tsx # CSE stock price tracker
│   ├── lib/                    # Utility libraries
│   │   ├── firebase.ts         # Firebase configuration
│   │   └── stockData.ts        # Stock data fetching utilities
│   └── types/                  # TypeScript type definitions
│       └── index.ts
├── scripts/                    # Automation scripts
│   ├── collectStockData.ts     # Daily data collection script
│   └── monthlyExport.ts        # Monthly export script
├── .github/
│   └── workflows/              # GitHub Actions workflows
│       ├── daily-data-collection.yml
│       └── monthly-export.yml
└── data/                       # Local data storage (gitignored)
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database and Firebase Storage
3. Copy `.env.example` to `.env.local` and fill in your Firebase configuration:

```bash
cp .env.example .env.local
```

4. For GitHub Actions, add the following secrets to your repository:
   - `FIREBASE_SERVICE_ACCOUNT`: Your Firebase service account JSON
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket name

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

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

## Investment Types

The tracker supports four types of investments:

1. **Stocks (CSE)**: Colombo Stock Exchange stocks with symbol tracking
2. **Mutual Funds**: Mutual fund investments with quantity tracking
3. **Fixed Deposits (FD)**: Bank fixed deposits
4. **Other**: Any other type of investment

## CSE Stock Symbols

The following CSE symbols are tracked by default (configurable in `src/lib/stockData.ts`):

**To add or remove stock symbols**, edit the `CSE_SYMBOLS` array in `src/lib/stockData.ts`:

```typescript
export const CSE_SYMBOLS = [
  'JKH',    // John Keells Holdings
  'COMB',   // Commercial Bank
  'HNB',    // Hatton National Bank
  'DIAL',   // Dialog Axiata
  'SAMP',   // Sampath Bank
  'LFIN',   // LB Finance
  'NTB',    // Nations Trust Bank
  'CINS',   // Ceylinco Insurance
  'BIL',    // Bukit Darah
  'VONE',   // Vallibel One
  'LOLC'    // LOLC Holdings
];
```

## API Integration

The system now uses the official CSE API endpoint with improved efficiency:

**Endpoint**: `https://www.cse.lk/api/tradeSummary`

**Request Format**:
```json
{}
```
(Empty POST request body)

**Response**: Array of all stocks' trade summary data for the day

**Features**:
- Makes a single POST request to get all stocks at once
- No throttling required between stocks (bulk fetch)
- Dramatically faster: ~5 seconds instead of 110+ seconds
- Parses response data including price, volume, and trading statistics
- Filters results to only include tracked symbols

**Response Format**: See `trade_summary_example.json` for an example API response structure.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run collect-data` - Manually run data collection
- `npm run monthly-export` - Manually run monthly export

## Data Storage

### Local Storage
- Daily stock data is saved to `data/cse-data-YYYY-MM-DD.json`
- The `data/` directory is gitignored by default (except when committed by GitHub Actions)

### Firebase Firestore
- Investments: `investments` collection
- Monthly reports metadata: `monthly-reports` collection

### Firebase Storage
- Monthly aggregated data: `monthly-exports/YYYY-MM.json`

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