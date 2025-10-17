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
    // Read all data files from the current month
    const dataDir = path.join(process.cwd(), 'data');
    
    if (!fs.existsSync(dataDir)) {
      console.error('Data directory not found');
      process.exit(1);
    }
    
    const files = fs.readdirSync(dataDir)
      .filter(file => file.startsWith('cse-data-') && file.endsWith('.json'))
      .filter(file => file.includes(monthStr));
    
    console.log(`Found ${files.length} data files for ${monthStr}`);
    
    // Aggregate all data
    const aggregatedData: any[] = [];
    
    for (const file of files) {
      const filePath = path.join(dataDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      aggregatedData.push(...data);
    }
    
    console.log(`Aggregated ${aggregatedData.length} data points`);
    
    // Create monthly report
    const report = {
      month: monthStr,
      year,
      dataPoints: aggregatedData.length,
      data: aggregatedData,
      createdAt: new Date().toISOString(),
    };
    
    // Save to Firebase Storage
    const bucket = storage.bucket();
    const fileName = `monthly-exports/${monthStr}.json`;
    const file = bucket.file(fileName);
    
    await file.save(JSON.stringify(report, null, 2), {
      contentType: 'application/json',
      metadata: {
        metadata: {
          month: monthStr,
          year: year.toString(),
        }
      }
    });
    
    console.log(`Uploaded report to Firebase Storage: ${fileName}`);
    
    // Also save metadata to Firestore
    await db.collection('monthly-reports').doc(monthStr).set({
      month: monthStr,
      year,
      dataPoints: aggregatedData.length,
      createdAt: new Date().toISOString(),
      storageUrl: fileName,
    });
    
    console.log('Monthly export completed successfully!');
  } catch (error) {
    console.error('Error during monthly export:', error);
    process.exit(1);
  }
}

main();
