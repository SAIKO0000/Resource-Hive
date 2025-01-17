import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

async function fetchUserDetails() {
  const user = auth.currentUser;

  if (user) {
    const userEmail = user.email;
    console.log("Logged in user:", userEmail);

    try {
      const q = query(collection(db, "accountDetails"), where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        updateProfileCard(userData, user);
      } else {
        console.log("No document found with this email!");
      }
    } catch (error) {
      console.error("Error getting document: ", error);
    }
  } else {
    console.log("No user is logged in");
  }
}

function updateProfileCard(userData, user) {
  const profileCard = document.querySelector('.profile-card');

  const profileHeader = document.createElement('h2');
  profileHeader.textContent = "PROFILE";
  profileCard.appendChild(profileHeader);

  profileHeader.style.fontSize = '36px';
  profileHeader.style.fontWeight = 'bold';
  profileHeader.style.textAlign = 'center';
  profileHeader.style.background = 'linear-gradient(135deg, #006666 0%, #008080 50%, #40E0D0 100%)';
  profileHeader.style.color = '#ffffff';
  profileHeader.style.padding = '10px';
  profileHeader.style.borderRadius = '5px';
  profileHeader.style.width = '50%';
  profileHeader.style.margin = '0 auto';

  const profileName = document.createElement('p');
  profileName.textContent = `Full Name: ${userData.fullname || "Full Name Not Available"}`;
  profileName.style.fontSize = '24px';
  profileName.style.fontWeight = 'bold';
  profileName.style.marginTop = '15px';

  const profileEmail = document.createElement('p');
  profileEmail.textContent = `Email: ${userData.email}`;
  profileEmail.style.fontSize = '20px';
  profileEmail.style.fontWeight = 'normal';
  profileEmail.style.marginTop = '10px';

  const profileContact = document.createElement('p');
  profileContact.textContent = `Contact: ${userData.contact || "N/A"}`;
  profileContact.style.fontSize = '20px';
  profileContact.style.fontWeight = 'normal';
  profileContact.style.marginTop = '10px';

  const editButton = document.createElement('button');
  editButton.textContent = "Edit Profile";
  editButton.style.marginTop = '20px';
  editButton.style.padding = '10px 20px';
  editButton.style.background = 'linear-gradient(135deg, #006666 0%, #008080 50%, #40E0D0 100%)';
  editButton.style.border = 'none';
  editButton.style.color = 'white';
  editButton.style.cursor = 'pointer';

  profileCard.innerHTML = ''; // Clear previous content
  profileCard.appendChild(profileHeader);
  profileCard.appendChild(profileName);
  profileCard.appendChild(profileEmail);
  profileCard.appendChild(profileContact);
  profileCard.appendChild(editButton);

  // When the "Edit" button is clicked, enable the fields to be editable
  editButton.addEventListener('click', () => {
    enableProfileEdit(userData, user);
  });
}

function enableProfileEdit(userData, user) {
  const profileCard = document.querySelector('.profile-card');

  // Clear the profile card
  profileCard.innerHTML = '';

  // Create input fields for editing
  const profileHeader = document.createElement('h2');
  profileHeader.textContent = "Edit Profile";
  profileCard.appendChild(profileHeader);

  profileHeader.style.fontSize = '36px';
  profileHeader.style.fontWeight = 'bold';
  profileHeader.style.textAlign = 'center';
  profileHeader.style.background = 'linear-gradient(135deg, #006666 0%, #008080 50%, #40E0D0 100%)';
  profileHeader.style.color = '#ffffff';
  profileHeader.style.padding = '10px';
  profileHeader.style.borderRadius = '5px';
  profileHeader.style.width = '40%';
  profileHeader.style.margin = '0 auto';

  // Create editable fields for fullname and contact
  const fullnameInput = document.createElement('input');
  fullnameInput.type = 'text';
  fullnameInput.value = userData.fullname || '';
  fullnameInput.placeholder = 'Full Name';
  fullnameInput.style.fontSize = '18px';
  fullnameInput.style.marginTop = '15px';

  const contactInput = document.createElement('input');
  contactInput.type = 'text';
  contactInput.value = userData.contact || '';
  contactInput.placeholder = 'Contact Number';
  contactInput.style.fontSize = '18px';
  contactInput.style.marginTop = '10px';

  const saveButton = document.createElement('button');
  saveButton.textContent = "Save Changes";
  saveButton.style.marginTop = '20px';
  saveButton.style.padding = '10px 20px';
  saveButton.style.background = 'linear-gradient(135deg, #006666 0%, #008080 50%, #40E0D0 100%)';
  saveButton.style.border = 'none';
  saveButton.style.color = 'white';
  saveButton.style.cursor = 'pointer';

  profileCard.appendChild(fullnameInput);
  profileCard.appendChild(contactInput);
  profileCard.appendChild(saveButton);

  // Save the updated data to Firestore
  saveButton.addEventListener('click', async () => {
    const updatedFullname = fullnameInput.value;
    const updatedContact = contactInput.value;

    try {
      // Update Firestore with the new details
      await setDoc(doc(db, "accountDetails", user.uid), {
        fullname: updatedFullname,
        email: user.email,
        contact: updatedContact,
        createdAt: new Date().toISOString()
      });

      // Feedback to the user
      alert('Profile updated successfully!');
      window.location.reload(); // Reload the page to update the profile card
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchUserDetails();
  } else {
    console.log("User is not logged in");
  }
});

window.onload = () => {
  fetchUserDetails();
};


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
document.addEventListener('DOMContentLoaded', function () {
  // Toggle the profile menu visibility
  function toggleProfileMenu() {
      const profileMenu = document.getElementById('profileMenu');
      profileMenu.classList.toggle('show'); // Toggle the 'show' class
  }

  // Attach the toggle function to the profile link
  const profileLink = document.querySelector('.profile-link');
  profileLink.addEventListener('click', toggleProfileMenu);
});


