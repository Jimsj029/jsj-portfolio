// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB7IsqzBhGOXLbH2pHsLmxRbNjMPaKYRhw",
  authDomain: "jsj-portfolio.firebaseapp.com",
  projectId: "jsj-portfolio",
  storageBucket: "jsj-portfolio.firebasestorage.app",
  messagingSenderId: "38459917908",
  appId: "1:38459917908:web:1d39e92c701b4de8ba0fc1",
  measurementId: "G-PC0ZH0P5ZM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };