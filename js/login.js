import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

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

const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;

  if (!email.endsWith('@cvsu.edu.ph')) {
    loginMessage.textContent = 'Please use a CvSU email address (@cvsu.edu.ph)';
    loginMessage.style.color = 'red';
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    loginMessage.textContent = 'Login successful! Redirecting...';
    loginMessage.style.color = 'green';

    localStorage.setItem('isLoggedIn', 'true');

    history.pushState(null, null, location.href);
    window.onpopstate = function() {
        history.pushState(null, null, location.href);
    };

    if (email === 'admin@cvsu.edu.ph' && password === 'admin-firebase-visualvisionaries-2024') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'resourcehive.html';
    }
  } catch (error) {
    loginMessage.textContent = error.message;
    loginMessage.style.color = 'red';
  }
});

const googleLoginBtn = document.getElementById('google-login-btn');
const provider = new GoogleAuthProvider();

googleLoginBtn.addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (!user.email.endsWith('@cvsu.edu.ph')) {
      await auth.signOut();
      loginMessage.textContent = 'Please use your CvSU email address (@cvsu.edu.ph)';
      loginMessage.style.color = 'red';
      return;
    }

    localStorage.setItem('isLoggedIn', 'true');

    history.pushState(null, null, location.href);
    window.onpopstate = function() {
        history.pushState(null, null, location.href);
    };

    const userDoc = await getDoc(doc(db, "accountDetails", user.uid));
    
    if (!userDoc.exists()) {
      showProfileModal(user);
    } else {
      window.location.href = "resourcehive.html";
    }

  } catch (error) {
    loginMessage.textContent = error.message;
    loginMessage.style.color = "red";
  }
});

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

    closeBtn.onclick = function() {
        modal.remove();
        auth.signOut();
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.remove();
            auth.signOut();
        }
    }

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
            window.location.href = "resourcehive.html";
        } else {
            alert('Please complete all fields correctly.');
        }
    });
}

window.addEventListener("load", () => {
  if (auth.currentUser) {
      history.pushState(null, null, location.href);
      window.onpopstate = function() {
          history.pushState(null, null, location.href);
      };
  }
});

if (localStorage.getItem('isLoggedIn') === 'true') {
  history.pushState(null, null, location.href);
  window.onpopstate = function() {
      history.pushState(null, null, location.href);
  };
}

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
