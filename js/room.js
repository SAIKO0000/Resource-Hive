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
        serverTimestamp,
        Timestamp
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
    const reservation = {
        startTimestamp: Timestamp.fromDate(new Date())
    };
    function initializeRealtimeUpdates() {
        const roomName = getRoomFromURL();
        const dayDropdown = document.querySelector('#dayDropdown');
        
        const realtimeUpdate = setInterval(async () => {
            if (roomName && dayDropdown.value) {
                await fetchRoomData(roomName, dayDropdown.value);
                await monitorReservationsForAutoCancel();
                await checkUpcomingReservations();
                console.log("Real-time update completed:", new Date().toLocaleString());
            }
        }, 5000); // Update every 5 seconds
    
        // Pause updates when page is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                clearInterval(realtimeUpdate);
                console.log("Updates paused - page hidden");
            } else {
                initializeRealtimeUpdates();
                console.log("Updates resumed - page visible");
            }
        });
    
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            clearInterval(realtimeUpdate);
        });
    }
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
    
        // Set the room name and times
        roomNameElement.textContent = `Room: ${selectedSlots[0].room}`;
        timeElement.textContent = `Times: ${selectedSlots.map(slot => slot.time).join(', ')}`;
    
        // Apply styling for spacing adjustments
        roomNameElement.style.marginBottom = '10px';  // Adds space below the room name
        timeElement.style.marginTop = '10px';         // Adds space above the times
        timeElement.style.marginBottom = '20px';      // Adds space below the times
    
        modal.setAttribute('data-selected-slots', JSON.stringify(selectedSlots));
    
        // Optionally, apply padding and center the content of the modal
        modal.style.padding = '20px';    // Padding inside the modal
        modal.style.textAlign = 'center'; // Optional: Center text content
    
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
    
            if (querySnapshot.empty) return;
    
            const updates = querySnapshot.docs.map(async (docRef) => {
                const data = docRef.data();
                if (data?.scheduleData) {
                    const roomData = data.scheduleData
                        .flatMap(entry => entry.rooms)
                        .find(room => room.name.trim().toLowerCase() === roomName.trim().toLowerCase());
    
                    if (roomData) {
                        await displayRoomInfo(roomData, selectedDay, docRef.id);
                    }
                }
            });
    
            await Promise.all(updates);
        } catch (error) {
            console.error("Error fetching room data:", error);
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
   async function fetchReservedData(roomName, day) {
    const reservedData = [];
    try {
        const q = query(
            collection(db, "updatedSchedule"),
            where("room", "==", roomName),
            where("day", "==", day),
            where("status", "==", "Occupied") // Only fetch occupied slots
        );
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(doc => {
            const data = doc.data();
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

    const reservedData = await fetchReservedData(room.name, day);
    
    // Get full names for all reservations at once
    for (let reservation of reservedData) {
        reservation.fullName = await getFullNameByEmail(reservation.reservedBy);
    }

    // Create table structure
    const table = document.createElement('table');
    table.border = "1";
    table.cellPadding = "8";
    table.cellSpacing = "0";

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Time</th>
            <th>Status</th>
            <th>Check-In Time</th>
            <th>Actions</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    // Process each time slot only once
    const processedSlots = new Set();
    
    daySchedule.forEach(slot => {
        // Skip if this slot has already been processed
        if (processedSlots.has(slot.time)) return;
        processedSlots.add(slot.time);

        const reservation = reservedData.find(res => 
            res.time === slot.time && 
            res.status === "Occupied"
        );

        const rowClass = slot.status === "Available" ? "status-available" : "status-occupied";
        
        const checkInTime = reservation?.checkedInAt?.seconds 
            ? `Checked In At: ${new Date(reservation.checkedInAt.seconds * 1000).toLocaleTimeString('en-US', {
                timeZone: 'Asia/Manila',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })}`
            : (reservation ? 'Not checked in' : '');

        const row = document.createElement('tr');
        row.className = rowClass;
        row.innerHTML = `
            <td>${slot.time}</td>
            <td>
                ${slot.status === "Available" 
                    ? `Available
                        <input type="checkbox" class="select-slot"
                            data-time="${slot.time}"
                            data-docid="${docId}"
                            data-room="${room.name}"
                            style="margin-left: 10px;">`
                    : `Occupied
                        ${reservation 
                            ? `<br><small>Reserved By: ${reservation.fullName || reservation.reservedBy}</small>` 
                            : ''}`
                }
            </td>
            <td>${checkInTime}</td>
            <td>
                ${slot.status === "Occupied" && reservation 
                    ? `<button class="in-btn" 
                        data-doc-id="${docId}" 
                        data-room="${room.name}" 
                        data-time="${slot.time}">IN</button>
                        <button class="out-btn" 
                        data-doc-id="${docId}" 
                        data-room="${room.name}" 
                        data-time="${slot.time}">OUT</button>`
                    : ''}
            </td>
        `;

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    scheduleContainer.innerHTML = ''; // Clear previous content
    scheduleContainer.appendChild(table);

    // Add event listeners for IN and OUT buttons
    setupButtonEventListeners();

    // Create and append Reserve Selected Times button
    const reserveButton = createReserveButton(room.name, docId);
    scheduleContainer.appendChild(reserveButton);

    // Setup slot selection event listeners
    setupSlotSelectionListeners();
}

function setupButtonEventListeners() {
    document.querySelectorAll('.in-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            const docId = event.target.getAttribute('data-doc-id');
            const roomName = event.target.getAttribute('data-room');
            const time = event.target.getAttribute('data-time');
            await markReservationIn(docId, roomName, time);
        });
    });

    document.querySelectorAll('.out-btn').forEach(button => {
        button.style.backgroundColor = 'red';
        button.style.color = 'white';
        button.addEventListener('click', async (event) => {
            const docId = event.target.getAttribute('data-doc-id');
            const roomName = event.target.getAttribute('data-room');
            const time = event.target.getAttribute('data-time');
            await cancelReservation(docId, roomName, time);
        });
    });
}

function createReserveButton(roomName, docId) {
    const reserveButton = document.createElement('button');
    reserveButton.id = 'reserveSelectedTimesBtn';
    reserveButton.classList.add('open-modal-btn', 'btn', 'btn-primary');
    reserveButton.textContent = "Reserve Selected Times";
    
    // Ensure initial hidden state
    reserveButton.style.display = 'none';

    reserveButton.addEventListener('click', () => {
        const selectedSlots = Array.from(document.querySelectorAll('.select-slot:checked')).map(slot => ({
            time: slot.getAttribute('data-time'),
            room: roomName,
            docId: docId
        }));

        if (selectedSlots.length > 0) {
            openTimeModal(selectedSlots);
        } else {
            alert("Please select at least one time slot.");
        }
    });

    return reserveButton;
}

function setupSlotSelectionListeners() {
    const selectSlots = document.querySelectorAll('.select-slot');
    const reserveBtn = document.getElementById('reserveSelectedTimesBtn');
    
    selectSlots.forEach(slot => {
        slot.addEventListener('change', () => {
            const checkedSlots = document.querySelectorAll('.select-slot:checked');
            
            if (checkedSlots.length > 0) {
                reserveBtn.style.display = 'block';
            } else {
                reserveBtn.style.display = 'none';
            }
        });
    });
}

async function cancelReservation(docId, roomName, time) {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to cancel a reservation.");
            return;
        }

        const dayDropdown = document.querySelector('#dayDropdown');
        const day = dayDropdown.value;

        const q = query(
            collection(db, "updatedSchedule"),
            where("room", "==", roomName),
            where("time", "==", time),
            where("reservedBy", "==", user.email)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.error("No matching reservation found");
            alert("No reservation found.");
            return;
        }

        const reservationDoc = querySnapshot.docs[0];
        const reservationRef = doc(db, "updatedSchedule", reservationDoc.id);

        await updateDoc(reservationRef, {
            status: "Available",
            reservedBy: "",
            reason: "",
            checkedInAt: null,
            checkedOutAt: serverTimestamp(),
        });

        await updateScheduleData(roomName, day, time);

        // Immediately update the UI
        const tableRows = document.querySelectorAll('.schedule-table tbody tr');
        tableRows.forEach(row => {
            const timeCell = row.querySelector('td:first-child');
            if (timeCell.textContent.trim() === time) {
                const statusCell = row.querySelector('td:nth-child(2)');
                const checkInTimeCell = row.querySelector('td:nth-child(3)'); // Target Check-In Time column
                const actionsCell = row.querySelector('td:nth-child(4)'); // Target Actions column
                
                // Update status cell
                statusCell.innerHTML = `Available
                    <input type="checkbox" class="select-slot" 
                        data-time="${time}" 
                        data-docid="${docId}" 
                        data-room="${roomName}" 
                        style="margin-left: 10px;">`;
                
                // Clear check-in time
                checkInTimeCell.innerHTML = '';
                
                // Clear actions cell
                actionsCell.innerHTML = '';
            }
        });

        console.log("Reservation successfully canceled!");
        alert(`Reservation for ${roomName} has been successfully canceled and is now available for booking.`);

    } catch (error) {
        console.error("Error during cancellation:", error);
        alert("Failed to cancel the reservation. Please try again.");
    }
}


async function monitorReservationsForAutoCancel() {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
        collection(db, "updatedSchedule"),
        where("reservedBy", "==", user.email),
        where("status", "==", "Occupied")
    );

    const querySnapshot = await getDocs(q);
    console.log(`Monitoring ${querySnapshot.size} reservations`);

    querySnapshot.forEach(async (doc) => {
        const reservation = doc.data();
        
        // Get current time in Philippines timezone
        const now = new Date();
        const phNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
        
        // Convert startTimestamp to Date object
        const startTime = new Date(reservation.startTimestamp.seconds * 1000);
        
        // Calculate time difference in seconds
        const timeDiff = (phNow.getTime() - startTime.getTime()) / 1000;
        
        console.log({
            room: reservation.room,
            startTime: startTime.toLocaleString(),
            currentTime: phNow.toLocaleString(),
            timeDiff: `${timeDiff} seconds`,
            checkedInAt: reservation.checkedInAt
        });

        // If 30 seconds have passed and not checked in
        if (timeDiff >= 30 && !reservation.checkedInAt) {
            console.log(`Auto-canceling reservation for ${reservation.room}`);
            
            // First try to find and click the OUT button
            await autoClickOutButton(reservation.room, reservation.time);
            
            // If button click fails, perform the cancellation directly
            if (!document.querySelector(`.out-btn[data-room="${reservation.room}"][data-time="${reservation.time}"]`)) {
                await autoCheckOutReservation(doc.id, reservation.room, reservation.time);
            }
        }
    });
}

