import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js";

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

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function searchRooms() {
    const user = auth.currentUser;
    if (!user) {
        alert("You need to be logged in to search for rooms.");
        return;
    }

    const roomType = document.getElementById('roomType').value.toLowerCase();
    const searchInput = document.getElementById('searchInput').value.toLowerCase();

    if ((searchInput.includes("ccl") && roomType === "classroom") || 
        (searchInput.includes("classroom") && roomType === "ccl") ||
        (searchInput.includes("itc") && roomType === "laboratory") || 
        (searchInput.includes("laboratory") && roomType === "itc") ||
        (searchInput.includes("os room") && roomType === "laboratory") || 
        (searchInput.includes("laboratory") && roomType === "os room")) {
        alert("Wrong Filter");
        return;
    }

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
                        const category = room.type.toLowerCase();
                        if (!filteredRooms[category].some(r => r.name === room.name)) {
                            filteredRooms[category].push({
                                ...room,
                                schedule: room.schedule,
                                id: doc.id,
                                features: room.features || []
                            });
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

        displaySearchResults(filteredRooms, searchInput, roomType);

    } catch (error) {
        console.error("Error getting documents: ", error);
        alert("An error occurred while searching. Please try again.");
    }
}

function displaySearchResults(filteredRooms, searchInput, roomType) {
    const searchSummary = document.getElementById('searchSummary');
    searchSummary.textContent = `Search Results: ${searchInput} | ${roomType}`;

    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = "";

    const categories = [
        { name: 'classroom', title: 'Classrooms' },
        { name: 'laboratory', title: 'Laboratories' },
        { name: 'other', title: 'Other Rooms' }
    ];

    let hasResults = false;

    categories.forEach(category => {
        if (filteredRooms[category.name].length > 0) {
            hasResults = true;
            const section = document.createElement('div');
            section.classList.add('room-section');
            section.innerHTML = `<h3 class="section-title">${category.title}</h3>`;
            
            filteredRooms[category.name].forEach(room => {
                section.appendChild(createRoomCard(room));
            });
            
            resultsContainer.appendChild(section);
        }
    });

    if (!hasResults) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <p>No rooms found matching your criteria.</p>
            </div>
        `;
    }
}

function createRoomCard(room) {
    const roomCard = document.createElement('div');
    roomCard.classList.add('room-card');
    
    const roomInfo = document.createElement('div');
    roomInfo.classList.add('room-info');
    roomInfo.innerHTML = `
        <h4>${room.name}</h4>
        <p><strong>Type:</strong> ${room.type}</p>
        <p><strong>Floor:</strong> ${room.floor}</p>
        <p><strong>Features:</strong> ${room.features.join(', ')}</p>
    `;

    const reserveButton = document.createElement('button');
    reserveButton.classList.add('reserve-button');
    reserveButton.innerHTML = `
        <i class="fas fa-calendar-plus"></i>
        Reserve
    `;
    
    reserveButton.addEventListener('click', () => {
        const roomName = room.name;
        window.location.href = `room.html?room=${encodeURIComponent(roomName)}`;
    });

    roomCard.appendChild(roomInfo);
    roomCard.appendChild(reserveButton);

    return roomCard;
}

function goToInteractiveMap() {
    window.location.href = 'interactivemap.html';
}

document.getElementById('searchButton').addEventListener('click', searchRooms);
document.getElementById('interactiveMapButton').addEventListener('click', goToInteractiveMap);

window.addEventListener("load", () => {
    const user = auth.currentUser;
    if (user) {
        history.pushState(null, null, location.href);
        window.onpopstate = function() {
            history.pushState(null, null, location.href);
        };
    }
});

if (localStorage.getItem('isLoggedIn') === 'true') {
    history.pushState(null, null, location.href);
    window.onpopstate = function() {
        history.pushState(null, null, location.href);
    };
}
