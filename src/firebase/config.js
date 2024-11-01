import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAPsR9VjpGdlQCZ6ICFSYuVT798p3I-cV0",
  authDomain: "birmbook-2194f.firebaseapp.com",
  projectId: "birmbook-2194f",
  storageBucket: "birmbook-2194f.firebasestorage.app",
  messagingSenderId: "1014517381526",
  appId: "1:1014517381526:web:dc99fbbd59cac714b5c5b7",
  measurementId: "G-GCSL4VPBD9",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);

export const db = getFirestore(app);
export const storage = getStorage(app);
