import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function () {
    const dayDropdown = document.getElementById('dayDropdown');
    const mostReservedChartCtx = document.getElementById('mostReservedChart').getContext('2d');
    const roomStatsList = document.getElementById('roomStats');

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
    const db = getFirestore(app);

    let mostReservedChart = new Chart(mostReservedChartCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Room Reservations',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Reservations'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Rooms'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });

    let userAnalyticsChart = new Chart(document.getElementById('userAnalyticsChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Previous Week', 'Current'],
            datasets: [{
                label: 'User Growth',
                data: [0, 0],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Users'
                    }
                }
            }
        }
    });

    async function fetchData(day) {
        try {
            const q = query(collection(db, "updatedSchedule"), where("day", "==", day));
            const querySnapshot = await getDocs(q);

            const roomCounts = {};

            querySnapshot.forEach(doc => {
                const docData = doc.data();
                const room = docData.room;

                if (room) {
                    roomCounts[room] = (roomCounts[room] || 0) + 1;
                }
            });

            updateCharts(roomCounts);
            updateStats(roomCounts);

        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    }

    function updateCharts(roomCounts) {
        const roomNames = Object.keys(roomCounts);
        const reservationCounts = Object.values(roomCounts);

        mostReservedChart.data.labels = roomNames;
        mostReservedChart.data.datasets[0].data = reservationCounts;
        mostReservedChart.update();
    }

    function updateStats(roomCounts) {
        roomStatsList.innerHTML = '';

        Object.entries(roomCounts).forEach(([room, count]) => {
            const li = document.createElement('li');
            li.textContent = `${room}: ${count} reservations`;
            roomStatsList.appendChild(li);
        });
    }

    async function fetchUserCount() {
        try {
            const userStatsElement = document.getElementById('userStats');
            const accountsRef = collection(db, "accountDetails");
            const querySnapshot = await getDocs(accountsRef);
            
            const emailCount = querySnapshot.docs.length;
            
            const li = document.createElement('li');
            li.textContent = `Total Registered Users: ${emailCount}`;
            userStatsElement.innerHTML = '';
            userStatsElement.appendChild(li);

            userAnalyticsChart.data.datasets[0].data = [emailCount - 5, emailCount];
            userAnalyticsChart.update();
            
        } catch (error) {
            console.error("Error fetching user count: ", error);
        }
    }

    dayDropdown.addEventListener('change', function () {
        const selectedDay = dayDropdown.value;
        fetchData(selectedDay);
    });

    // Initial data fetching
    fetchData(dayDropdown.value);
    fetchUserCount();
});

document.addEventListener('DOMContentLoaded', () => {
    const statsItems = document.querySelectorAll('.stats-container ul li');
    
    statsItems.forEach(item => {
        const text = item.textContent.trim();
        const textLength = text.length;
        
        // Clear existing classes
        item.classList.remove('short-text', 'medium-text', 'long-text');
        
        // Classify based on text length
        if (textLength <= 15) {
            item.classList.add('short-text');
        } else if (textLength <= 30) {
            item.classList.add('medium-text');
        } else {
            item.classList.add('long-text');
        }
        
        // Optional: Add tooltip for full text if truncated
        if (textLength > 30) {
            item.setAttribute('title', text);
        }
    });
});