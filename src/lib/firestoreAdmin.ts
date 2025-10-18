// Lazily initialize firebase-admin to avoid including it in client bundles.
// Callers should `require('./firestoreAdmin')` at runtime (server only).

let adminDb: any = undefined;
let adminSdk: any = undefined;

function initAdmin() {
  if (adminSdk && adminSdk.apps && adminSdk.apps.length) return;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  adminSdk = require('firebase-admin');

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      adminSdk.initializeApp({
        credential: adminSdk.credential.cert(serviceAccount),
      });
      console.log('firebase-admin initialized from FIREBASE_SERVICE_ACCOUNT');
    } catch (e) {
      console.error('Invalid FIREBASE_SERVICE_ACCOUNT JSON:', e);
      throw e;
    }
  } else {
    // Will use Application Default Credentials if available in environment
    adminSdk.initializeApp();
    console.log('firebase-admin initialized using Application Default Credentials');
  }

  adminDb = adminSdk.firestore();
}

try {
  initAdmin();
} catch (e) {
  // If initialization fails at require time (e.g., in a client build), don't crash.
  // Caller should handle absence of adminDb.
  // console.warn('firebase-admin init failed (possibly in client build):', e);
}

export { adminDb, adminSdk };