async function autoClickOutButton(roomName, time) {
    try {
        const tableRows = document.querySelectorAll('.schedule-table tbody tr');
        let buttonFound = false;

        tableRows.forEach(row => {
            const timeCell = row.querySelector('td:first-child');
            if (timeCell.textContent.trim() === time) {
                const outButton = row.querySelector('.out-btn');
                if (outButton) {
                    outButton.click();
                    buttonFound = true;
                    console.log("Automatically clicked OUT button for reservation at " + time);
                }
            }
        });

        if (!buttonFound) {
            throw new Error("OUT button not found");
        }
    } catch (error) {
        console.error("Error while automatically clicking OUT button:", error);
        throw error;
    }
}

async function autoCheckOutReservation(docId, roomName, time) {
    try {
        const reservationRef = doc(db, "updatedSchedule", docId);

        await updateDoc(reservationRef, {
            checkedOutAt: serverTimestamp(),
            status: "Available",
            reservedBy: "",
            reason: "",
            checkedInAt: null,
            canceledAt: serverTimestamp()
        });

        const dayDropdown = document.querySelector('#dayDropdown');
        const day = dayDropdown.value;
        await updateScheduleData(roomName, day, time);

        // Update UI
        const tableRows = document.querySelectorAll('.schedule-table tbody tr');
        tableRows.forEach(row => {
            const timeCell = row.querySelector('td:first-child');
            if (timeCell.textContent.trim() === time) {
                const statusCell = row.querySelector('td:nth-child(2)');
                const checkInTimeCell = row.querySelector('td:nth-child(3)');
                const actionsCell = row.querySelector('td:nth-child(4)');

                statusCell.innerHTML = `Available
                    <input type="checkbox" class="select-slot" 
                        data-time="${time}" 
                        data-docid="${docId}" 
                        data-room="${roomName}" 
                        style="margin-left: 10px;">`;
                checkInTimeCell.innerHTML = '';
                actionsCell.innerHTML = '';
            }
        });

        console.log("Reservation automatically checked out!");
        alert(`Reservation for ${roomName} has been automatically checked out due to no check-in within 30 seconds.`);
    } catch (error) {
        console.error("Error while automatically checking out reservation:", error);
    }
}



