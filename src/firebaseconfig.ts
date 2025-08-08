import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA6k2B3SzdVT4W6zTOJK0GxbgLcmF3SvMM",
  authDomain: "agribuddy-7aa71.firebaseapp.com",
  projectId: "agribuddy-7aa71",
  storageBucket: "agribuddy-7aa71.appspot.com", // Fix storage URL typo
  messagingSenderId: "456060451963",
  appId: "1:456060451963:web:7270de7cbf3a6c51f7f6de"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };