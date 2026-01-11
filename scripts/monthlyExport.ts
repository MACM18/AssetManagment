#!/usr/bin/env node
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
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
      });
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      process.exit(1);
    }
  } else {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
  
  // Initialize S3 Client
  const s3Config: any = {
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  };
  
  // Add endpoint if using MinIO or S3-compatible service
  if (process.env.AWS_ENDPOINT_URL) {
    const rawEndpoint = process.env.AWS_ENDPOINT_URL;
    // Normalize endpoint and enable path-style for MinIO/S3-compatible services
    const hasProtocol = /^https?:\/\//i.test(rawEndpoint);
    const normalizedEndpoint = hasProtocol ? rawEndpoint : `http://${rawEndpoint}`;
    s3Config.endpoint = normalizedEndpoint;
    s3Config.forcePathStyle = true; // required for MinIO unless using wildcard DNS
    console.log(`Using custom S3 endpoint: ${normalizedEndpoint}`);
  }
  
  const s3Client = new S3Client(s3Config);
  
  const bucketName = process.env.AWS_S3_BUCKET;
  
  if (!bucketName) {
    console.error('AWS_S3_BUCKET environment variable is required');
    process.exit(1);
  }
  
  const db = getFirestore();
  
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;

  console.log(`Exporting data for ${monthStr}...`);

  try {
    // Check for existing exports in S3
    console.log('Checking S3 bucket for previous exports...');
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: 'monthly-exports/',
    });
    
    const listResponse = await s3Client.send(listCommand);
    const hasExistingExports = listResponse.Contents && listResponse.Contents.length > 0;
    
    let startDate: string;
    let nextMonthStr: string;
    
    if (!hasExistingExports) {
      console.log('No previous exports found. Exporting all historical data...');
      // Export all data - start from earliest possible date
      startDate = '2020-01-01'; // Adjust this to your earliest data date
      const nextMonth = new Date(year, month);
      nextMonthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;
    } else {
      console.log('Previous exports found. Exporting current month only...');
      // Export only current month
      startDate = `${monthStr}-01`;
      const nextMonth = new Date(year, month);
      nextMonthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;
    }

    console.log(`Querying stock_prices_by_date for dates >= ${startDate} and < ${nextMonthStr}`);

    const collectionRef = db.collection('stock_prices_by_date');
    const snapshot = await collectionRef
      .where('date', '>=', startDate)
      .where('date', '<', nextMonthStr)
      .orderBy('date')
      .get();

    console.log(`Found ${snapshot.size} date documents for the selected range`);

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

    const csvFilename = hasExistingExports 
      ? `stock_prices_${monthStr}.csv` 
      : `stock_prices_all_${monthStr}.csv`;
    const csvPath = path.join(exportDir, csvFilename);
    fs.writeFileSync(csvPath, rows.join('\n'));
    console.log(`Wrote CSV to ${csvPath}`);

    // Upload to S3 under folder monthly-exports/<month>/
    const remotePath = `monthly-exports/${monthStr}/${csvFilename}`;
    const fileContent = fs.readFileSync(csvPath);
    
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: remotePath,
      Body: fileContent,
      ContentType: 'text/csv',
    });
    
    await s3Client.send(uploadCommand);
    console.log(`Uploaded CSV to S3: ${remotePath}`);

    // Save metadata to Firestore monthly-reports collection
    await db.collection('monthly-reports').doc(monthStr).set({
      month: monthStr,
      year,
      dataPoints: totalCount,
      storagePath: remotePath,
      storageType: 's3',
      bucketName: bucketName,
      isFullExport: !hasExistingExports,
      createdAt: new Date().toISOString(),
    });

    console.log('Monthly export completed successfully!');
  } catch (error) {
    console.error('Error during monthly export:', error);
    process.exit(1);
  }
}

main();
