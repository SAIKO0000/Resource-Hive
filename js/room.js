import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, getDocs, query, updateDoc, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

// Firebase configuration (replace with your actual config)
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
const auth = getAuth();  // Initialize Firebase Authentication

// Function to fetch room name from URL
function getRoomFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('room'); // Get the "room" parameter from the URL
}

// Function to fetch room data from Firestore
async function fetchRoomData(roomName, selectedDay) {
    try {
        const q = query(collection(db, "scheduleData"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.error("No documents found in Firestore.");
            return;
        }

        querySnapshot.forEach((docRef) => {
            const data = docRef.data();

            if (data && Array.isArray(data.scheduleData)) {
                const roomData = data.scheduleData.flatMap((entry) => entry.rooms)
                    .find((room) => room.name.trim().toLowerCase() === roomName.trim().toLowerCase());

                if (roomData) {
                    displayRoomInfo(roomData, selectedDay, docRef.id); // Pass the document ID for updates
                } else {
                    console.error(`Room "${roomName}" not found in Firestore.`);
                }
            } else {
                console.error("No 'scheduleData' array found or it's in the wrong format.");
            }
        });
    } catch (error) {
        console.error("Error fetching room data from Firestore:", error);
    }
}

// Function to display room information and schedule for a selected day
function displayRoomInfo(room, day, docId) {
    const roomInfoSection = document.querySelector('.room-info');
    roomInfoSection.innerHTML = `
        <h2>${room.name} (${room.type})</h2>
        <p>Features: ${room.features.length > 0 ? room.features.join(', ') : "None"}</p>
    `;

    displaySchedule(room, day, docId);
}

// Function to display the schedule for a specific day in a table
function displaySchedule(room, day, docId) {
    const scheduleContainer = document.querySelector('.schedule-table');
    if (!scheduleContainer) {
        console.error("No schedule container found in the DOM.");
        return;
    }

    const daySchedule = room.schedule[day.toLowerCase()];
    if (!daySchedule) {
        scheduleContainer.innerHTML = `<p>No schedule available for ${day}.</p>`;
        return;
    }

    // Create table structure for the schedule
    let tableHTML = `
        <table border="1" cellpadding="8" cellspacing="0">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${daySchedule.map(slot => `
                    <tr>
                        <td>${slot.time}</td>
                        <td>
                            ${slot.status === "Available" ? 
                                `<button class="available-slot" data-room="${room.name}" data-time="${slot.time}" data-docid="${docId}">${slot.status}</button>` 
                                : slot.status}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    scheduleContainer.innerHTML = tableHTML;

    // Add event listeners to available slots
    const availableSlots = document.querySelectorAll('.available-slot');
    availableSlots.forEach(slot => {
        slot.addEventListener('click', (event) => {
            const roomName = event.target.getAttribute('data-room');
            const time = event.target.getAttribute('data-time');
            const docId = event.target.getAttribute('data-docid');
            openTimeModal(roomName, time, docId);
        });
    });
}

// Function to open the modal and populate it with the selected time and room
function openTimeModal(roomName, time, docId) {
    const modal = document.getElementById('timeModal');
    const roomNameElement = document.getElementById('selectedRoomName');
    const timeElement = document.getElementById('reservationTime');

    roomNameElement.textContent = `Room: ${roomName}`;
    timeElement.textContent = `Time: ${time}`;
    modal.setAttribute('data-docid', docId); // Store document ID in modal
    modal.setAttribute('data-time', time); // Store selected time in modal
    modal.setAttribute('data-room', roomName); // Add this line to store room name
    modal.style.display = 'block';
}

// Function to close the modal
function closeTimeModal() {
    const modal = document.getElementById('timeModal');
    modal.style.display = 'none'; // Hide the modal
    document.getElementById('reservationReason').value = ''; // Clear the reason input
}

// Updated confirmReservation function with additional error checking
async function confirmReservation() {
    const reservationReason = document.getElementById('reservationReason').value;
    const modal = document.getElementById('timeModal');
    const docId = modal.getAttribute('data-docid');
    const time = modal.getAttribute('data-time');
    const roomName = modal.getAttribute('data-room'); // Retrieve room name

    if (!roomName) {
        alert("Room name is missing. Please try again.");
        closeTimeModal();
        return;
    }

    if (!reservationReason.trim()) {
        alert("Please enter a reason for the reservation.");
        return;
    }

    try {
        // Get the current user (from Firebase Authentication)
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to make a reservation.");
            closeTimeModal();
            return;
        }

        // Fetch the current document using the document ID
        const docRef = doc(db, "scheduleData", docId);
        const docSnapshot = await getDoc(docRef);

        if (!docSnapshot.exists()) {
            alert("Error: Document not found.");
            closeTimeModal();
            return;
        }

        const data = docSnapshot.data();

        // Update the scheduleData, but only for the specific room and time slot
        const updatedSchedule = data.scheduleData.map(entry => {
            // Only modify the entry if the room name matches
            if (entry.rooms.some(room => room.name.trim().toLowerCase() === roomName.trim().toLowerCase())) {
                entry.rooms = entry.rooms.map(room => {
                    if (room.name.trim().toLowerCase() === roomName.trim().toLowerCase()) {
                        // Only update the selected room's schedule
                        Object.keys(room.schedule).forEach(day => {
                            room.schedule[day] = room.schedule[day].map(slot => {
                                if (slot.time === time && slot.status === "Available") {
                                    return { 
                                        ...slot, 
                                        status: "Occupied", // Change status to "Occupied"
                                        reason: reservationReason, // Optionally store the reason
                                        reservedBy: user.email // Store the email of the logged-in user
                                    };
                                }
                                return slot;
                            });
                        });
                    }
                    return room;
                });
            }
            return entry;
        });

        // Update the Firestore document with the new schedule
        await updateDoc(docRef, { scheduleData: updatedSchedule });

        alert("Reservation confirmed!");
        closeTimeModal();

        // Refresh the page to reflect the updated status
        location.reload(); // Refresh the page to show the updated status
    } catch (error) {
        console.error("Error updating reservation:", error);
        alert("Error reserving the room. Please try again.");
    }
}

// Event listener for page load
document.addEventListener('DOMContentLoaded', () => {
    const roomName = getRoomFromURL();
    console.log("Fetched room name:", roomName);  // Debugging roomName

    if (!roomName) {
        console.error("Room not found in URL! Please select a valid room.");
        return;
    }

    const dayDropdown = document.querySelector('#dayDropdown');
    const selectedDay = dayDropdown.value || "monday"; // Default to "monday" if no day is selected

    fetchRoomData(roomName, selectedDay);

    dayDropdown.addEventListener('change', () => {
        const selectedDay = dayDropdown.value;
        if (selectedDay) {
            fetchRoomData(roomName, selectedDay);
        }
    });
});

document.getElementById('confirmReservationButton').addEventListener('click', confirmReservation);
