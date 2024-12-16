// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCuehkyhTTGuNFXyNEQqkERTXVkg3R6eDo",
    authDomain: "visual-visionaries.firebaseapp.com",
    projectId: "visual-visionaries",
    storageBucket: "visual-visionaries.firebasestorage.app",
    messagingSenderId: "24641645399",
    appId: "1:24641645399:web:21e2549cf65843f09a2c12",
    measurementId: "G-TQRQKBESP5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
