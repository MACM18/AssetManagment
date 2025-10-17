# Quick Start Guide

Get your Investment Tracker up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- A Firebase account (free tier is sufficient)
- Git installed

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/MACM18/AssetManagment.git
cd AssetManagment

# Install dependencies
npm install
```

## Step 2: Firebase Setup (Optional but Recommended)

### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter a project name (e.g., "Investment Tracker")
4. Follow the setup wizard

### Enable Required Services

1. **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode" for development
   - Select a location

2. **Firebase Storage**:
   - Go to Storage
   - Click "Get started"
   - Use default security rules for development

3. **Authentication** (Optional):
   - Go to Authentication
   - Click "Get started"
   - Enable desired sign-in methods

### Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (</>) to add a web app
4. Register your app (name: "Investment Tracker Web")
5. Copy the configuration values

### Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your Firebase config
```

Add your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Step 3: Run the Application

### Development Mode
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

## Step 4: Configure GitHub Actions (Optional)

For automated data collection and monthly exports, see [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md).

## Using Without Firebase

The application works without Firebase configuration but with limited functionality:
- ✅ UI components load correctly
- ✅ Stock price tracker displays (with mock data)
- ✅ Forms are functional
- ❌ Data persistence (investments won't be saved)
- ❌ Monthly exports to cloud storage

## Testing the Data Collection Script

Run manually to test CSE stock data collection:

```bash
npm run collect-data
```

This will:
- Fetch data for 10 CSE stock symbols
- Apply throttling (2 seconds between requests)
- Save data to `data/cse-data-YYYY-MM-DD.json`

## Project Structure Overview

```
AssetManagment/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   ├── lib/             # Utilities & Firebase config
│   └── types/           # TypeScript types
├── scripts/             # Automation scripts
│   ├── collectStockData.ts   # Daily collection
│   └── monthlyExport.ts      # Monthly export
└── .github/workflows/   # GitHub Actions
```

## Key Features

### 1. Investment Dashboard
- Track stocks, mutual funds, FDs, and other investments
- View total invested amount, current value, and returns
- Calculate return percentages automatically

### 2. CSE Stock Tracker
- Monitor 10 major Colombo Stock Exchange stocks
- View real-time price updates (mock data by default)
- Track price changes and percentages

### 3. Automated Data Collection
- Daily GitHub Actions workflow
- Throttled API calls (2s between requests)
- Automatic commits to repository

### 4. Monthly Exports
- Aggregate collected data monthly
- Upload to Firebase Storage
- Store metadata in Firestore

## Next Steps

1. **Customize Stock Symbols**: Edit `src/lib/stockData.ts` to track different CSE symbols
2. **Integrate Real API**: Replace mock data with actual CSE API calls
3. **Add Authentication**: Enable Firebase Authentication for multi-user support
4. **Deploy**: Deploy to Vercel, Netlify, or your preferred hosting platform

## Common Issues

### Build Errors
- Make sure all dependencies are installed: `npm install`
- Clear Next.js cache: `rm -rf .next`

### Firebase Errors
- Verify environment variables are set correctly
- Check Firebase console for service status
- Ensure Firestore and Storage are enabled

### Development Server Issues
- Port 3000 is already in use: Use `PORT=3001 npm run dev`
- Changes not reflecting: Clear browser cache and restart dev server

## Getting Help

- 📚 [Next.js Documentation](https://nextjs.org/docs)
- 🔥 [Firebase Documentation](https://firebase.google.com/docs)
- 🐛 [Report Issues](https://github.com/MACM18/AssetManagment/issues)

## License

ISC
