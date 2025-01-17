// Get references to all pop-up windows
const window1st = document.getElementById("window-1st");
const window2nd = document.getElementById("window-2nd");
const window3rd = document.getElementById("window-3rd");
const window4th = document.getElementById("window-4th");
const window5th = document.getElementById("window-5th");

// Get the select element to listen for floor changes
const levelSelect = document.getElementById("Level");

// Variable to track the currently selected floor
let currentFloor = null;

// Function to hide all pop-ups
function hideAllPopUps() {
    window1st.style.display = "none";
    window2nd.style.display = "none";
    window3rd.style.display = "none";
    window4th.style.display = "none";
    window5th.style.display = "none";
}

// Function to show the selected pop-up based on selected floor
levelSelect.addEventListener("change", function(event) {
    const selectedLevel = event.target.value;

    // Hide all pop-ups before showing the selected one
    hideAllPopUps();

    // Show the pop-up for the selected floor
    if (selectedLevel === "1st-floor") {
        window1st.style.display = "block"; // Show 1st-floor pop-up
    } else if (selectedLevel === "2nd-floor") {
        window2nd.style.display = "block"; // Show 2nd-floor pop-up
    } else if (selectedLevel === "3rd-floor") {
        window3rd.style.display = "block"; // Show 3rd-floor pop-up
    } else if (selectedLevel === "4th-floor") {
        window4th.style.display = "block"; // Show 4th-floor pop-up
    } else if (selectedLevel === "5th-floor") {
        window5th.style.display = "block"; // Show 5th-floor pop-up
    }

    // Update the current floor to the newly selected one
    currentFloor = selectedLevel;
});

// Get references to close buttons for each floor's pop-up
const closeButton1st = document.getElementById("close-btn-1st");
const closeButton2nd = document.getElementById("close-btn-2nd");
const closeButton3rd = document.getElementById("close-btn-3rd");
const closeButton4th = document.getElementById("close-btn-4th");
const closeButton5th = document.getElementById("close-btn-5th");

// Add event listeners to close buttons
closeButton1st.addEventListener("click", () => {
    window1st.style.display = "none"; // Hide the 1st-floor pop-up
    currentFloor = null; // Reset currentFloor so it can be opened again
    levelSelect.selectedIndex = 0; // Reset the select dropdown to the default option
});

closeButton2nd.addEventListener("click", () => {
    window2nd.style.display = "none"; // Hide the 2nd-floor pop-up
    currentFloor = null; // Reset currentFloor so it can be opened again
    levelSelect.selectedIndex = 0; // Reset the select dropdown to the default option
});

closeButton3rd.addEventListener("click", () => {
    window3rd.style.display = "none"; // Hide the 3rd-floor pop-up
    currentFloor = null; // Reset currentFloor so it can be opened again
    levelSelect.selectedIndex = 0; // Reset the select dropdown to the default option
});

closeButton4th.addEventListener("click", () => {
    window4th.style.display = "none"; // Hide the 4th-floor pop-up
    currentFloor = null; // Reset currentFloor so it can be opened again
    levelSelect.selectedIndex = 0; // Reset the select dropdown to the default option
});

closeButton5th.addEventListener("click", () => {
    window5th.style.display = "none"; // Hide the 5th-floor pop-up
    currentFloor = null; // Reset currentFloor so it can be opened again
    levelSelect.selectedIndex = 0; // Reset the select dropdown to the default option
});

// Function to redirect to room schedule page with the room name in the URL
function goToRoomSchedule(roomName) {
    // Correct URL format to include the room name as a query parameter
    window.location.href = `room.html?room=${encodeURIComponent(roomName)}`;
}

// Example of how a button for a room should be handled
document.querySelectorAll('.F1Btn').forEach(button => {
    button.addEventListener('click', function() {
        const roomName = this.textContent; // Use button text as room name
        goToRoomSchedule(roomName); // Redirect to room schedule page
    });
});

console.log("Ready to fetch room schedule data when room is selected.");

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

 // JavaScript function to toggle the side panel visibility
    function toggleSidePanel() {
            const sidePanel = document.getElementById('sidePanel');
            const menuToggle = document.querySelector('.menu-toggle');
          
            // Toggle the "active" class to show/hide the side panel
            sidePanel.classList.toggle('active');
            
            // Optionally, toggle the active class for the hamburger icon to show "close"
            menuToggle.classList.toggle('active');
          }
          


