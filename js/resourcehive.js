document.addEventListener('DOMContentLoaded', () => {
  const reserveBtn = document.getElementById('reserveBtn');
  if (reserveBtn) {
      reserveBtn.addEventListener('click', () => {
          window.location.href = 'searching.html';
      });
  }
  displayStaticRooms();
});

function redirectToSearch() {
  window.location.href = 'searching.html';
}

function displayStaticRooms() {
const roomGrid = document.getElementById('roomGrid');

// Define rooms for each day of the week
const roomsForDays = {
  1: [  // Monday
    { name: "OS", availableSlots: 5 },
    { name: "CCL 101", availableSlots: 4 },
    { name: "CCL 102", availableSlots: 6 },
    { name: "ITC 201", availableSlots: 3 },
    { name: "CCL 201", availableSlots: 5 },
    { name: "CCL 202", availableSlots: 3 },
    { name: "CCL 203", availableSlots: 3 },
    { name: "CCL 204", availableSlots: 3 },
    { name: "CCL 205", availableSlots: 5 },
    { name: "CCL 305", availableSlots: 6 },
    { name: "CCL 306", availableSlots: 4 },
    { name: "ITC 401", availableSlots: 6 },
    { name: "CCL 401", availableSlots: 4 },
    { name: "ITC 402", availableSlots: 4 },
    { name: "ITC 403", availableSlots: 6 },
    { name: "ITC 404", availableSlots: 5 },
    { name: "ITC 408", availableSlots: 5 },
    { name: "ITC 501", availableSlots: 5 },
    { name: "ITC 502", availableSlots: 6 },
    { name: "ITC 503", availableSlots: 6 },
    { name: "ITC 504", availableSlots: 7 },
    { name: "ITC 505", availableSlots: 7 }
  ],
  2: [  // Tuesday
    { name: "OS", availableSlots: 4 },
    { name: "CCL 101", availableSlots: 4 },
    { name: "CCL 102", availableSlots: 4 },
    { name: "ITC 201", availableSlots: 1 },
    { name: "CCL 201", availableSlots: 6 },
    { name: "CCL 202", availableSlots: 1 },
    { name: "CCL 203", availableSlots: 1 },
    { name: "CCL 204", availableSlots: 2 },
    { name: "CCL 205", availableSlots: 3 },
    { name: "CCL 305", availableSlots: 4 },
    { name: "CCL 306", availableSlots: 3 },
    { name: "ITC 401", availableSlots: 3 },
    { name: "CCL 401", availableSlots: 6 },
    { name: "ITC 402", availableSlots: 2 },
    { name: "ITC 403", availableSlots: 3 },
    { name: "ITC 404", availableSlots: 4 },
    { name: "ITC 408", availableSlots: 4 },
    { name: "ITC 501", availableSlots: 5 },
    { name: "ITC 502", availableSlots: 4 },
    { name: "ITC 503", availableSlots: 4 },
    { name: "ITC 504", availableSlots: 4 },
    { name: "ITC 505", availableSlots: 1 }
  ],
  3: [  // Wednesday
    { name: "OS", availableSlots: 3 },
    { name: "CCL 101", availableSlots: 2 },
    { name: "CCL 102", availableSlots: 4 },
    { name: "ITC 201", availableSlots: 2 },
    { name: "CCL 201", availableSlots: 6 },
    { name: "CCL 202", availableSlots: 6 },
    { name: "CCL 203", availableSlots: 1 },
    { name: "CCL 204", availableSlots: 1 },
    { name: "CCL 205", availableSlots: 2 },
    { name: "CCL 301", availableSlots: 6 },
    { name: "CCL 302", availableSlots: 1 },
    { name: "CCL 303", availableSlots: 3 },
    { name: "CCL 304", availableSlots: 1 },
    { name: "CCL 305", availableSlots: 2 },
    { name: "CCL 306", availableSlots: 1 },
    { name: "ITC 401", availableSlots: 3 },
    { name: "CCL 401", availableSlots: 6 },
    { name: "ITC 402", availableSlots: 2 },
    { name: "CCL 402", availableSlots: 6 },
    { name: "ITC 403", availableSlots: 3 },
    { name: "ITC 404", availableSlots: 2 },
    { name: "ITC 408", availableSlots: 1 },
    { name: "ITC 501", availableSlots: 2 },
    { name: "ITC 502", availableSlots: 2 },
    { name: "ITC 503", availableSlots: 1 },
    { name: "ITC 504", availableSlots: 3 },
    { name: "ITC 505", availableSlots: 4 }
  ],
  4:[ //Thursday
    { name: "OS", availableSlots: 6 },
    { name: "CCL 101", availableSlots: 2 },
    { name: "CCL 102", availableSlots: 3 },
    { name: "ITC 201", availableSlots: 3 },
    { name: "CCL 201", availableSlots: 6 },
    { name: "CCL 202", availableSlots: 2 },
    { name: "CCL 203", availableSlots: 1 },
    { name: "CCL 204", availableSlots: 2 },
    { name: "CCL 205", availableSlots: 3 },
    { name: "CCL 301", availableSlots: 6 },
    { name: "CCL 302", availableSlots: 2 },
    { name: "CCL 303", availableSlots: 3 },
    { name: "CCL 304", availableSlots: 2 },
    { name: "CCL 305", availableSlots: 4 },
    { name: "CCL 306", availableSlots: 2 },
    { name: "ITC 401", availableSlots: 3 },
    { name: "CCL 401", availableSlots: 6 },
    { name: "ITC 402", availableSlots: 3 },
    { name: "CCL 402", availableSlots: 3 },
    { name: "ITC 403", availableSlots: 3 },
    { name: "ITC 404", availableSlots: 3 },
    { name: "ITC 408", availableSlots: 4 },
    { name: "ITC 501", availableSlots: 2 },
    { name: "ITC 502", availableSlots: 3 },
    { name: "ITC 503", availableSlots: 3 },
    { name: "ITC 504", availableSlots: 4 },
    { name: "ITC 505", availableSlots: 5 }
  ],
  5:[//Friday
    { name: "OS", availableSlots: 6 },
    { name: "CCL 101", availableSlots: 6 },
    { name: "CCL 102", availableSlots: 5 },
    { name: "ITC 201", availableSlots: 3 },
    { name: "CCL 201", availableSlots: 6 },
    { name: "CCL 202", availableSlots: 4 },
    { name: "CCL 203", availableSlots: 6 },
    { name: "CCL 204", availableSlots: 6 },
    { name: "CCL 205", availableSlots: 6 },
    { name: "CCL 301", availableSlots: 6 },
    { name: "CCL 302", availableSlots: 6 },
    { name: "CCL 303", availableSlots: 6 },
    { name: "CCL 304", availableSlots: 5 },
    { name: "CCL 305", availableSlots: 6 },
    { name: "CCL 306", availableSlots: 6 },
    { name: "ITC 401", availableSlots: 2 },
    { name: "CCL 401", availableSlots: 6 },
    { name: "ITC 402", availableSlots: 2 },
    { name: "ITC 403", availableSlots: 3 },
    { name: "ITC 404", availableSlots: 3 },
    { name: "ITC 408", availableSlots: 2 },
    { name: "ITC 501", availableSlots: 4 },
    { name: "ITC 502", availableSlots: 6 },
    { name: "ITC 503", availableSlots: 6 },
    { name: "ITC 504", availableSlots: 6 },
    { name: "ITC 505", availableSlots: 6 }
  ],
  6:[//Saturday
    { name: "OS", availableSlots: 6 },
    { name: "CCL 101", availableSlots: 6 },
    { name: "CCL 102", availableSlots: 6 },
    { name: "ITC 201", availableSlots: 6 },
    { name: "CCL 201", availableSlots: 6 },
    { name: "CCL 202", availableSlots: 6 },
    { name: "CCL 203", availableSlots: 6 },
    { name: "CCL 204", availableSlots: 6 },
    { name: "CCL 205", availableSlots: 6 },
    { name: "CCL 301", availableSlots: 6 },
    { name: "CCL 302", availableSlots: 6 },
    { name: "CCL 303", availableSlots: 6 },
    { name: "CCL 305", availableSlots: 6 },
    { name: "CCL 306", availableSlots: 6 },
    { name: "ITC 401", availableSlots: 6 },
    { name: "CCL 401", availableSlots: 6 },
    { name: "ITC 402", availableSlots: 6 },
    { name: "CCL 402", availableSlots: 6 },
    { name: "ITC 403", availableSlots: 6 },
    { name: "ITC 404", availableSlots: 6 },
    { name: "ITC 408", availableSlots: 4 },
    { name: "ITC 501", availableSlots: 6 },
    { name: "ITC 502", availableSlots: 6 },
    { name: "ITC 503", availableSlots: 6 },
    { name: "ITC 504", availableSlots: 6 },
    { name: "ITC 505", availableSlots: 6 }
  ]
};

const phTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });
const currentDate = new Date(phTime);
const currentDay = currentDate.getDay();

