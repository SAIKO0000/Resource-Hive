// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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
const auth = getAuth(app);

// Get references to the form and message container
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent default form submission

  // Get form values
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;

  // Attempt to log in the user with Firebase Authentication
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Display success message and redirect
    loginMessage.textContent = `Login successful! Redirecting...`;
    loginMessage.style.color = "green";

    // Redirect to resourcehive.html
    window.location.href = "resourcehive.html";

  } catch (error) {
    // Display error message
    loginMessage.textContent = error.message;
    loginMessage.style.color = "red";
  }
});
