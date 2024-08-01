// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC5ObXZyTwFVLbPwXtAtTcsFAe-5gHT0sY",
  authDomain: "projectshell-11ee1.firebaseapp.com",
  projectId: "projectshell-11ee1",
  storageBucket: "projectshell-11ee1.appspot.com",
  messagingSenderId: "561119195035",
  appId: "1:561119195035:web:b613a048311bfaf8863b3e",
  measurementId: "G-PQHJWHVRCM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);