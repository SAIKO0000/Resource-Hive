const fs = require('fs');
const admin = require('firebase-admin');
const cron = require('node-cron');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: "visual-visionaries",
    private_key_id: "797127a33428c6b3d0fbde199cf88916ffcf39da",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCcZAnpQtsfhNDL\n...\n-----END PRIVATE KEY-----\n",
    client_email: "firebase-adminsdk-se7qj@visual-visionaries.iam.gserviceaccount.com",
    client_id: "111738537055707414986",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-se7qj%40visual-visionaries.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  }),
});

const db = admin.firestore();
const defaultSchedulePath = 'scheduleData.json';

async function resetScheduleData() {
  console.log('Starting schedule reset...');
  
  // Step 1: Read default schedule data from file
  let defaultSchedule;
  try {
    const fileData = fs.readFileSync(defaultSchedulePath, 'utf-8');
    defaultSchedule = JSON.parse(fileData);
    console.log('Default schedule data loaded:', defaultSchedule);
  } catch (err) {
    console.error('Error reading schedule data file:', err);
    return;
  }

  // Step 2: Set a reset flag in the database
  const resetFlagRef = db.collection('admin').doc('resetStatus');
  try {
    await resetFlagRef.set({ resetting: true });
    console.log('Reset flag set to true.');
  } catch (err) {
    console.error('Error setting reset flag:', err);
    return;
  }

  // Step 3: Fetch and update schedule data
  try {
    const scheduleCollection = db.collection('scheduleData');
    const snapshot = await scheduleCollection.get();

    if (snapshot.empty) {
      console.log('No documents found in scheduleData collection.');
      await resetFlagRef.set({ resetting: false });
      return;
    }

    const resetPromises = snapshot.docs.map(doc => {
      console.log('Resetting document:', doc.id);
      return doc.ref.set(
        { scheduleData: defaultSchedule },
        { merge: true } 
      );
    });

    await Promise.all(resetPromises);
    console.log('Schedule data reset successfully.');

  } catch (err) {
    console.error('Error resetting schedule data:', err);
  }

  try {
    await resetFlagRef.set({ resetting: false });
    console.log('Reset flag set to false.');
  } catch (err) {
    console.error('Error clearing reset flag:', err);
  }
}

// Step 5: Run the reset task every 30 seconds
cron.schedule('*/30 * * * * *', resetScheduleData);


resetScheduleData();