/**
 * Function to update the scheduleData collection in Firestore.
 * Sets the specific room, day, and time slot to "Available".
 * @param {string} roomName - The name of the room
 * @param {string} day - The day to update
 * @param {string} time - The time slot to update
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

// Update the event listeners in the displaySchedule function
document.querySelectorAll('.out-btn').forEach(button => {
    button.addEventListener('click', async (event) => {
        const docId = event.target.getAttribute('data-doc-id');
        const roomName = event.target.getAttribute('data-room');
        const time = event.target.getAttribute('data-time');
        await cancelReservation(docId, roomName, time);
    });
});


async function getFullNameByEmail(email) {
    try {
        const q = query(collection(db, "accountDetails"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data().fullname;
        }
        return email; // Fallback to email if fullname not found
    } catch (error) {
        console.error("Error fetching full name:", error);
        return email; // Fallback to email on error
    }
}



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

        const fullName = await getFullNameByEmail(user.email);
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

            const updatedSchedule = data.scheduleData.map(entry => {
                if (entry.rooms.some(r => r.name.trim().toLowerCase() === room.trim().toLowerCase())) {
                    entry.rooms = entry.rooms.map(r => {
                        if (r.name.trim().toLowerCase() === room.trim().toLowerCase()) {
                            Object.keys(r.schedule).forEach(dayKey => {
                                if (dayKey.toLowerCase() === selectedDay.toLowerCase()) {
                                    r.schedule[dayKey] = r.schedule[dayKey].map(slot => {
                                        if (slot.time === time && slot.status === "Available") {
                                            const [startTime, endTime] = time.split(' - ').map(timeStr => {
                                                const currentDate = new Date().toISOString().split('T')[0];
                                                return new Date(`${currentDate} ${timeStr} GMT+0800`);
                                            });

                                            return { 
                                                ...slot, 
                                                status: "Occupied", 
                                                reason: reservationReason, 
                                                reservedBy: user.email,
                                                fullName: fullName,
                                                startTimestamp: Timestamp.fromDate(startTime),
                                                endTimestamp: Timestamp.fromDate(endTime)
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
                reservedBy: user.email,
                fullName: fullName,
                time,
                reason: reservationReason,
                status: "Occupied",
                day: selectedDay,
                checkedInAt: "N/A",
                checkedOutAt: "N/A",
                startTimestamp: Timestamp.fromDate(new Date(`${new Date().toISOString().split('T')[0]} ${time.split(' - ')[0]} GMT+0800`)),
                endTimestamp: Timestamp.fromDate(new Date(`${new Date().toISOString().split('T')[0]} ${time.split(' - ')[1]} GMT+0800`)),
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, "updatedSchedule"), reservationData);

            const rows = document.querySelectorAll('.schedule-table tbody tr');
            rows.forEach(row => {
                const timeCell = row.querySelector('td:first-child');
                if (timeCell.textContent.trim() === time) {
                    const statusCell = row.querySelector('td:nth-child(2)');
                    statusCell.innerHTML = `Occupied<br><small>Reserved By: ${fullName}</small>`;
                    
                    const checkInTimeCell = row.querySelector('td:nth-child(3)');
                    checkInTimeCell.textContent = 'Not checked in';
                    
                    const actionsCell = row.querySelector('td:nth-child(4)');
                    actionsCell.innerHTML = `
                        <button class="in-btn" data-doc-id="${docId}" data-room="${room}" data-time="${time}">IN</button>
                        <button class="out-btn" data-doc-id="${docId}" data-room="${room}" data-time="${time}">OUT</button>
                    `;

                    const checkbox = row.querySelector('.select-slot');
                    if (checkbox) checkbox.remove();
                }
            });

            const newInBtn = document.querySelector(`button.in-btn[data-time="${time}"]`);
            const newOutBtn = document.querySelector(`button.out-btn[data-time="${time}"]`);

            if (newInBtn) {
                newInBtn.addEventListener('click', () => markReservationIn(docId, room, time));
            }
            if (newOutBtn) {
                newOutBtn.addEventListener('click', () => cancelReservation(docId, room, time));
            }
        }

        alert("Reservations confirmed!");
        closeTimeModal();

    } catch (error) {
        console.error("Error confirming reservations:", error);
        alert("Error reserving the selected times. Please try again.");
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
    if (!dayDropdown) {
        console.error("Day dropdown not found!");
        return;
    }
    
    const selectedDay = dayDropdown.value || "";
    
    if (selectedDay) {
        fetchRoomData(roomName, selectedDay);
    }
    
    dayDropdown.addEventListener('change', () => {
        const selectedDay = dayDropdown.value;
        const scheduleTable = document.querySelector('.schedule-table');
        if (!scheduleTable) {
            console.error("Schedule table not found!");
            return;
        }
    
        if (selectedDay) {
            fetchRoomData(roomName, selectedDay);
        } else {
            const messageElement = document.createElement('p');
            messageElement.textContent = "";
    
            // Clear any previous content in schedule table
            scheduleTable.innerHTML = '';
            scheduleTable.appendChild(messageElement);
    
            // Center the message using flexbox
 
            scheduleTable.style.justifyContent = 'center'; // Horizontal centering
            scheduleTable.style.alignItems = 'center';     // Vertical centering (optional)

    
            messageElement.style.textAlign = 'center';  // Ensure text is centered
            messageElement.style.padding = '20px 0';   
            messageElement.style.marginRight = '160px';  // Optional padding
    
            console.log("Message centered and appended.");
        }
    });
});
    
    

    const confirmButton = document.getElementById('confirmReservationButton');
    if (confirmButton) {
        confirmButton.addEventListener('click', confirmReservation);
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


 /**
 * Converts the "time" field in the schedule to Firestore timestamps.
 * Automatically adjusts based on the current date in the Philippines.
 * @param {string} roomDocId - The Firestore document ID containing the schedule data.
 */
