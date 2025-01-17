import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js";

// Your Firebase configuration
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

window.db = db;

// Function to display room schedules
function displaySchedule(roomData) {
    const scheduleContainer = document.createElement('div');
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    daysOfWeek.forEach(day => {
        const daySchedule = roomData.schedule[day];
        if (daySchedule && daySchedule.length > 0) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day-schedule');
            dayDiv.innerHTML = `<strong>${capitalizeFirstLetter(day)}</strong>`;
            
            daySchedule.forEach(slot => {
                dayDiv.innerHTML += `
                    <p>${slot.status}</p>
                `;
            });
            scheduleContainer.appendChild(dayDiv);
        }
    });
    
    return scheduleContainer;
}

// Function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to search for rooms
async function searchRooms() {
    const user = auth.currentUser;
    if (!user) {
        alert("You need to be logged in to search for rooms.");
        return; // Don't proceed with the search if the user is not logged in
    }

    const roomType = document.getElementById('roomType').value.toLowerCase();
    const searchInput = document.getElementById('searchInput').value.toLowerCase();

    if ((searchInput.includes("ccl") && roomType === "classroom") || (searchInput.includes("classroom") && roomType === "ccl")
               || (searchInput.includes("itc") && roomType === "laboratory") || (searchInput.includes("laboratory") && roomType === "itc")
            || (searchInput.includes("os room") && roomType === "laboratory")  || (searchInput.includes("laboratory") && roomType === "os room")) {
        alert("Wrong Filter");
        return;
    }

    const featuresCheckboxes = document.querySelectorAll('input[name="features"]:checked');
    const selectedFeatures = Array.from(featuresCheckboxes).map(checkbox => checkbox.value.toLowerCase());

    if (!searchInput || !roomType) {
        alert("Please enter a room name and select a room type.");
        return;
    }

    try {
        const roomsRef = collection(db, "scheduleData");
        const querySnapshot = await getDocs(roomsRef);

        const filteredRooms = {
            classroom: [],
            laboratory: [],
            other: []
        };

        querySnapshot.forEach(doc => {
            const scheduleData = doc.data();
            const rooms = scheduleData.scheduleData[0]?.rooms || [];
            rooms.forEach(room => {
                const roomName = room.name.toLowerCase();

                if (roomName.includes(searchInput)) {
                    if (room.type.toLowerCase() === roomType) {
                        const matchesFeatures = selectedFeatures.every(feature => room.features.includes(feature));

                        if (matchesFeatures) {
                            if (room.type.toLowerCase() === "classroom") {
                                if (!filteredRooms.classroom.some(r => r.name === room.name)) {
                                    filteredRooms.classroom.push({
                                        ...room,
                                        schedule: room.schedule,
                                        id: doc.id,
                                        features: room.features || []
                                    });
                                }
                            } else if (room.type.toLowerCase() === "laboratory") {
                                if (!filteredRooms.laboratory.some(r => r.name === room.name)) {
                                    filteredRooms.laboratory.push({
                                        ...room,
                                        schedule: room.schedule,
                                        id: doc.id,
                                        features: room.features || []
                                    });
                                }
                            }
                        }
                    } else {
                        if (!filteredRooms.other.some(r => r.name === room.name)) {
                            filteredRooms.other.push({
                                ...room,
                                schedule: room.schedule,
                                id: doc.id,
                                features: room.features || []
                            });
                        }
                    }
                }
            });
        });

        const searchSummary = document.getElementById('searchSummary');
        searchSummary.textContent = `Search Results: ${searchInput} | ${roomType}`;

        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = "";

        if (filteredRooms.classroom.length > 0) {
            const classroomSection = document.createElement('div');
            classroomSection.innerHTML = "<h3>Classrooms</h3>";
            filteredRooms.classroom.forEach(room => {
                const roomCard = createRoomCard(room);
                classroomSection.appendChild(roomCard);
            });
            resultsContainer.appendChild(classroomSection);
        }

        if (filteredRooms.laboratory.length > 0) {
            const laboratorySection = document.createElement('div');
            laboratorySection.innerHTML = "<h3>Laboratories</h3>";
            filteredRooms.laboratory.forEach(room => {
                const roomCard = createRoomCard(room);
                laboratorySection.appendChild(roomCard);
            });
            resultsContainer.appendChild(laboratorySection);
        }

        if (filteredRooms.other.length > 0) {
            const otherSection = document.createElement('div');
            otherSection.innerHTML = "<h3>Other Rooms</h3>";
            filteredRooms.other.forEach(room => {
                const roomCard = createRoomCard(room);
                otherSection.appendChild(roomCard);
            });
            resultsContainer.appendChild(otherSection);
        }

        if (filteredRooms.classroom.length === 0 && filteredRooms.laboratory.length === 0 && filteredRooms.other.length === 0) {
            resultsContainer.innerHTML = "<p>No rooms found matching your criteria.</p>";
        }

    } catch (error) {
        console.error("Error getting documents: ", error);
    }
}

// Function to create a room card
function createRoomCard(room) {
    const roomCard = document.createElement('div');
    roomCard.classList.add('room-card');
    roomCard.innerHTML = `
        <p><strong>Room Name:</strong> ${room.name}</p>
        <p><strong>Room Type:</strong> ${room.type}</p>
        <p><strong>Floor:</strong> ${room.floor}</p>
        <p><strong>Features:</strong> ${room.features.join(', ')}</p>
    `;

    const reserveButton = document.createElement('button');
    reserveButton.textContent = "Reserve";
    reserveButton.classList.add('reserve-button');
    roomCard.appendChild(reserveButton);

    reserveButton.addEventListener('click', () => {
        const roomName = room.name;
        window.location.href = `room.html?room=${encodeURIComponent(roomName)}`;
    });

    return roomCard;
}

// Function to redirect to interactive map
function goToInteractiveMap() {
    console.log("Button clicked! Redirecting to interactive map...");
    window.location.href = 'interactivemap.html';
}

document.getElementById('interactiveMapButton').addEventListener('click', goToInteractiveMap);

// Attach search event listener
document.getElementById('searchButton').addEventListener('click', searchRooms);

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