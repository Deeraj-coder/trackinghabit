import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCRlem-2LXXrrKzIlOZ5c9iikpYz0aUbzA",
    authDomain: "habit-tracking-cf869.firebaseapp.com",
    projectId: "habit-tracking-cf869",
    storageBucket: "habit-tracking-cf869.firebasestorage.app",
    messagingSenderId: "600000491008",
    appId: "1:600000491008:web:dc9821546657d0326e72e5",
    measurementId: "G-BX16XMRWG1",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
