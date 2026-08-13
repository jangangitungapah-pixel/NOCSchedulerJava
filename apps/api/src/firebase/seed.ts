import { getFirebaseAdminServices } from './admin.js';

async function resetAuth() {
  const { auth } = getFirebaseAdminServices();
  let pageToken: string | undefined;

  do {
    const page = await auth.listUsers(1_000, pageToken);
    const uids = page.users.map((user) => user.uid);

    if (uids.length > 0) {
      const result = await auth.deleteUsers(uids);

      if (result.failureCount > 0) {
        throw new Error(`Failed to delete ${result.failureCount} Auth emulator user(s).`);
      }
    }

    pageToken = page.pageToken;
  } while (pageToken);
}

async function resetFirestore() {
  const { firestore } = getFirebaseAdminServices();
  const collections = await firestore.listCollections();

  for (const collection of collections) {
    await firestore.recursiveDelete(collection);
  }

  await firestore.doc('foundationMetadata/seed').set({
    schemaVersion: 1,
    seededBy: 'WP-F04',
    timezone: 'Asia/Jakarta',
  });
}

async function main() {
  const services = getFirebaseAdminServices();

  if (!services.emulatorMode || !services.projectId?.startsWith('demo-')) {
    throw new Error('Refusing to reset/seed Firebase outside the demo Emulator Suite.');
  }

  await resetAuth();
  await resetFirestore();

  console.log(
    `[firebase:seed] OK — reset and seeded demo project ${services.projectId} deterministically.`,
  );
}

void main().catch((error: unknown) => {
  console.error('[firebase:seed] FAILED', error);
  process.exitCode = 1;
});
