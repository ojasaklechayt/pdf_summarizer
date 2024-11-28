const pool = require('../config/db');

async function getDocumentById(documentId){
    const query = 'Select * from documents where id = $1';
    const values = [documentId];

    try {
        const result = await pool.query(query, values);
    } catch (error) {
        console.error('Error fetching document:', error);
        throw error;
    }
}

module.exports = { getDocumentById };