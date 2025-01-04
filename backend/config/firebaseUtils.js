const admin = require('firebase-admin');
require('dotenv').config()
const serviceAccount = require('./pdf-summarizer-155fd-firebase-adminsdk-fsey9-e40089a121.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_PROJECT_DB // Replace <your-project-id> with your Firebase project ID
});

// Get a reference to the Realtime Database
const db = admin.database();


async function uploadPDF(filename, originalname, uploadDate) {
    try {
        const documentRef = db.ref('documents').push();
        const documentId = documentRef.key;

        await documentRef.set({
            filename: filename,
            original_name: originalname,
            upload_date: uploadDate
        });
        
        const snapshot = await documentRef.get();
        if (!snapshot.exists()) {
            throw new Error('Document not found after saving.');
        }

        return { documentId, ...snapshot.val() };
    } catch (error) {
        console.error('Error saving PDF metadata:', error);
        throw error;
    }
}

async function getDocumentById(documentId) {
    try {
        const documentRef = db.ref(`documents/${documentId}`)
        const snapshot = await documentRef.once('value')

        if (snapshot.exists()) {
            const documentData = snapshot.val()
            return documentData
        } else {
            console.warn('No Document found for ID: ', documentId)
            return null;
        }
    } catch (error) {
        console.error('Error fetching documents: ', error);
        throw error;
    }
}
module.exports = { uploadPDF, getDocumentById };