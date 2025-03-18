import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDF4iKDYFjZXroC0e0J4uJtxw7gegecf8o",
  authDomain: "inovact-jobs.firebaseapp.com",
  projectId: "inovact-jobs",
  storageBucket: "inovact-jobs.firebasestorage.app",
  messagingSenderId: "416819596735",
  appId: "1:416819596735:web:8303d248d78aaba65d250a",
  measurementId: "G-KR9LC53VF3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
