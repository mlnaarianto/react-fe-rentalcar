import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDSq0Y956nsUDalxI6CDzaDYWPnL6Piylo",
  authDomain: "rental-b9f93.firebaseapp.com",
  projectId: "rental-b9f93",
  storageBucket: "rental-b9f93.firebasestorage.app",
  messagingSenderId: "380636655706",
  appId: "1:380636655706:web:generated_app_id"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);