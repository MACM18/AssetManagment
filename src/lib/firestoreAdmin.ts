// Server-only firebase-admin initializer was moved to
// `scripts/saveStockDataToFirestore.ts` to avoid bundling into the client.
// This file remains as a harmless placeholder so imports from `src/lib`
// don't accidentally pull in server-only code during the Next build.

// Placeholder export to signal that the admin SDK is not available on the client.
export const FIRESTORE_ADMIN_AVAILABLE = false;
