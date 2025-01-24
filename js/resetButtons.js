const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();

// Function to reset check-in and check-out times
async function resetDailyReservations() {
    try {
        const updatedScheduleRef = db.collection('updatedSchedule');     
        const snapshot = await updatedScheduleRef.get();

        const batch = db.batch();

        snapshot.forEach((doc) => {
            batch.update(doc.ref, {
                checkedInAt: null,
                checkedOutAt: null,
                status: "Available", // Reset status to "Available"
                reservedBy: "",
                reason: "",
            });
        });

        await batch.commit();
        console.log('Daily reservation reset completed.');
    } catch (error) {
        console.error('Error resetting reservations:', error);
    }
}

// Execute the function
resetDailyReservations();