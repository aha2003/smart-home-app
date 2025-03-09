import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCt5_EWIYD2JzwjJyptRUSmrwrLh-bhXtc",
  authDomain: "watthomeappdevelopment.firebaseapp.com",
  projectId: "watthomeappdevelopment",
  storageBucket: "watthomeappdevelopment.firebasestorage.app",
  messagingSenderId: "1083168452059",
  appId: "1:1083168452059:web:f7b564241ccff594844bfe",
  measurementId: "G-BRBS0VE311"
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