async function convertTimeToTimestamps(roomDocId) {
    try {
        // Fetch the current date in the Philippines
        const now = new Date();
        const phDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
        const dateStr = phDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

        // Fetch the document data
        const roomDocRef = doc(db, 'scheduleData', roomDocId);
        const roomDocSnapshot = await getDoc(roomDocRef);

        if (!roomDocSnapshot.exists()) {
            console.error(`Document with ID ${roomDocId} not found.`);
            return;
        }

        const roomData = roomDocSnapshot.data();

        // Iterate through scheduleData
        const updatedScheduleData = roomData.scheduleData.map(entry => {
            const updatedRooms = entry.rooms.map(room => {
                const updatedSchedule = { ...room };

                Object.keys(updatedSchedule.schedule).forEach(day => {
                    updatedSchedule.schedule[day] = updatedSchedule.schedule[day].map(slot => {
                        const [startTime, endTime] = slot.time.split(' - ').map(timeStr => {
                            return new Date(`${dateStr} ${timeStr}`);
                        });

                        return {
                            ...slot,
                            startTimestamp: Timestamp.fromDate(startTime),
                            endTimestamp: Timestamp.fromDate(endTime),
                        };
                    });
                });

                return updatedSchedule;
            });

            return { ...entry, rooms: updatedRooms };
        });

        // Update the Firestore document
        await updateDoc(roomDocRef, { scheduleData: updatedScheduleData });
        console.log('Time slots converted to timestamps successfully!');
    } catch (error) {
        console.error('Error converting time to timestamps:', error);
    }
}

