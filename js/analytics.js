// analytics.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function () {
    const dayDropdown = document.getElementById('dayDropdown');
    const mostReservedChartCtx = document.getElementById('mostReservedChart').getContext('2d');
    const trendsChartCtx = document.getElementById('trendsChart').getContext('2d');
    const roomStatsList = document.getElementById('roomStats');

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

    // Initialize charts
    let mostReservedChart = new Chart(mostReservedChartCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Most Reserved Rooms',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    let trendsChart = new Chart(trendsChartCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Reservation Trends',
                data: [],
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Function to fetch and process data
    async function fetchData(day) {
        try {
            const q = query(collection(db, "updatedSchedule"), where("day", "==", day), where("status", "==", "Occupied"));
            const querySnapshot = await getDocs(q);

            const data = [];
            const roomCounts = {};

            querySnapshot.forEach(doc => {
                const docData = doc.data();
                const { room, time } = docData;

                // Count reservations per room
                roomCounts[room] = (roomCounts[room] || 0) + 1;

                // Collect data for trends
                data.push({ room, time });
            });

            updateCharts(roomCounts, data);
            updateStats(roomCounts);
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    }

    // Function to update charts
    function updateCharts(roomCounts, trendsData) {
        // Update Most Reserved Rooms chart
        const roomNames = Object.keys(roomCounts);
        const reservationCounts = Object.values(roomCounts);

        mostReservedChart.data.labels = roomNames;
        mostReservedChart.data.datasets[0].data = reservationCounts;
        mostReservedChart.update();

        // Update Trends chart
        const timeSlots = [...new Set(trendsData.map(item => item.time))].sort();
        const trendsCounts = timeSlots.map(slot =>
            trendsData.filter(item => item.time === slot).length
        );

        trendsChart.data.labels = timeSlots;
        trendsChart.data.datasets[0].data = trendsCounts;
        trendsChart.update();
    }

    // Function to update stats list
    function updateStats(roomCounts) {
        roomStatsList.innerHTML = '';
        Object.entries(roomCounts).forEach(([room, count]) => {
            const li = document.createElement('li');
            li.textContent = `${room}: ${count} reservations`;
            roomStatsList.appendChild(li);
        });
    }

    // Event listener for day dropdown
    dayDropdown.addEventListener('change', function () {
        const selectedDay = dayDropdown.value;
        fetchData(selectedDay);
    });

    // Initial fetch for the default day
    fetchData(dayDropdown.value);
});
