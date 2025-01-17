function redirectToSearch() {
    window.location.href = "searching.html";
}

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

// JavaScript function to toggle the side panel visibility
function toggleSidePanel() {
    const sidePanel = document.getElementById('sidePanel');
    const menuToggle = document.querySelector('.menu-toggle');
  
    // Toggle the "active" class to show/hide the side panel
    sidePanel.classList.toggle('active');
    
    // Optionally, toggle the active class for the hamburger icon to show "close"
    menuToggle.classList.toggle('active');
  }
  