// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAiYlnrOCLKL26eJiotQeAwz4az-cD2_PY",
  authDomain: "signupproject-a9e42.firebaseapp.com",
  databaseURL: "https://signupproject-a9e42-default-rtdb.firebaseio.com",
  projectId: "signupproject-a9e42",
  storageBucket: "signupproject-a9e42.firebasestorage.app",
  messagingSenderId: "910787124422",
  appId: "1:910787124422:web:bd6c058c7a9b7d67ed0bc7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const FIREBASE_API_KEY = firebaseConfig.apiKey;
export const auth = getAuth(app);