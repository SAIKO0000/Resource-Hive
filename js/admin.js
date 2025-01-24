const firebaseConfig = {
    apiKey: "AIzaSyCuehkyhTTGuNFXyNEQqkERTXVkg3R6eDo",
    authDomain: "visual-visionaries.firebaseapp.com",
    projectId: "visual-visionaries",
    storageBucket: "visual-visionaries.appspot.com",
    messagingSenderId: "24641645399",
    appId: "1:24641645399:web:21e2549cf65843f09a2c12",
    measurementId: "G-TQRQKBESP5"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
        return timestamp.toDate().toLocaleString();
    }
    const date = new Date(timestamp);
    return date instanceof Date && !isNaN(date) ? date.toLocaleString() : 'N/A';
}

function renderTableRows(tableBody, data, fields, actions) {
    if (!tableBody) {
        console.error('Table body not found!');
        return;
    }
    tableBody.innerHTML = '';
    data.forEach((item) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            ${fields.map(field => {
                let value = item.data[field];
                if (Array.isArray(value)) {
                    return `<td>${value.join(', ') || 'None'}</td>`;
                }
                if (field === 'createdAt') {
                    return `<td>${formatDate(value)}</td>`;
                }
                return `<td>${value || 'N/A'}</td>`;
            }).join('')}
            ${actions ? actions(item) : ''}
        `;
        tableBody.appendChild(row);
    });
}

// Authentication Table
const authTableBody = document.querySelector('#authTable tbody');

auth.onAuthStateChanged(async (adminUser) => {
    if (!adminUser) return;

    const accountsRef = db.collection('accountDetails');
    const snapshot = await accountsRef.get();
    
    authTableBody.innerHTML = '';
    
    snapshot.forEach(doc => {
        const account = doc.data();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${account.email}</td>
            <td>${formatDate(account.createdAt)}</td>
            <td>${account.role || 'User'}</td>
            <td>
                <button class="delete-btn" onclick="deleteUser('${doc.id}', '${account.email}')">
                    Delete User
                </button>
            </td>
        `;
        authTableBody.appendChild(row);
    });
});

window.deleteUser = async (docId, email) => {
    if (confirm(`Are you sure you want to delete user ${email}?`)) {
        try {
            await db.collection('accountDetails').doc(docId).delete();
            alert('User deleted successfully!');
            location.reload();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user');
        }
    }
};

// Reserved Rooms Table
const updatedScheduleTableBody = document.querySelector('#updatedScheduleTable tbody');
if (updatedScheduleTableBody) {
    db.collection('updatedSchedule').get().then((querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data()
        }));
        renderTableRows(updatedScheduleTableBody, data, [
            'createdAt',
            'day',
            'reason',
            'reservedBy',
            'room',

            'time'
        ], (item) => `
            <td>
                <button onclick="deleteReservation('${item.id}')">Delete</button>
            </td>
        `);
    }).catch((error) => {
        console.error('Error fetching reservations:', error);
    });
}

window.deleteReservation = async (id) => {
    if (confirm('Are you sure you want to delete this reservation?')) {
        try {
            await db.collection('updatedSchedule').doc(id).delete();
            alert('Reservation deleted successfully!');
            location.reload();
        } catch (error) {
            console.error('Error deleting reservation:', error);
            alert('Error deleting reservation');
        }
    }
};
