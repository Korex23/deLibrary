import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAGYw6ixHTF0Gd7JQzngHGEwbemAAiLdDA",
  authDomain: "delibrary-3c58b.firebaseapp.com",
  projectId: "delibrary-3c58b",
  storageBucket: "delibrary-3c58b.appspot.com",
  messagingSenderId: "863665677931",
  appId: "1:863665677931:web:4ab1613e6ab0f14705f32e",
  measurementId: "G-N36HQVCQSY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);

export const db = getFirestore(app);
export const storage = getStorage(app);