/**
 * Checks if the current time is within the allowed range to enable the "IN" button.
 * @param {Timestamp} startTimestamp - The start time of the reservation.
 * @returns {boolean} - Whether the "IN" button should be enabled.
 */
function canCheckIn(startTimestamp) {
    if (!startTimestamp || !startTimestamp.seconds) {
        console.error("Invalid startTimestamp:", startTimestamp);
        return false;
    }

    // Get current time in Philippines timezone
    const now = new Date();
    const phNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    
    // Convert Firestore startTimestamp to local PH time
    const startTime = new Date(startTimestamp.seconds * 1000);
    const phStartTime = new Date(startTime.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));

    // Calculate time windows
    const checkInStart = new Date(phStartTime.getTime() - 5 * 60 * 1000); // 5 minutes before
    const checkInEnd = new Date(phStartTime.getTime() + 5 * 60 * 1000);   // 5 minutes after

    // Check if current time is within the allowed window
    const canCheck = phNow >= checkInStart && phNow <= checkInEnd;

    console.log({
        currentTime: phNow.toLocaleString(),
        reservationTime: phStartTime.toLocaleString(),
        checkInWindowStart: checkInStart.toLocaleString(),
        checkInWindowEnd: checkInEnd.toLocaleString(),
        canCheckIn: canCheck
    });

    if (!canCheck) {
        if (phNow > checkInEnd) {
            alert("Check-in time has expired. You can only check in within 5 minutes before or after the reservation time.");
        } else if (phNow < checkInStart) {
            alert("It's too early to check in. You can check in starting 5 minutes before your reservation time.");
        }
    }

    return canCheck;
}

