// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// Analytics is optional for now
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXBFnwrhM--SXqabtELIgzdtTJNW8KBfo",
  authDomain: "foodie-fd73a.firebaseapp.com",
  projectId: "foodie-fd73a",
  storageBucket: "foodie-fd73a.firebasestorage.app",
  messagingSenderId: "563612226429",
  appId: "1:563612226429:web:7ee038bf5911feb53ff214",
  measurementId: "G-YMMF78XKRE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Analytics can be added later if needed
// const analytics = getAnalytics(app);

export default app;
