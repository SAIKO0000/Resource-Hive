
// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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
const signupForm = document.getElementById('signup-form');
const signupMessage = document.getElementById('signup-message');

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent default form submission

  // Get form values
  const fullname = document.getElementById('name-input').value;
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;
  const contact = document.getElementById('contact-input').value;

  // Attempt to create a new user with Firebase Authentication
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;


    alert(`Welcome, ${fullname}! Your account has been created successfully.`); // Alert added here
    signupMessage.textContent = `Welcome, ${fullname}! Your account has been created successfully.`;
    signupMessage.style.color = "green";
    
    

  } catch (error) {
    // Display error message in the message container
    signupMessage.textContent = error.message;
    signupMessage.style.color = "red";
  }
});