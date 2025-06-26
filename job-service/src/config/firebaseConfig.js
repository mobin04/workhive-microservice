const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.PROJECT_ID,
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: process.env.PRIVATE_KEY,
  }),
  storageBucket: process.env.STORAGE_BUCKET_NAME,
});

const bucket = admin.storage().bucket();
module.exports = bucket;
