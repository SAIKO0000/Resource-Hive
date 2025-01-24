import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    browserSessionPersistence,
    setPersistence
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCuehkyhTTGuNFXyNEQqkERTXVkg3R6eDo",
    authDomain: "visual-visionaries.firebaseapp.com",
    projectId: "visual-visionaries",
    storageBucket: "visual-visionaries.firebasestorage.app",
    messagingSenderId: "24641645399",
    appId: "1:24641645399:web:21e2549cf65843f09a2c12",
    measurementId: "G-TQRQKBESP5"
};

// Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Element References
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');
const googleLoginBtn = document.getElementById('google-login-btn');
const resetPasswordModal = document.getElementById('resetPasswordModal');
const resetPasswordForm = document.getElementById('resetPasswordForm');
const resetMessage = document.getElementById('resetMessage');
const closeResetModal = document.getElementById('closeResetModal');

// Utility Functions
function displayMessage(element, message, isError = false) {
    element.textContent = message;
    element.style.color = isError ? 'red' : 'green';
}

function validateEmail(email) {
    return email.endsWith('@cvsu.edu.ph');
}

function handleNavigation(redirectUrl) {
    localStorage.setItem('isLoggedIn', 'true');
    history.pushState(null, null, location.href);
    window.onpopstate = () => history.pushState(null, null, location.href);
    window.location.href = redirectUrl;
}

// Login Handler
async function handleLogin(email, password, loginType = 'email') {
    try {
        // Set persistence
        await setPersistence(auth, browserSessionPersistence);

        // Validate email domain
        if (!validateEmail(email)) {
            displayMessage(loginMessage, 'Please use a CvSU email address (@cvsu.edu.ph)', true);
            return false;
        }

        let userCredential;
        if (loginType === 'email') {
            userCredential = await signInWithEmailAndPassword(auth, email, password);
        }

        displayMessage(loginMessage, 'Login successful! Redirecting...');

        // Determine redirect URL
        const redirectUrl = (email === 'admin@cvsu.edu.ph' && 
            password === 'admin-firebase-visualvisionaries-2024') 
            ? 'admin.html' 
            : 'resourcehive.html';

        handleNavigation(redirectUrl);
        return true;
    } catch (error) {
        displayMessage(loginMessage, error.message, true);
        return false;
    }
}

// Email Login Event Listener
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    await handleLogin(email, password, 'email');
});

// Google Login Event Listener
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

googleLoginBtn.addEventListener('click', async () => {
    try {
        await setPersistence(auth, browserSessionPersistence);
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        if (!validateEmail(user.email)) {
            await auth.signOut();
            displayMessage(loginMessage, 'Please use your CvSU email address (@cvsu.edu.ph)', true);
            return;
        }

        const userDoc = await getDoc(doc(db, "accountDetails", user.uid));
        
        if (!userDoc.exists()) {
            showProfileModal(user);
        } else {
            handleNavigation("resourcehive.html");
        }
    } catch (error) {
        displayMessage(loginMessage, error.message, true);
    }
});

// Password Reset Modal Functionality
document.getElementById('forgot-password-link').addEventListener('click', () => {
    resetPasswordModal.style.display = 'block';
});

closeResetModal.onclick = () => resetPasswordModal.style.display = 'none';
window.onclick = (event) => {
    if (event.target === resetPasswordModal) {
        resetPasswordModal.style.display = 'none';
    }
};

// Password Reset Handler
resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;

    if (!validateEmail(email)) {
        displayMessage(resetMessage, 'Please use a CvSU email address', true);
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        displayMessage(resetMessage, 'Password reset link sent! Check your email.');
        
        setTimeout(() => {
            resetPasswordModal.style.display = 'none';
            resetMessage.textContent = '';
        }, 3000);
    } catch (error) {
        displayMessage(resetMessage, `Error: ${error.message}`, true);
    }
});

// Profile Completion Modal
function showProfileModal(user) {
    const modalHTML = `
        <div id="profile-modal" class="modal">
            <div class="modal-content">
                <span class="close-btn" id="closeBtn">&times;</span>
                <h2>Complete Your Profile</h2>
                <form id="profile-completion-form">
                    <div class="form-group">
                        <label for="fullname-input">Full Name</label>
                        <input type="text" id="fullname-input" placeholder="Enter your full name" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-input">Contact Number</label>
                        <input type="tel" id="contact-input" placeholder="11-digit number" required pattern="^[0-9]{11}$">
                    </div>
                    <button type="submit" class="submit-btn">Done</button>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('profile-modal');
    const form = document.getElementById('profile-completion-form');
    const closeBtn = document.getElementById('closeBtn');

    const closeModal = () => {
        modal.remove();
        auth.signOut();
    };

    closeBtn.onclick = closeModal;
    window.onclick = (event) => {
        if (event.target == modal) closeModal();
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullname = document.getElementById('fullname-input').value.trim();
        const contact = document.getElementById('contact-input').value.trim();

        if (fullname && contact) {
            const contactRegex = /^[0-9]{11}$/;
            if (!contactRegex.test(contact)) {
                alert('Please enter a valid 11-digit contact number.');
                return;
            }

            await setDoc(doc(db, "accountDetails", user.uid), {
                fullname: fullname,
                email: user.email,
                contact: contact,
                createdAt: new Date().toISOString(),
            });

            modal.remove();
            handleNavigation("resourcehive.html");
        } else {
            alert('Please complete all fields correctly.');
        }
    });
}

// Logout Function
function logout() {
    localStorage.removeItem('isLoggedIn');
    auth.signOut().then(() => {
        window.onpopstate = null;
        history.pushState(null, null, location.href);
        window.location.href = 'login.html';
    }).catch(error => {
        console.error("Logout failed:", error);
    });
}

// Navigation and Login Status Handling
window.addEventListener("load", () => {
    if (auth.currentUser || localStorage.getItem('isLoggedIn') === 'true') {
        history.pushState(null, null, location.href);
        window.onpopstate = () => history.pushState(null, null, location.href);
    }
});

// Expose logout function globally if needed
window.logout = logout;
