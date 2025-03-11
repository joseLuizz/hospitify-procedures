
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZ03IaggaI_s1XwRiJAIA-to7ois9yFIk",
  authDomain: "pmsaga-ab954.firebaseapp.com",
  projectId: "pmsaga-ab954",
  storageBucket: "pmsaga-ab954.firebasestorage.app",
  messagingSenderId: "870546599960",
  appId: "1:870546599960:web:fe329fe474b5e28e26536d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export default app;
