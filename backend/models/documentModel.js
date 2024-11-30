const pool = require('../config/db');

async function getDocumentById(documentId) {
    const query = 'SELECT * FROM documents WHERE id = $1';
    const values = [documentId];

    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return result.rows[0]; 
        } else {
            console.warn('No document found for ID:', documentId);
            return null;
        }
    } catch (error) {
        console.error('Error fetching document:', error);
        throw error;
    }
}

module.exports = { getDocumentById };
