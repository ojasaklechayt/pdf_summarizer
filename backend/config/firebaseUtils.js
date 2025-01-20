const admin = require('firebase-admin');
require('dotenv').config()

const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
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