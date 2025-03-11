
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjj44YzssvnLG171hhFBek9tvDXocWSrY",
  authDomain: "hospitalsaga-73562.firebaseapp.com",
  projectId: "hospitalsaga-73562",
  storageBucket: "hospitalsaga-73562.appspot.com",
  messagingSenderId: "532797174580",
  appId: "1:532797174580:web:44476b35f409692f422b61",
  measurementId: "G-SL3B7J7C5Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
