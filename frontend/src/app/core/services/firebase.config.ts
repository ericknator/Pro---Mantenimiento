import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBUAcT_ptxS-SmkaWiIlfoohqql2Uoo8zs',
  authDomain: 'bdpromantenimiento20262.firebaseapp.com',
  projectId: 'bdpromantenimiento20262',
  storageBucket: 'bdpromantenimiento20262.firebasestorage.app',
  messagingSenderId: '1071451866045',
  appId: '1:1071451866045:web:2181271944a6c9a93608d4',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
