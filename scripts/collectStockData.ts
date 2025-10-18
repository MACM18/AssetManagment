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
      try {
        await saveStockDataToFirestore(stockData, date);
      } catch (err) {
        console.error('Failed to save data to Firestore:', err);
      }
    }
    
    console.log('Daily data collection completed successfully!');
  } catch (error) {
    console.error('Error during data collection:', error);
    process.exit(1);
  }
}

main();
