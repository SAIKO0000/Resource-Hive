import { 
    initializeApp 
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    getDocs, 
    query, 
    where, // <-- Added where
    updateDoc, 
    doc, 
    getDoc, 
    addDoc, 
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { 
    getAuth, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

// Firebase configuration
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
const auth = getAuth();

/**
 * Function to close the time modal.
 */
function closeTimeModal() {
    const modal = document.getElementById('timeModal');
    modal.style.display = 'none';
    document.getElementById('reservationReason').value = '';
}

/**
 * Function to open the time reservation modal.
 * @param {Array} selectedSlots - The selected time slots.
 */
function openTimeModal(selectedSlots) {
    const modal = document.getElementById('timeModal');
    const roomNameElement = document.getElementById('selectedRoomName');
    const timeElement = document.getElementById('reservationTime');

    roomNameElement.textContent = `Room: ${selectedSlots[0].room}`;
    timeElement.textContent = `Times: ${selectedSlots.map(slot => slot.time).join(', ')}`;
    modal.setAttribute('data-selected-slots', JSON.stringify(selectedSlots));
    modal.style.display = 'block';
}

/**
 * Function to get the room name from the URL parameters.
 * @returns {string|null} The room name or null if not found.
 */
function getRoomFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('room');
}

/**
 * Function to fetch room data from Firestore.
 * @param {string} roomName - The name of the room.
 * @param {string} selectedDay - The selected day for the schedule.
 */
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
                    displayRoomInfo(roomData, selectedDay, docRef.id);
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

/**
 * Function to display room information in the UI.
 * @param {Object} room - The room data.
 * @param {string} day - The selected day.
 * @param {string} docId - The Firestore document ID.
 */
function displayRoomInfo(room, day, docId) {
    const roomInfoSection = document.querySelector('.room-info');
    roomInfoSection.innerHTML = `
        <h2>${room.name} (${room.type})</h2>
        <p>Features: ${room.features.length > 0 ? room.features.join(', ') : "None"}</p>
    `;

    displaySchedule(room, day, docId);
}

/**
 * Function to fetch reserved data from Firestore.
 * @param {string} roomName - The name of the room.
 * @param {string} day - The selected day.
 * @returns {Array} An array of reserved slots.
 */
async function fetchReservedData(roomName, day) { // <-- Added day parameter
    const reservedData = [];
    try {
        const q = query(
            collection(db, "updatedSchedule"),
            where("room", "==", roomName),
            where("day", "==", day) // <-- Added day filter
        );
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(doc => {
            const data = doc.data();
            // Ensure that 'reservedBy' exists and is not empty
            if (data.reservedBy && data.reservedBy.trim() !== "") {
                reservedData.push(data);
            }
        });
    } catch (error) {
        console.error("Error fetching reserved data:", error);
    }
    return reservedData;
}

/**
 * Function to display the schedule for a specific day.
 * @param {Object} room - The room data.
 * @param {string} day - The selected day.
 * @param {string} docId - The Firestore document ID.
 */
async function displaySchedule(room, day, docId) {
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

    const reservedData = await fetchReservedData(room.name, day); // <-- Pass day

    let tableHTML = `
        <table border="1" cellpadding="8" cellspacing="0">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${daySchedule.map(slot => {
                    const reservation = reservedData.find(res => res.time === slot.time);
                    const rowClass = slot.status === "Available" ? "status-available" : "status-occupied";
                    return `
                        <tr class="${rowClass}">
                            <td>${slot.time}</td>
                            <td>
                                ${slot.status === "Available" ? `
                                    Available
                                    <input type="checkbox" class="select-slot" 
                                        data-time="${slot.time}" 
                                        data-docid="${docId}" 
                                        data-room="${room.name}" 
                                        style="margin-left: 10px;">
                                ` : `
                                    Occupied
                                    ${reservation ? `<br><small>Reserved By: ${reservation.reservedBy}</small>` : ''}
                                `}
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;

    scheduleContainer.innerHTML = tableHTML;

    const openModalButton = document.createElement('button');
    openModalButton.textContent = "Reserve Selected Times";
    openModalButton.classList.add('open-modal-btn');
    openModalButton.addEventListener('click', () => {
        const selectedSlots = Array.from(document.querySelectorAll('.select-slot:checked')).map(slot => ({
            time: slot.getAttribute('data-time'),
            room: slot.getAttribute('data-room'),
            docId: slot.getAttribute('data-docid')
        }));

        if (selectedSlots.length > 0) {
            openTimeModal(selectedSlots);
        } else {
            alert("Please select at least one time slot.");
        }
    });

    scheduleContainer.appendChild(openModalButton);
}

/**
 * Function to confirm reservations.
 */
async function confirmReservation() {
    const reservationReason = document.getElementById('reservationReason').value;
    const modal = document.getElementById('timeModal');
    const selectedSlots = JSON.parse(modal.getAttribute('data-selected-slots'));

    if (!reservationReason.trim()) {
        alert("Please enter a reason for the reservation.");
        return;
    }

    try {
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to make a reservation.");
            closeTimeModal();
            return;
        }

        const dayDropdown = document.querySelector('#dayDropdown');
        const selectedDay = dayDropdown.value || "monday";

        for (const { docId, time, room } of selectedSlots) {
            const docRef = doc(db, "scheduleData", docId);
            const docSnapshot = await getDoc(docRef);

            if (!docSnapshot.exists()) {
                alert(`Error: Document for time "${time}" not found.`);
                continue;
            }

            const data = docSnapshot.data();
            const roomData = data.scheduleData.flatMap(entry => entry.rooms).find(r => r.name.trim().toLowerCase() === room.trim().toLowerCase());

            if (!roomData) {
                console.error(`Room data not found for room: ${room}`);
                continue;
            }

            const roomType = roomData.type || 'Unknown';
            const features = roomData.features || [];

            const updatedSchedule = data.scheduleData.map(entry => {
                if (entry.rooms.some(r => r.name.trim().toLowerCase() === room.trim().toLowerCase())) {
                    entry.rooms = entry.rooms.map(r => {
                        if (r.name.trim().toLowerCase() === room.trim().toLowerCase()) {
                            Object.keys(r.schedule).forEach(dayKey => {
                                if (dayKey.toLowerCase() === selectedDay.toLowerCase()) {
                                    r.schedule[dayKey] = r.schedule[dayKey].map(slot => {
                                        if (slot.time === time && slot.status === "Available") {
                                            return { 
                                                ...slot, 
                                                status: "Occupied", 
                                                reason: reservationReason, 
                                                reservedBy: user.email 
                                            };
                                        }
                                        return slot;
                                    });
                                }
                            });
                        }
                        return r;
                    });
                }
                return entry;
            });

            await updateDoc(docRef, { scheduleData: updatedSchedule });

            const reservationData = {
                room,
                roomType,
                features,
                reservedBy: user.email,
                time,
                reason: reservationReason,
                status: "Occupied",
                day: selectedDay,
                createdAt: serverTimestamp() // <-- Use serverTimestamp here
            };

            await addDoc(collection(db, "updatedSchedule"), reservationData);
        }

        // Dispatch the event after the reservation is confirmed
        const event = new Event('reservationConfirmed');
        document.dispatchEvent(event);

        alert("Reservations confirmed!");
        closeTimeModal();

        // Dynamically update the schedule table without reloading the page
        selectedSlots.forEach(slot => {
            const rows = document.querySelectorAll('.schedule-table tbody tr');
            rows.forEach(row => {
                const timeCell = row.querySelector('td:first-child');
                if (timeCell.textContent.trim() === slot.time) {
                    const statusCell = row.querySelector('td:nth-child(2)');
                    statusCell.innerHTML = `
                        Occupied<br><small>Reserved By: ${user.email}</small>
                    `;
                    const checkbox = statusCell.querySelector('.select-slot');
                    if (checkbox) checkbox.remove();
                }
            });
        });
    } catch (error) {
        console.error("Error confirming reservations:", error);
        alert("Error reserving the selected times. Please try again.");
    } finally {
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const roomName = getRoomFromURL();
    console.log("Fetched room name:", roomName);

    if (!roomName) {
        console.error("Room not found in URL! Please select a valid room.");
        return;
    }

    const dayDropdown = document.querySelector('#dayDropdown');
    const selectedDay = dayDropdown.value || "";

    if (selectedDay) {
        fetchRoomData(roomName, selectedDay);
    }

    dayDropdown.addEventListener('change', () => {
        const selectedDay = dayDropdown.value;
        if (selectedDay) {
            fetchRoomData(roomName, selectedDay);
        } else {
            document.querySelector('.schedule-table').innerHTML = `<p>Please select a day to view the schedule.</p>`;
        }
    });
});

const confirmButton = document.getElementById('confirmReservationButton');
if (confirmButton) {
    confirmButton.addEventListener('click', confirmReservation);
}

/**
 * Function to toggle the profile menu visibility.
 */
function toggleProfileMenu() {
    const profileMenu = document.getElementById('profileMenu');
    
    // Toggle the "show" class to display or hide the menu
    profileMenu.classList.toggle('show');
}

/**
 * Function to close the profile menu if clicked anywhere outside.
 */
window.onclick = function(event) {
    const profileMenu = document.getElementById('profileMenu');
    const profileIcon = document.querySelector('.profile-link');
    
    if (profileIcon && !profileIcon.contains(event.target)) {
        profileMenu.classList.remove('show');
    }
};

/**
 * Function to toggle the side panel visibility.
 */
function toggleSidePanel() {
    const sidePanel = document.getElementById('sidePanel');
    if (sidePanel) {
        sidePanel.classList.toggle('active');
    }
}

/**
 * Function to scroll the window to the top smoothly.
 */
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