async function markReservationIn(docId, roomName, time) {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to mark as IN.");
            return;
        }

        const dayDropdown = document.querySelector('#dayDropdown');
        const selectedDay = dayDropdown.value || "monday";

        const q = query(
            collection(db, "updatedSchedule"),
            where("room", "==", roomName),
            where("day", "==", selectedDay),
            where("time", "==", time)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.error("No matching reservation found");
            alert("No reservation found.");
            return;
        }

        const reservationDoc = querySnapshot.docs[0];
        const reservationData = reservationDoc.data();

        if (!canCheckIn(reservationData.startTimestamp)) {
            alert("You can only check in 5 minutes before or later than the reserved time.");
            return;
        }

        const reservationRef = doc(db, "updatedSchedule", reservationDoc.id);
        const checkInTime = serverTimestamp();

        // Update the document with check-in timestamp
        await updateDoc(reservationRef, {
            checkedInAt: checkInTime,
            status: "Occupied"
        });

        // Immediately update the UI
        const row = document.querySelector(`tr td:first-child[innerText="${time}"]`)?.parentElement;
        if (row) {
            const checkInCell = row.querySelector('td:nth-child(3)');
            if (checkInCell) {
                const now = new Date();
                checkInCell.textContent = now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: 'Asia/Manila'
                });
            }
        }

        console.log("Successfully checked in!");
        alert("You have successfully checked in!");

        // Refresh the entire schedule display
        await fetchRoomData(roomName, selectedDay);
    } catch (error) {
        console.error("Error marking as IN:", error);
        alert("Failed to mark as IN. Please try again.");
    }
}


async function setupInButtons() {
    const inButtons = document.querySelectorAll('.in-btn');

    inButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const docId = button.getAttribute('data-doc-id');
            const roomName = button.getAttribute('data-room');
            const time = button.getAttribute('data-time');

            // Call the markReservationIn function
            await markReservationIn(docId, roomName, time);
        });
    });
}

setupInButtons();


// Call the function with your Firestore document ID
convertTimeToTimestamps('fvkEyQiLsd9dsCLBgSdd');

async function checkNotificationPermission() {
    if (!("Notification" in window)) {
        console.log("Browser does not support notifications");  // Debugging log
        showNotificationModal("Browser Not Supported", 
            "Your browser doesn't support notifications. Please use a modern browser to receive alerts.");
        return false;
    }

    console.log("Current notification permission:", Notification.permission);

    if (Notification.permission === "denied") {
        console.log("Notifications blocked");  // Debugging log
        showNotificationModal("Notifications Blocked", 
            `To receive important reservation alerts, please enable notifications:
            <ol>
                <li>Click the lock/info icon next to the URL in your browser's address bar</li>
                <li>Find "Notifications" in the site settings</li>
                <li>Change the setting to "Allow"</li>
                <li>Refresh the page</li>
            </ol>`);
        return false;
    }

    if (Notification.permission === "default") {
        try {
            const permission = await Notification.requestPermission();
            console.log("Permission granted:", permission);
            return permission === "granted";
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    return Notification.permission === "granted";
}

// Initialize notifications
async function initializeNotificationSystem() {
    const permissionGranted = await checkNotificationPermission();
    if (permissionGranted) {
        // Start checking for upcoming reservations after a short delay
        setTimeout(checkUpcomingReservations, 1000);  // Wait 1 second to start checking
    }
}

// Check upcoming reservations and log debugging details
async function checkUpcomingReservations() {
    const user = auth.currentUser;
    if (!user) return;

    console.log("Checking upcoming reservations...");

    try {
        const now = new Date();
        const phNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));

        // Query for user's upcoming reservations
        const q = query(
            collection(db, "updatedSchedule"),
            where("reservedBy", "==", user.email),
            where("status", "==", "Occupied")
        );

        const querySnapshot = await getDocs(q);
        console.log("Found reservations:", querySnapshot.size);

        querySnapshot.forEach(doc => {
            const reservation = doc.data();
            
            // Check if startTimestamp exists and is correctly structured
            if (reservation.startTimestamp && reservation.startTimestamp.seconds) {
                // Convert Firestore Timestamp to Date object
                const startTime = new Date(reservation.startTimestamp.seconds * 1000);
                const phStartTime = new Date(startTime.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));

                // Calculate the time difference in milliseconds
                const timeDiff = phStartTime.getTime() - phNow.getTime(); // Time difference in ms
                const timeDiffMinutes = timeDiff / (1000 * 60); // Convert to minutes

                const notificationKey = `notification_${doc.id}_${Math.floor(timeDiffMinutes / 10)}`;

                console.log("Time difference in minutes:", timeDiffMinutes);
                console.log("Checking notification key:", notificationKey);
                console.log("LocalStorage item:", localStorage.getItem(notificationKey));

                // Log if notification condition is met
                if (!localStorage.getItem(notificationKey)) {
                    if (timeDiffMinutes <= 42 && timeDiffMinutes > 41) {
                        console.log("Sending 15-minute notification...");
                        showReservationAlert(
                            "15 Minutes Until Reservation",
                            `Your reservation for ${reservation.room} starts at ${formatTime(phStartTime)}.`,
                            notificationKey
                        );
                    } else if (timeDiffMinutes <= 10 && timeDiffMinutes > 9) {
                        console.log("Sending 10-minute notification...");
                        showReservationAlert(
                            "10 Minutes Until Reservation",
                            `Your reservation for ${reservation.room} is coming up at ${formatTime(phStartTime)}.`,
                            notificationKey
                        );
                    } else if (timeDiffMinutes <= 5 && timeDiffMinutes > 4) {
                        console.log("Sending 5-minute notification...");
                        showReservationAlert(
                            "5 Minutes Until Reservation",
                            `Please prepare for your reservation in ${reservation.room} at ${formatTime(phStartTime)}.`,
                            notificationKey
                        );
                    }
                }
            } else {
                console.error("Missing or malformed startTimestamp in reservation:", reservation);
            }
        });
    } catch (error) {
        console.error("Error checking upcoming reservations:", error);
    }
}


