const admin = require('firebase-admin');
require('dotenv').config()

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(process.env.SERVICEACCOUNT),
    databaseURL: process.env.FIREBASE_PROJECT_DB
});

// Get a reference to the Realtime Database
const db = admin.database();

async function uploadPDF(filepath, originalname, uploadDate, publicUrl) {
    try {
        const documentRef = db.ref('documents').push();
        const documentId = documentRef.key;

        // Create the document data object
        const documentData = {
            filepath: filepath,
            filename: originalname,
            upload_date: uploadDate.toISOString(),
            public_url: publicUrl
        };

        await documentRef.set(documentData);
        
        const snapshot = await documentRef.get();
        if (!snapshot.exists()) {
            throw new Error('Document not found after saving.');
        }

        return { 
            documentId, 
            ...documentData 
        };
    } catch (error) {
        console.error('Error saving PDF metadata:', error);
        throw error;
    }
}

async function getDocumentById(documentId) {
    try {
        const documentRef = db.ref(`documents/${documentId}`);
        const snapshot = await documentRef.once('value');

        if (snapshot.exists()) {
            const documentData = snapshot.val();
            return documentData;
        } else {
            console.warn('No Document found for ID: ', documentId);
            return null;
        }
    } catch (error) {
        console.error('Error fetching documents: ', error);
        throw error;
    }
}

module.exports = { uploadPDF, getDocumentById };