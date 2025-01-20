const admin = require('firebase-admin');
const functions = require('firebase-functions');

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();

// Scheduled function to reset check-in and check-out times
exports.resetDailyReservations = functions.pubsub.schedule('0 16 * * *') // 16:00 UTC = 12:00 AM PH Time
    .timeZone('Asia/Manila')
    .onRun(async (context) => {
        try {
            const updatedScheduleRef = db.collection('updatedSchedule');
            const snapshot = await updatedScheduleRef.get();

            if (snapshot.empty) {
                console.log('No reservations found to reset.');
                return;
            }

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
    });
