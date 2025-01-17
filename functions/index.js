const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fs = require('fs');

admin.initializeApp();
const db = admin.firestore();

// Read the default schedule data from the JSON file
const scheduleData = JSON.parse(fs.readFileSync('scheduleData.json', 'utf8'));

exports.resetFirestore = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
  try {
    // 1. Reset the scheduleData collection (Delete all documents)
    const scheduleRef = db.collection('scheduleData');
    const snapshot = await scheduleRef.get();
    snapshot.forEach((doc) => {
      doc.ref.delete(); // Delete each document in the collection
    });
    console.log('Deleted all documents in scheduleData.');

    // 2. Add the default scheduleData from the JSON file
    const batch = db.batch();
    scheduleData.forEach((data) => {
      const docRef = scheduleRef.doc(); // Create a new document reference
      batch.set(docRef, data); // Set the data in the document
    });

    // Commit the batch operation
    await batch.commit();
    console.log('scheduleData has been reset with default data.');

    // 3. Delete all documents in the updatedSchedule collection
    const updatedScheduleRef = db.collection('updatedSchedule');
    const updatedScheduleSnapshot = await updatedScheduleRef.get();
    updatedScheduleSnapshot.forEach((doc) => {
      doc.ref.delete(); // Delete each document in updatedSchedule
    });

    console.log('updatedSchedule has been deleted successfully!');
  } catch (error) {
    console.error('Error resetting Firestore collections:', error);
  }
});
