// main.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

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
const db = getFirestore(app);

// Function to store data in Firestore (only one declaration needed)
async function storeScheduleData(scheduleData) {
  try {
    const scheduleRef = collection(db, "scheduleData");
    const docRef = await addDoc(scheduleRef, scheduleData);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

// Fetch the schedule data from the JSON file
fetch('./json/scheduleData.json')  // Adjust this path to your folder structure
  .then(response => response.json())
  .then(data => {
    const scheduleData = data;  // Use the fetched JSON data
    console.log("Schedule Data Loaded:", scheduleData);  // Check if the data is loaded correctly
    // Proceed with storing the schedule data in Firestore
    storeScheduleData(scheduleData);
  })
  .catch(error => {
    console.error("Error loading schedule data:", error);  // Handle any errors
  });