const roomsForToday = roomsForDays[currentDay];

if (roomsForToday) {
  roomGrid.innerHTML = '';
  roomsForToday.forEach(room => {
    const roomCard = document.createElement('div');
    roomCard.classList.add('room-card');
    roomCard.innerHTML = `
      <h3>${room.name}</h3>
      <p>Available Slots: ${room.availableSlots}</p>
    `;
    roomGrid.appendChild(roomCard);
  });
} else {
  roomGrid.innerHTML = "<p>Rooms are not available for today.</p>";
}
}

// Room grid scroll functionality
const roomGrid = document.getElementById('roomGrid');
if (roomGrid) {
  let isDown = false;
  let startX;
  let scrollLeft;

  roomGrid.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - roomGrid.offsetLeft;
      scrollLeft = roomGrid.scrollLeft;
  });

  roomGrid.addEventListener('mouseleave', () => {
      isDown = false;
  });

  roomGrid.addEventListener('mouseup', () => {
      isDown = false;
  });

  roomGrid.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - roomGrid.offsetLeft;
      const walk = (x - startX) * 2;
      roomGrid.scrollLeft = scrollLeft - walk;
  });

  // Touch events for mobile
  roomGrid.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX - roomGrid.offsetLeft;
      scrollLeft = roomGrid.scrollLeft;
  });

  roomGrid.addEventListener('touchmove', (e) => {
      if (!startX) return;
      const x = e.touches[0].pageX - roomGrid.offsetLeft;
      const walk = (x - startX) * 2;
      roomGrid.scrollLeft = scrollLeft - walk;
  });

  roomGrid.addEventListener('touchend', () => {
      startX = null;
  });
}
