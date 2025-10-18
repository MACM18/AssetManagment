#!/usr/bin/env node
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('Starting monthly export...');
  
  // Initialize Firebase Admin (for server-side operations)
  // In production, use service account credentials
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  
  if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
    console.warn('Firebase service account not configured. Using default initialization.');
    try {
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      process.exit(1);
    }
  } else {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
  
  const storage = getStorage();
  const db = getFirestore();
  
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;

  console.log(`Exporting data for ${monthStr}...`);

  try {
    // Query Firestore for date-wise documents in stock_prices_by_date for this month
    const startDate = `${monthStr}-01`;
    const nextMonth = new Date(year, month); // month is 1-based above; this gives first day of next month
    const nextMonthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;

    console.log(`Querying stock_prices_by_date for dates >= ${startDate} and < ${nextMonthStr}`);

    const collectionRef = db.collection('stock_prices_by_date');
    const snapshot = await collectionRef
      .where('date', '>=', startDate)
      .where('date', '<', nextMonthStr)
      .orderBy('date')
      .get();

    console.log(`Found ${snapshot.size} date documents for ${monthStr}`);

    const rows: string[] = [];
    // CSV header — choose fields useful for ML: date,symbol,normalizedSymbol,price,open,high,low,close,change,changePercent,volume
    const header = ['date','symbol','normalizedSymbol','price','open','high','low','close','change','changePercent','volume'];
    rows.push(header.join(','));

    let totalCount = 0;

    snapshot.forEach(doc => {
      const d = doc.data();
      const stocks = Array.isArray(d.stocks) ? d.stocks : [];
      for (const s of stocks) {
        const dateVal = s.date || d.date || '';
        const symbol = (s.rawSymbol || s.symbol || '').toString().replace(/,/g, '');
        const normalized = (s.normalizedSymbol || s.symbol || '').toString().replace(/,/g, '');
        const price = s.price ?? '';
        const open = s.open ?? '';
        const high = s.high ?? '';
        const low = s.low ?? '';
        const close = s.close ?? '';
        const change = s.change ?? '';
        const changePercent = s.changePercent ?? '';
        const volume = s.volume ?? '';

        const row = [dateVal, symbol, normalized, price, open, high, low, close, change, changePercent, volume]
          .map(v => (v === null || v === undefined) ? '' : String(v))
          .join(',');
        rows.push(row);
        totalCount++;
      }
    });

    console.log(`Aggregated ${totalCount} stock rows for CSV`);

    // Ensure export directory exists
    const exportDir = path.join(process.cwd(), 'data', 'exports', monthStr);
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

    const csvFilename = `stock_prices_${monthStr}.csv`;
    const csvPath = path.join(exportDir, csvFilename);
    fs.writeFileSync(csvPath, rows.join('\n'));
    console.log(`Wrote CSV to ${csvPath}`);

    // Upload to Firebase Storage under folder monthly-exports/<month>/
    const bucket = storage.bucket();
    const remotePath = `monthly-exports/${monthStr}/${csvFilename}`;
    const file = bucket.file(remotePath);
    await file.save(fs.readFileSync(csvPath), { contentType: 'text/csv' });
    console.log(`Uploaded CSV to Firebase Storage: ${remotePath}`);

    // Save metadata to Firestore monthly-reports collection
    await db.collection('monthly-reports').doc(monthStr).set({
      month: monthStr,
      year,
      dataPoints: totalCount,
      storagePath: remotePath,
      createdAt: new Date().toISOString(),
    });

    console.log('Monthly export completed successfully!');
  } catch (error) {
    console.error('Error during monthly export:', error);
    process.exit(1);
  }
}

main();
