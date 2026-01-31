import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAroznBpBwP_3mKuSvFywx6KVac3-Y7l4Y",
  authDomain: "neargo-9c7ab.firebaseapp.com",
  projectId: "neargo-9c7ab",
  storageBucket: "neargo-9c7ab.firebasestorage.app",
  messagingSenderId: "556224522834",
  appId: "1:556224522834:web:b16923226ef0dcd5f8cd8b",
  measurementId: "G-GCWGS1CBG0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// ... (previous imports and config remain same)

// Initialize Firestore
export const db = getFirestore(app);

// Auth Helper Functions

// 1. Sign In: Checks if user exists in DB first
export const signInWithGoogle = async () => {
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
// ... (rest remains same)
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
};
