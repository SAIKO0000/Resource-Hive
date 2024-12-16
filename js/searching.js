// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export the db to use it globally
window.db = db;

// Function to display room schedules (without time and status)
function displaySchedule(roomData) {
    const scheduleContainer = document.createElement('div');
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    // Loop through days of the week and create a display for each
    daysOfWeek.forEach(day => {
        const daySchedule = roomData.schedule[day]; // Get the schedule for that day
        if (daySchedule && daySchedule.length > 0) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day-schedule');
            dayDiv.innerHTML = `<strong>${capitalizeFirstLetter(day)}</strong>`;
            
            // Loop through each time slot for the day and display it
            // Remove time and status information here
            daySchedule.forEach(slot => {
                // Only show the slot's available status (or other necessary info, if required)
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

async function searchRooms() {
    const roomType = document.getElementById('roomType').value.toLowerCase(); // Get selected room type
    const searchInput = document.getElementById('searchInput').value.toLowerCase(); // Get the search input

    console.log("Room Type:", roomType); // Log selected room type
    console.log("Search Input:", searchInput); // Log search input

    // Check for conflicting search and room type
    if ((searchInput.includes("ccl") && roomType === "classroom") || (searchInput.includes("classroom") && roomType === "ccl")) {
        alert("COMMON SENSE NALANG, CCL SINEARCH MO TAPOS IFIFILTER MO NG CLASSROOM!!");
        return; // Exit the function early if the conflict occurs
    }

    // Get selected features from the checkboxes
    const featuresCheckboxes = document.querySelectorAll('input[name="features"]:checked');
    const selectedFeatures = Array.from(featuresCheckboxes).map(checkbox => checkbox.value.toLowerCase());
    console.log("Selected Features:", selectedFeatures); // Log selected features

    // Validate that both room name and type are entered
    if (!searchInput || !roomType) {
        alert("Please enter a room name and select a room type.");
        return;
    }

    try {
        const roomsRef = collection(db, "scheduleData");  // Access Firestore collection
        const querySnapshot = await getDocs(roomsRef);  // Get all documents

        const filteredRooms = {
            classroom: [],
            laboratory: [],
            other: []
        };

        querySnapshot.forEach(doc => {
            const scheduleData = doc.data();  // Get schedule data from the document
            console.log("Schedule Data from Firestore:", scheduleData); // Debug log to inspect fetched data

            const rooms = scheduleData.scheduleData[0]?.rooms || [];  // Get rooms array from the first scheduleData
            rooms.forEach(room => {
                console.log("Room Data:", room); // Log each room data

                const roomName = room.name.toLowerCase();
                console.log("Room Name:", roomName); // Log room name for matching

                // Match room name based on search input
                if (roomName.includes(searchInput)) {
                    console.log("Room matches search input:", room);

                    // Check for type match (Classroom or Laboratory)
                    if (room.type.toLowerCase() === roomType) {
                        const matchesFeatures = selectedFeatures.every(feature => room.features.includes(feature));
                        console.log("Matches Features:", matchesFeatures);

                        if (matchesFeatures) {
                            if (room.type.toLowerCase() === "classroom") {
                                if (!filteredRooms.classroom.some(r => r.name === room.name)) {
                                    filteredRooms.classroom.push({
                                        ...room,
                                        schedule: room.schedule,
                                        id: doc.id,  // Add document ID to the filtered room
                                        features: room.features || [] // Ensure features exist
                                    });
                                }
                            } else if (room.type.toLowerCase() === "laboratory") {
                                if (!filteredRooms.laboratory.some(r => r.name === room.name)) {
                                    filteredRooms.laboratory.push({
                                        ...room,
                                        schedule: room.schedule,
                                        id: doc.id,  // Add document ID to the filtered room
                                        features: room.features || [] // Ensure features exist
                                    });
                                }
                            }
                        }
                    } else {
                        // If room type is neither Classroom nor Laboratory, push to 'other' category
                        if (!filteredRooms.other.some(r => r.name === room.name)) {
                            filteredRooms.other.push({
                                ...room,
                                schedule: room.schedule,
                                id: doc.id,  // Add document ID to the filtered room
                                features: room.features || [] // Ensure features exist
                            });
                        }
                    }
                }
            });
        });

        // Display the search summary and results
        const searchSummary = document.getElementById('searchSummary');
        searchSummary.textContent = `Search Results: ${searchInput} | ${roomType}`;

        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = ""; // Clear previous results

        // Display results for Classroom type
        if (filteredRooms.classroom.length > 0) {
            const classroomSection = document.createElement('div');
            classroomSection.innerHTML = "<h3>Classrooms</h3>";
            filteredRooms.classroom.forEach(room => {
                const roomCard = createRoomCard(room);
                classroomSection.appendChild(roomCard);
            });
            resultsContainer.appendChild(classroomSection);
        }

        // Display results for Laboratory type
        if (filteredRooms.laboratory.length > 0) {
            const laboratorySection = document.createElement('div');
            laboratorySection.innerHTML = "<h3>Laboratories</h3>";
            filteredRooms.laboratory.forEach(room => {
                const roomCard = createRoomCard(room);
                laboratorySection.appendChild(roomCard);
            });
            resultsContainer.appendChild(laboratorySection);
        }

        // Display results for other types
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


function createRoomCard(room) {
    const roomCard = document.createElement('div');
    roomCard.classList.add('room-card');
    roomCard.innerHTML = `
        <p><strong>Room Name:</strong> ${room.name}</p>
        <p><strong>Room Type:</strong> ${room.type}</p>
        <p><strong>Floor:</strong> ${room.floor}</p>
        <p><strong>Features:</strong> ${room.features.join(', ')}</p>
    `;

    // Removed the schedule display

    const reserveButton = document.createElement('button');
    reserveButton.textContent = "Reserve";
    reserveButton.classList.add('reserve-button');
    roomCard.appendChild(reserveButton);

    reserveButton.addEventListener('click', () => {
        // Store room details in localStorage or pass as query parameters
        const roomName = room.name;
        window.location.href = `room.html?room=${encodeURIComponent(roomName)}`;
    });
    

    return roomCard;
}

// This is the function for handling the View Floors button click
function goToInteractiveMap() {
    // Log the button click to ensure it works
    console.log("Button clicked! Redirecting to interactive map...");
    // Redirect to the interactive map page
    window.location.href = 'interactivemap.html';
}

// Add event listener for the button (alternative method to inline onclick)
document.getElementById('interactiveMapButton').addEventListener('click', goToInteractiveMap);



document.getElementById('searchButton').addEventListener('click', searchRooms);
