const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function resetDailyReservations() {
    try {
        const updatedScheduleRef = db.collection('updatedSchedule');     
        const snapshot = await updatedScheduleRef.get();

        const batch = db.batch();

        snapshot.forEach((doc) => {
            const data = doc.data();
            batch.update(doc.ref, {
                checkedInAt: null,
                checkedOutAt: null,
                status: "Available",
                reservedBy: "",
                reason: "",
                isActive: false, // Mark as historical record
                resetAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        await batch.commit();
        console.log('Daily reservation reset completed while preserving history.');
    } catch (error) {
        console.error('Error resetting reservations:', error);
    }
}

resetDailyReservations();
