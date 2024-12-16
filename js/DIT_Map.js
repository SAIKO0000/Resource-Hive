// Get references to all pop-up windows
const window1st = document.getElementById("window-1st");
const window2nd = document.getElementById("window-2nd");
const window3rd = document.getElementById("window-3rd");
const window4th = document.getElementById("window-4th");
const window5th = document.getElementById("window-5th");

// Get the select element to listen for floor changes
const levelSelect = document.getElementById("Level");

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
});

closeButton2nd.addEventListener("click", () => {
    window2nd.style.display = "none"; // Hide the 2nd-floor pop-up
});

closeButton3rd.addEventListener("click", () => {
    window3rd.style.display = "none"; // Hide the 3rd-floor pop-up
});

closeButton4th.addEventListener("click", () => {
    window4th.style.display = "none"; // Hide the 4th-floor pop-up
});

closeButton5th.addEventListener("click", () => {
    window5th.style.display = "none"; // Hide the 5th-floor pop-up
});

// Function to redirect to room schedule page with the room name in the URL
// This function redirects to the room schedule page with the room name as a query parameter
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
