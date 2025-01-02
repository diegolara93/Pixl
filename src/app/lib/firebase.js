import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDOkVXKGHHXnrgRALUCUaLxZmHTvDmPh-Y",
    authDomain: "pixl-3d6ba.firebaseapp.com",
    projectId: "pixl-3d6ba",
    storageBucket: "pixl-3d6ba.firebasestorage.app",
    messagingSenderId: "93628490212",
    appId: "1:93628490212:web:350fcf32c0385bada467f1",
    measurementId: "G-HYXGGR26CV"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
