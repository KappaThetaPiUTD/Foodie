// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdB-j--MRwYFzP_Z9R1hRQYxHtRtBMZgg",
  authDomain: "foodie-743ba.firebaseapp.com",
  projectId: "foodie-743ba",
  storageBucket: "foodie-743ba.firebasestorage.app",
  messagingSenderId: "451541406055",
  appId: "1:451541406055:web:eacf4dd92cb6f7a8905fc2",
  measurementId: "G-Q0CMWFEQFX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Firebase Auth
export const auth = getAuth(app);

/**
 * Create a new user with email and password and set their display name.
 * Returns the userCredential from Firebase.
 */
export async function createUser(email, password, displayName) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    try {
      await updateProfile(userCredential.user, { displayName });
    } catch (e) {
      // Ignore profile update failure, still return the created user
      console.warn("Failed to set displayName:", e);
    }
  }
  return userCredential;
}