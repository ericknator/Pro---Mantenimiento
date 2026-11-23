import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

// PMS-276 local configuration. It deliberately targets the Auth Emulator,
// never the shared Firebase project used by the original worktree.
const firebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo-pms276.firebaseapp.com',
  projectId: 'demo-pms276',
  storageBucket: 'demo-pms276.firebasestorage.app',
  messagingSenderId: 'demo-messaging-sender',
  appId: 'demo-app-id',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

type Pms276Runtime = {
  useFirebaseEmulator?: boolean;
  firebaseAuthEmulatorUrl?: string;
};

const runtime = (globalThis as typeof globalThis & { PMS276?: Pms276Runtime }).PMS276;
const useEmulator = runtime?.useFirebaseEmulator ?? true;

if (useEmulator) {
  connectAuthEmulator(
    auth,
    runtime?.firebaseAuthEmulatorUrl ?? 'http://127.0.0.1:9099',
    { disableWarnings: true },
  );
}
