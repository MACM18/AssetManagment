import type { CSEStockData } from '../src/types';
import type { firestore as adminFirestore } from 'firebase-admin';

// This script is server-only. It initializes firebase-admin lazily and writes the
// provided data array into Firestore under collection `stock_prices` using
// deterministic document IDs (symbol_date).

async function initAdmin() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const admin = require('firebase-admin');

  if (!admin._initialized) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (serviceAccountJson) {
      try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        admin._initialized = true;
      } catch (e) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', e);
        throw e;
      }
    } else {
      // let admin try application default credentials
      admin.initializeApp();
      admin._initialized = true;
    }
  }

  return admin as typeof import('firebase-admin');
}

export async function saveStockDataToFirestore(data: CSEStockData[], date: string): Promise<void> {
  if (!data || data.length === 0) return;

  const admin = await initAdmin();
  const adminDb: adminFirestore.Firestore = admin.firestore();

  const batch = adminDb.batch();
  const collectionRef = adminDb.collection('stock_prices');

  for (const item of data) {
    const docId = `${item.symbol}_${item.date || date}`;
    const docRef = collectionRef.doc(docId);

    const doc: Record<string, unknown> = {
      symbol: item.symbol,
      date: item.date || date,
      price: item.price ?? null,
      open: item.open ?? null,
      high: item.high ?? null,
      low: item.low ?? null,
      close: item.close ?? null,
      change: item.change ?? null,
      changePercent: item.changePercent ?? null,
      volume: item.volume ?? null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    batch.set(docRef, doc, { merge: true });
  }

  await batch.commit();
  console.log(`Saved ${data.length} stock records to Firestore (stock_prices)`);
}
