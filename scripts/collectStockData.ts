#!/usr/bin/env node
import { fetchMultipleStocks, saveStockDataLocally, CSE_SYMBOLS } from '../src/lib/stockData';
import { saveStockDataToFirestore } from './saveStockDataToFirestore';

async function main() {
  console.log('Starting daily stock data collection...');
  console.log(`Collecting data for ${CSE_SYMBOLS.length} symbols using bulk endpoint...`);

  const date = new Date().toISOString().split('T')[0];

  try {
    const stockData = await fetchMultipleStocks(CSE_SYMBOLS);
    console.log(`Successfully collected data for ${stockData.length} stocks`);

    // Save to local file
    saveStockDataLocally(stockData, date);

    // Optionally save to Firestore when enabled via env var
    if (process.env.SAVE_TO_FIRESTORE === 'true') {
      console.log('SAVE_TO_FIRESTORE=true, attempting to save to Firestore...');

      // Quick pre-check to provide a useful error message when credentials are missing
      const hasServiceAccount = !!process.env.FIREBASE_SERVICE_ACCOUNT;
      const hasProjectEnv = !!process.env.GCLOUD_PROJECT || !!process.env.GOOGLE_CLOUD_PROJECT || !!process.env.FIREBASE_PROJECT;

      if (!hasServiceAccount && !hasProjectEnv) {
        console.error('SAVE_TO_FIRESTORE is true but no FIREBASE_SERVICE_ACCOUNT or project env var found.');
        console.error('Set FIREBASE_SERVICE_ACCOUNT to your service account JSON (stringified) or set GCLOUD_PROJECT/GOOGLE_CLOUD_PROJECT/FIREBASE_PROJECT in the environment.');

      } else {
        try {
          await saveStockDataToFirestore(stockData, date);
        } catch (err) {
          console.error('Failed to save data to Firestore:', err);
        }
      }
    }

    console.log('Daily data collection completed successfully!');
  } catch (error) {
    console.error('Error during data collection:', error);
    process.exit(1);
  }
}

main();
