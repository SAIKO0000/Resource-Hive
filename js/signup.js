import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCuehkyhTTGuNFXyNEQqkERTXVkg3R6eDo",
  authDomain: "visual-visionaries.firebaseapp.com",
  projectId: "visual-visionaries",
  storageBucket: "visual-visionaries.firebasestorage.app",
  messagingSenderId: "24641645399",
  appId: "1:24641645399:web:21e2549cf65843f09a2c12",
  measurementId: "G-TQRQKBESP5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signupForm = document.getElementById('signup-form');
const signupMessage = document.getElementById('signup-message');

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const fullname = document.getElementById('name-input').value;
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;
  const confirmPassword = document.getElementById('confirm-password-input').value; // New line
  const contact = document.getElementById('contact-input').value;

  // Add password confirmation check
  if (password !== confirmPassword) {
      signupMessage.textContent = "Passwords do not match!";
      signupMessage.style.color = "red";
      return;
  }

  if (!email.endsWith('@cvsu.edu.ph')) {
      signupMessage.textContent = "Please enter a valid CvSU email address (example: name@cvsu.edu.ph).";
      signupMessage.style.color = "red";
      return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user details in Firestore under 'accountDetails' collection
    await setDoc(doc(db, "accountDetails", user.uid), {
      fullname: fullname,
      email: user.email, // Save the authenticated email
      contact: contact,
      createdAt: new Date().toISOString()
    });

    alert(`Welcome, ${fullname}! Your account has been created successfully.`);
    signupMessage.textContent = `Welcome, ${fullname}! Your account has been created successfully.`;
    signupMessage.style.color = "green";

    // Optionally, you can redirect the user after signup
    // window.location.href = 'resourcehive.html';

  } catch (error) {
    signupMessage.textContent = error.message;
    signupMessage.style.color = "red";
  }
});

// Prevent the back button if the user is logged in
window.addEventListener("load", () => {
  const user = auth.currentUser;
  if (user) {
      // Ensure the user cannot go back to login page if already logged in
      history.pushState(null, null, location.href);
      window.onpopstate = function() {
          history.pushState(null, null, location.href);
      };
  }
});

// Logout button functionality
const logoutBtn = document.getElementById('logout-btn');
logoutBtn.addEventListener('click', async () => {
  // Log the user out
  await auth.signOut();
  
  // Redirect to login page
  window.location.href = 'login.html';

  // Clear back button prevention logic after logout
  history.pushState(null, null, location.href);
  window.onpopstate = function() {
      history.go(1); // Allow normal back navigation after logout
  };

  // Remove login status from localStorage
  localStorage.removeItem('isLoggedIn');
});

// Store login status when the user logs in (already part of your login flow)
localStorage.setItem('isLoggedIn', 'true');

// Apply back button prevention when the page loads, based on login status
if (localStorage.getItem('isLoggedIn') === 'true') {
  // Apply back button prevention logic
  history.pushState(null, null, location.href);
  window.onpopstate = function() {
      history.pushState(null, null, location.href);
  };
}


// Add this line at the top of your file
window.togglePassword = function(inputId, toggleElement) {
    const input = document.getElementById(inputId);
    const icon = toggleElement.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
}

