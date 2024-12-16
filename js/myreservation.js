import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where, setDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase Configuration
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

// Function to display reservations
async function displayReservations(userId) {
    try {
        const reservationsRef = collection(db, "scheduleData"); // Assuming "scheduleData" is where reservations are stored
        const q = query(reservationsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        console.log("Fetched reservations for user:", userId);

        const tableBody = document.getElementById("reservationTable");
        if (!tableBody) {
            console.error("Error: Reservation table element not found.");
            return;
        }

        tableBody.innerHTML = ""; // Clear table before adding new rows

        if (querySnapshot.empty) {
            console.log("No reservations found.");
            tableBody.innerHTML = "<tr><td colspan='4'>No reservations found.</td></tr>";
            return;
        }

        // Loop through the reservations and display them
        querySnapshot.forEach(doc => {
            const reservation = doc.data();
            reservation.id = doc.id;  // Include document ID for possible future actions

            // Format the time to a readable format
            const formattedTime = new Date(reservation.time.seconds * 1000).toLocaleString(); // Convert Firestore timestamp to Date

            // Create table row for each reservation
            const row = `<tr>
                <td>${reservation.roomName}</td>
                <td>${reservation.roomType}</td>
                <td>${formattedTime}</td>
                <td>${reservation.status}</td>
            </tr>`;

            tableBody.innerHTML += row;
            
            // Save the reservation in 'user_reservations' collection
            saveReservationToUserReservations(reservation);
        });
    } catch (error) {
        console.error("Error fetching reservations:", error);
    }
}

// Function to save a reservation to the 'user_reservations' collection
async function saveReservationToUserReservations(reservation) {
    try {
        const userReservationsRef = collection(db, "user_reservations");
        const reservationRef = doc(userReservationsRef, reservation.id); // Use the same ID as in 'scheduleData'

        // Store the reservation in the 'user_reservations' collection
        await setDoc(reservationRef, reservation);
        console.log("Reservation saved in user_reservations collection:", reservation);
    } catch (error) {
        console.error("Error saving reservation to user_reservations:", error);
    }
}

// Function to save a reservation
async function saveReservation(userId, roomName, roomType, time, reason) {
    try {
        const reservationData = {
            userId: userId,
            roomName: roomName,
            roomType: roomType, // Assuming roomType is added to your data
            time: time,
            status: "Reserved",
            reason: reason,
            reservedAt: new Date().toISOString(),
        };

        // Create a unique reservation ID
        const reservationId = `${userId}_${roomName}_${time}`;
        const reservationRef = doc(db, "scheduleData", reservationId);

        await setDoc(reservationRef, reservationData);
        console.log("Reservation saved successfully:", reservationData);

        // After saving, re-fetch the reservations to update the history
        displayReservations(userId);

        // Optionally append the new reservation directly to the table (without re-fetching)
        const formattedTime = new Date(reservationData.time).toLocaleString();
        const tableBody = document.getElementById("reservationTable");
        const newRow = `<tr>
            <td>${reservationData.roomName}</td>
            <td>${reservationData.roomType}</td>
            <td>${formattedTime}</td>
            <td>${reservationData.status}</td>
        </tr>`;
        tableBody.innerHTML += newRow;
    } catch (error) {
        console.error("Error saving reservation:", error);
    }
}

// Check if user is authenticated and fetch their reservations
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Authenticated user:", user.uid);
        displayReservations(user.uid);  // Display reservations when user is authenticated
    } else {
        console.error("No authenticated user.");
    }
});

// Check for DOM elements when page is loaded
document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("reservationTable");
    if (!tableBody) {
        console.error("Error: Reservation table element not found in DOM.");
    } else {
        console.log("Reservation table element found.");
    }
});
