import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

const sharedFirebaseConfig = {
  apiKey: 'AIzaSyBUAcT_ptxS-SmkaWiIlfoohqql2Uoo8zs',
  authDomain: 'bdpromantenimiento20262.firebaseapp.com',
  projectId: 'bdpromantenimiento20262',
  storageBucket: 'bdpromantenimiento20262.firebasestorage.app',
  messagingSenderId: '1071451866045',
  appId: '1:1071451866045:web:2181271944a6c9a93608d4',
};

type FirebaseRuntime = {
  useFirebaseEmulator?: boolean;
  firebaseAuthEmulatorUrl?: string;
};
const runtime = (globalThis as typeof globalThis & { PMS276?: FirebaseRuntime }).PMS276;
const useEmulator = runtime?.useFirebaseEmulator === true;
const firebaseConfig = useEmulator ? {
  apiKey: 'demo-api-key',
  authDomain: 'demo-pms276.firebaseapp.com',
  projectId: 'demo-pms276',
  appId: 'demo-app-id',
} : sharedFirebaseConfig;
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

if (useEmulator) {
  connectAuthEmulator(auth, runtime?.firebaseAuthEmulatorUrl ?? 'http://127.0.0.1:9099',
    { disableWarnings: true });
}
