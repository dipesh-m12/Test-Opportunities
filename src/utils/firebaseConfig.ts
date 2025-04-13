import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, getFirestore } from "firebase/firestore";

// Inovact Jobs
// const firebaseConfig = {
//   apiKey: "AIzaSyDF4iKDYFjZXroC0e0J4uJtxw7gegecf8o",
//   authDomain: "inovact-jobs.firebaseapp.com",
//   projectId: "inovact-jobs",
//   storageBucket: "inovact-jobs.firebasestorage.app",
//   messagingSenderId: "416819596735",
//   appId: "1:416819596735:web:8303d248d78aaba65d250a",
//   measurementId: "G-KR9LC53VF3",
// };

//Dipesh Inovact Opportunities
// const firebaseConfig = {
//   apiKey: "AIzaSyB4sYfNO7AVSoPwMg7nP6Fqt_sMsfxU-0Y",
//   authDomain: "inovactopportunity.firebaseapp.com",
//   projectId: "inovactopportunity",
//   storageBucket: "inovactopportunity.firebasestorage.app",
//   messagingSenderId: "725526933555",
//   appId: "1:725526933555:web:e68dfae949f5e364967346",
//   measurementId: "G-EGJVG6PYZ0",
// };

//Inovact Social
const firebaseConfig = {
  apiKey: "AIzaSyA-WIjsNx5ntNCZzh01vp6WAOOdN0a1Qek",
  authDomain: "inovact-social.firebaseapp.com",
  databaseURL:
    "https://inovact-social-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "inovact-social",
  storageBucket: "inovact-social.firebasestorage.app",
  messagingSenderId: "235607756881",
  appId: "1:235607756881:web:09aea30e904c563cf0e870",
  measurementId: "G-NMY8GTZG34",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const firestore = getFirestore(app);
export const requests = collection(firestore, "Requests");
