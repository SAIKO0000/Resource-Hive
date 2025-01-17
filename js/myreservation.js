import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    getDoc,
    deleteDoc,
    orderBy, // Import orderBy for sorting
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

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
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Function to fetch reservation history for the logged-in user.
 * Reservations are sorted with the latest reservations at the top.
 */
async function fetchReservationHistory() {
    const user = auth.currentUser;

    if (!user) {
        alert("You must be logged in to view your reservation history.");
        return;
    }

    try {
        const reservationQuery = query(
            collection(db, 'updatedSchedule'),
            where('reservedBy', '==', user.email),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(reservationQuery);

        if (querySnapshot.empty) {
            document.querySelector('#reservationHistory').innerHTML = "<p>No reservations found.</p>";
            return;
        }

        const reservationHistoryHTML = querySnapshot.docs.map((doc) => {
            const reservation = doc.data();
            const docId = doc.id;

            const roomName = reservation.room || 'N/A';
            const roomType = reservation.roomType || 'N/A';
            const reservationDay = reservation.day || 'N/A';
            const reservationTime = reservation.time || 'N/A';
            const reservationReason = reservation.reason || 'N/A';
            const roomFeatures = reservation.features && Array.isArray(reservation.features)
                ? reservation.features.join(', ')
                : 'No features available';
            const status = reservation.status || 'N/A';
            const createdAt = reservation.createdAt && typeof reservation.createdAt.toDate === 'function' 
                ? reservation.createdAt.toDate() 
                : null; 
            const canceledAt = reservation.canceledAt && typeof reservation.canceledAt.toDate === 'function'
                ? reservation.canceledAt.toDate()
                : null;

            const formattedDate = createdAt
                ? createdAt.toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })
                : 'N/A';

            const formattedCanceledDate = canceledAt
                ? canceledAt.toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })
                : '';

            // Check if the reservation is older than 10 minutes
            const currentTime = new Date();
            const timeDifference = (currentTime - createdAt) / (1000 * 60); // Difference in minutes

            // Conditionally add cancel button based on reservation time
            const cancelButton = timeDifference < 10 && status === "Occupied" 
                ? `<button class="cancel-btn" data-doc-id="${docId}" data-room-name="${roomName}" data-day="${reservationDay}" data-time="${reservationTime}">Cancel</button>`
                : '';

            return `
                <tr>
                    <td>${roomName}</td>
                    <td>${reservationDay}</td>
                    <td>${reservationTime}</td>
                    <td>${reservationReason}</td>
                    <td>
                        ${formattedDate}
                        ${canceledAt ? `<br><small>Canceled At: ${formattedCanceledDate}</small>` : ''}
                    </td>
                    <td>
                        ${cancelButton}
                    </td>
                </tr>
            `;
        });

        document.querySelector('#reservationHistory tbody').innerHTML = reservationHistoryHTML.join('');

        document.querySelectorAll('.cancel-btn').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const docId = event.target.getAttribute('data-doc-id');
                const roomName = event.target.getAttribute('data-room-name');
                const day = event.target.getAttribute('data-day');
                const time = event.target.getAttribute('data-time');
                await cancelReservation(docId, roomName, day, time);
            });
        });

    } catch (error) {
        console.error("Error fetching reservation history:", error);
        alert("Error fetching reservation history. Please try again.");
    }
}


/**
 * Function to cancel a reservation.
 * Updates the reservation status to "Available" and removes reservedBy and reason fields.
 * Also updates the corresponding slot in scheduleData to "Available".
 * @param {string} docId - The document ID of the reservation to cancel.
 * @param {string} roomName - The name of the room.
 * @param {string} day - The day of the reservation.
 * @param {string} time - The time slot of the reservation.
 */
async function cancelReservation(docId, roomName, day, time) {
    const user = auth.currentUser;

    if (!user) {
        alert("You must be logged in to cancel a reservation.");
        return;
    }

    try {
        // Step 1: Get the current reservation details
        const reservationRef = doc(db, 'updatedSchedule', docId);
        const reservationSnapshot = await getDoc(reservationRef);

        if (reservationSnapshot.exists()) {
            const reservationData = reservationSnapshot.data();
            console.log("Reservation data found:", reservationData);

            // Step 2: Update the reservation status to "Available" and remove reservedBy and reason
            await updateDoc(reservationRef, {
                status: "Available",           // Change status to Available
                reservedBy: "",                // Clear the reservedBy field
                reason: "",                    // Clear the reason field
                canceledAt: serverTimestamp()   // Add canceledAt field
                // Note: Do not update createdAt to preserve original reservation time
            });

            // Step 3: Update the corresponding slot in scheduleData to "Available"
            await updateScheduleData(roomName, day, time);

            alert(`Reservation for ${roomName} has been successfully canceled and is now available for booking.`);
            location.reload();  // Reload the page to reflect changes
        } else {
            console.error("Reservation not found.");
            alert("Reservation not found.");
        }
    } catch (error) {
        console.error("Error canceling reservation:", error);
        alert("Error canceling the reservation. Please try again.");
    }
}

/**
 * Function to update the scheduleData collection in Firestore.
 * Sets the specific room, day, and time slot to "Available".
 * @param {string} roomName - The name of the room.
 * @param {string} day - The day to update.
 * @param {string} time - The time slot to update.
 */
async function updateScheduleData(roomName, day, time) {
    try {
        const scheduleQuery = query(collection(db, "scheduleData"));
        const scheduleSnapshot = await getDocs(scheduleQuery);

        for (const docSnap of scheduleSnapshot.docs) {
            const scheduleData = docSnap.data().scheduleData;

            let updated = false;

            // Iterate through scheduleData array
            const updatedScheduleData = scheduleData.map(entry => {
                const updatedRooms = entry.rooms.map(room => {
                    if (room.name.trim().toLowerCase() === roomName.trim().toLowerCase()) {
                        const updatedSchedule = { ...room };
                        const dayKey = day.toLowerCase();

                        if (updatedSchedule.schedule && updatedSchedule.schedule[dayKey]) {
                            updatedSchedule.schedule[dayKey] = updatedSchedule.schedule[dayKey].map(slot => {
                                if (slot.time === time && slot.status === "Occupied") {
                                    updated = true;
                                    return { ...slot, status: "Available" };
                                }
                                return slot;
                            });
                        }

                        return updatedSchedule;
                    }
                    return room;
                });

                return { ...entry, rooms: updatedRooms };
            });

            if (updated) {
                await updateDoc(doc(db, "scheduleData", docSnap.id), {
                    scheduleData: updatedScheduleData
                });
                console.log(`Updated scheduleData for room: ${roomName}, day: ${day}, time: ${time}`);
                break; // Exit after updating the relevant document
            }
        }
    } catch (error) {
        console.error("Error updating scheduleData:", error);
        alert("Error updating room schedule. Please try again.");
    }
}

/**
 * Event listener for user authentication status changes.
 * Fetches reservation history when the user is logged in.
 */
onAuthStateChanged(auth, user => {
    if (user) {
        fetchReservationHistory();
    } else {
        document.querySelector('#reservationHistory').innerHTML = "<p>Please log in to view your reservation history.</p>";
    }
});


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


