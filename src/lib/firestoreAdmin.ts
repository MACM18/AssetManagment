import admin from 'firebase-admin';

// Initialize firebase-admin for server-side Firestore access.
// Supports two modes:
// - If FIREBASE_SERVICE_ACCOUNT env var is set (JSON string), it will use that
// - Otherwise, it falls back to Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS)

function initAdmin() {
  if (admin.apps.length) return;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('firebase-admin initialized from FIREBASE_SERVICE_ACCOUNT');
    } catch (e) {
      console.error('Invalid FIREBASE_SERVICE_ACCOUNT JSON:', e);
      throw e;
    }
  } else {
    // This will work if GOOGLE_APPLICATION_CREDENTIALS env var points to a service account JSON file
    admin.initializeApp();
    console.log('firebase-admin initialized using Application Default Credentials');
  }
}

initAdmin();

export const adminDb = admin.firestore();
export { admin };
