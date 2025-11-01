import type { CSEStockData } from "../src/types";
import type { firestore as adminFirestore } from "firebase-admin";

// This script is server-only. It initializes firebase-admin lazily and writes the
// provided data array into Firestore under collection `stock_prices` using
// deterministic document IDs (symbol_date).

async function initAdmin() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const admin = require("firebase-admin");

  if (!admin._initialized) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountJson) {
      try {
        const serviceAccount = JSON.parse(serviceAccountJson);

        // Attempt to read project_id from service account JSON
        const projectId =
          serviceAccount.project_id ||
          process.env.GCLOUD_PROJECT ||
          process.env.GOOGLE_CLOUD_PROJECT;

        if (!projectId) {
          throw new Error(
            "Project ID not found in FIREBASE_SERVICE_ACCOUNT JSON or environment"
          );
        }

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId,
        });
        admin._initialized = true;
        console.log("firebase-admin initialized from FIREBASE_SERVICE_ACCOUNT");
      } catch (e) {
        console.error(
          "Failed to parse or initialize Firebase admin from FIREBASE_SERVICE_ACCOUNT:",
          e
        );
        throw e;
      }
    } else {
      // Try application default credentials; ensure project id is available via env
      const projectId =
        process.env.GCLOUD_PROJECT ||
        process.env.GOOGLE_CLOUD_PROJECT ||
        process.env.FIREBASE_PROJECT;
      if (!projectId) {
        console.warn(
          "No FIREBASE_SERVICE_ACCOUNT provided and no project id found in GCLOUD_PROJECT/GOOGLE_CLOUD_PROJECT/FIREBASE_PROJECT env vars. Application Default Credentials may still work if running in GCP environment."
        );
      }
      admin.initializeApp({ projectId: projectId || undefined });
      admin._initialized = true;
      console.log(
        "firebase-admin initialized using Application Default Credentials"
      );
    }
  }

  return admin as typeof import("firebase-admin");
}

export async function saveStockDataToFirestore(
  data: CSEStockData[],
  date: string
): Promise<void> {
  try {
    const admin = await initAdmin();
    const adminDb: adminFirestore.Firestore = admin.firestore();

    const collectionRef = adminDb.collection("stock_prices");

    console.log(
      `saveStockDataToFirestore called — records=${
        data ? data.length : 0
      }, date=${date}`
    );

    // Write a single document per date containing all stock records for ML
    try {
      const dateDocId = date;
      const byDateCollection = adminDb.collection("stock_prices_by_date");

      const stocksArray = (data || []).map((item) => {
        const idSymbol = (item as any).rawSymbol || item.symbol;
        return {
          symbol: idSymbol,
          normalizedSymbol: item.symbol,
          companyName: item.companyName,
          date: item.date || date,
          price: item.price ?? null,
          open: item.open ?? null,
          high: item.high ?? null,
          low: item.low ?? null,
          close: item.close ?? null,
          change: item.change ?? null,
          changePercent: item.changePercent ?? null,
          volume: item.volume ?? null,
          shareType: item.shareType ?? null,
        };
      });

      const payload: Record<string, unknown> = {
        date,
        count: stocksArray.length,
        stocks: stocksArray,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await byDateCollection.doc(dateDocId).set(payload, { merge: true });
      console.log(
        `Saved ${stocksArray.length} stock records to Firestore (stock_prices_by_date/${dateDocId})`
      );

      // Also write last-run metadata for quick check (optional)
      try {
        await collectionRef.doc("_last_run").set(
          {
            date,
            count: stocksArray.length,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } catch (metaErr) {
        console.warn(
          "Could not write _last_run metadata to stock_prices collection:",
          metaErr
        );
      }
    } catch (writeErr) {
      console.error(
        "Error writing date-wise stock data to Firestore:",
        writeErr
      );
      throw writeErr;
    }
  } catch (err) {
    console.error("Error saving stock data to Firestore:", err);
    throw err;
  }
}
