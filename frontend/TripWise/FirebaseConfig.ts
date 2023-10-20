// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDeihmESn_s5jQ9M7i7zW8Siaawzs6XEzA",
  authDomain: "tripwise-3ecc6.firebaseapp.com",
  projectId: "tripwise-3ecc6",
  storageBucket: "tripwise-3ecc6.appspot.com",
  messagingSenderId: "425734765321",
  appId: "1:425734765321:web:0f41b855d2e40a45e8b1d8",
  measurementId: "G-E4W2YKXC9T",
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
const analytics = getAnalytics(FIREBASE_APP);
