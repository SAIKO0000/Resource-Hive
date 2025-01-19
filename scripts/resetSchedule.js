const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with service account
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Function to reset schedule data
async function resetSchedule() {
  try {
    const dataPath = path.join(__dirname, 'scheduleData.json');
    const data = fs.readFileSync(dataPath, 'utf-8');
    const defaultSchedule = JSON.parse(data);

    const scheduleCollection = db.collection('scheduleData');
    const snapshot = await scheduleCollection.get();

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.set(doc.ref, defaultSchedule, { merge: true });
    });

    await batch.commit();
    console.log('Schedule data reset successfully.');
  } catch (error) {
    console.error('Error resetting schedule data:', error);
  }
}

resetSchedule();