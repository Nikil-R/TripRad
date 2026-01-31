import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase variables
let app;
let analytics;
let auth: any;
let googleProvider: GoogleAuthProvider;
let db: any;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);
  } else {
    console.warn("Firebase Config missing! Firebase services will not work.");
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export { auth, googleProvider, db, analytics };

// Auth Helper Functions

// 1. Sign In: Checks if user exists in DB first
export const signInWithGoogle = async () => {
    if (!auth || !db) throw new Error("Firebase not initialized");
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Check if user exists in Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // New user trying to login via Sign In page
            // We MUST sign them out so they are not authenticated in the session
            await signOut(auth);
            throw new Error("User not found. Please sign up first.");
        }

        return user;
    } catch (error) {
        console.error("Error signing in with Google", error);
        throw error;
    }
};

// 2. Sign Up: Creates new user in DB (or logs in existing)
export const signUpWithGoogle = async () => {
    if (!auth || !db) throw new Error("Firebase not initialized");
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Create user document in Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        // If user already exists, just update last login
        if (userDoc.exists()) {
             await setDoc(userDocRef, {
                lastLogin: serverTimestamp()
            }, { merge: true });
            return user;
        }

        // Only create new doc if it doesn't exist
        await setDoc(userDocRef, {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
        }, { merge: true });

        return user;
    } catch (error) {
        console.error("Error signing up with Google", error);
        throw error;
    }
};

export const logout = async () => {
    if (!auth) return;
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
};