// Function to show reservation alerts (fallback when notifications are blocked)
function showReservationAlert(title, message, notificationKey) {
    console.log("Attempting to send notification...");

    if (Notification.permission === "granted") {
        const notification = new Notification(title, {
            body: message,
            icon: '/path/to/your/icon.png',
            silent: false
        });

        notification.xonclick = function() {
            window.focus();
            this.close();
        };

        console.log("Notification sent:", notification);
    } else {
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 1000;
            max-width: 300px;
        `;
        alertDiv.innerHTML = `
            <h4 style="margin: 0 0 5px 0;">${title}</h4>
            <p style="margin: 0;">${message}</p>
        `;
        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    localStorage.setItem(notificationKey, 'true');
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true,
        timeZone: 'Asia/Manila'
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeNotificationSystem();
});

console.log("Room:", reservation.room);
console.log("Reservation time:", formatTime(phStartTime));


document.addEventListener('DOMContentLoaded', () => {
    const roomName = getRoomFromURL();
    console.log("Fetched room name:", roomName);
    
    if (!roomName) {
        console.error("Room not found in URL! Please select a valid room.");
        return;
    }
    
    const dayDropdown = document.querySelector('#dayDropdown');
    if (!dayDropdown) {
        console.error("Day dropdown not found!");
        return;
    }
    
    const selectedDay = dayDropdown.value || "";
    
    if (selectedDay) {
        fetchRoomData(roomName, selectedDay);
    }

    // Initialize real-time updates
    if (roomName) {
        initializeRealtimeUpdates();
    }
    
    dayDropdown.addEventListener('change', () => {
        const selectedDay = dayDropdown.value;
        const scheduleTable = document.querySelector('.schedule-table');
        if (!scheduleTable) {
            console.error("Schedule table not found!");
            return;
        }
    
        if (selectedDay) {
            fetchRoomData(roomName, selectedDay);
        } else {
            const messageElement = document.createElement('p');
            messageElement.textContent = "Please select a day to view the schedule.";
    
            scheduleTable.innerHTML = '';
            scheduleTable.appendChild(messageElement);
    
            scheduleTable.style.justifyContent = 'center';
            scheduleTable.style.alignItems = 'center';     
            messageElement.style.textAlign = 'center';
            messageElement.style.padding = '20px 0';   
            messageElement.style.marginRight = '160px';
            
            console.log("Message centered and appended.");
        }
    });

    // Initialize notification system
    initializeNotificationSystem();
});
