
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJ4fW8UhhJqfcI67Nej9QZnLo8lauTGqI",
  authDomain: "hospitalteste-85db9.firebaseapp.com",
  projectId: "hospitalteste-85db9",
  storageBucket: "hospitalteste-85db9.firebasestorage.app",
  messagingSenderId: "861557202219",
  appId: "1:861557202219:web:b52f743326ddff0d03f96e",
  measurementId: "G-SH1ESGXC5L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
