// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCuehkyhTTGuNFXyNEQqkERTXVkg3R6eDo",
    authDomain: "visual-visionaries.firebaseapp.com",
    projectId: "visual-visionaries",
    storageBucket: "visual-visionaries.appspot.com",
    messagingSenderId: "24641645399",
    appId: "1:24641645399:web:21e2549cf65843f09a2c12",
    measurementId: "G-TQRQKBESP5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Helper function to render table rows with specific fields and actions
function renderTableRows(tableBody, data, fields, actions) {
    if (!tableBody) {
        console.error('Table body not found!');
        return; // Exit the function if the table body is not found
    }

    tableBody.innerHTML = '';
    data.forEach((item) => {
        const row = document.createElement('tr');
        row.innerHTML = ` 
            ${fields.map(field => {
                let value = item.data[field];
                // Format specific field types like dates and arrays
                if (Array.isArray(value)) {
                    return `<td>${value.join(', ') || 'None'}</td>`;
                }
                if (field === 'createdAt') {
                    return `<td>${new Date(value).toLocaleString() || 'N/A'}</td>`;
                }
                return `<td>${value || 'N/A'}</td>`;
            }).join('')}
            ${actions ? actions(item) : ''}
        `;
        tableBody.appendChild(row);
    });
}

// Fetch and display profile data
const profileTableBody = document.querySelector('#profileTable tbody');
if (!profileTableBody) {
    console.error('Table body not found!');
} else {
    db.collection('accountDetails').get().then((querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data()
        }));

        // Render the profile data in the table
        renderTableRows(profileTableBody, data, ['email', 'createdAt'], (item) => `
            <td>
                <button onclick="updateProfile('${item.id}')">Update</button>
                <button onclick="deleteProfile('${item.id}')">Delete</button>
            </td>
        `);
    }).catch((error) => {
        console.error('Error fetching profile data:', error);
    });
}

// Function to handle profile update
window.updateProfile = async (id) => {
    const newData = prompt("Enter new data (JSON format):");
    if (newData) {
        try {
            await db.collection('accountDetails').doc(id).update(JSON.parse(newData));
            alert('Profile updated successfully!');
            location.reload();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('There was an error updating the profile.');
        }
    }
};

// Function to handle profile deletion
window.deleteProfile = async (id) => {
    try {
        console.log('Deleting profile with ID:', id);
        await db.collection('accountDetails').doc(id).delete();
        alert('Profile deleted successfully!');
        location.reload(); // Refresh page after successful delete
    } catch (error) {
        console.error('Error deleting profile:', error);
        alert('There was an error deleting the profile.');
    }
};

// Fetch and display schedule data
const scheduleTableBody = document.querySelector('#scheduleTable tbody');
if (scheduleTableBody) {
    db.collection('scheduleData').get().then((querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        renderTableRows(scheduleTableBody, data, ['room', 'status', 'floor'], (item) => `
            <td><button onclick="deleteSchedule('${item.id}')">Delete</button></td>
        `);
    }).catch((error) => {
        console.error('Error fetching schedule data:', error);
    });
}

// Fetch and display updated schedule
const updatedScheduleTableBody = document.querySelector('#updatedScheduleTable tbody');
if (updatedScheduleTableBody) {
    db.collection('updatedSchedule').get().then((querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        renderTableRows(updatedScheduleTableBody, data, [
            'createdAt',
            'day',
            'features',
            'reason',
            'reservedBy',
            'room',
            'roomType',
            'status',
            'time'
        ], (item) => `
            <td><button onclick="deleteUpdated('${item.id}')">Delete</button></td>
        `);
    }).catch((error) => {
        console.error('Error fetching updated schedule:', error);
    });
}

// Delete function for schedule data
window.deleteSchedule = async (id) => {
    try {
        await db.collection('scheduleData').doc(id).delete();
        alert('Schedule deleted successfully!');
        location.reload();
    } catch (error) {
        console.error('Error deleting schedule:', error);
        alert('There was an error deleting the schedule.');
    }
};

// Delete function for updated schedule data
window.deleteUpdated = async (id) => {
    try {
        console.log('Deleting updated schedule with ID:', id);
        await db.collection('updatedSchedule').doc(id).delete();
        alert('Reserved room deleted successfully!');
        location.reload(); // Refresh page after successful delete
    } catch (error) {
        console.error('Error deleting updated schedule:', error);
        alert('There was an error deleting the reserved room.');
    }
};
