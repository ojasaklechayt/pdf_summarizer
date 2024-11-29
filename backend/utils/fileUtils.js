const path = require('path');
const fs = require('fs');
const pool = require('../config/db');

async function uploadPDF(filename, originalname, uploadDate) {
    const query = `insert into documents (filename, original_name, upload_date) values ($1, $2, $3) returning *;`;
    const values = [filename, originalname, uploadDate];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error saving PDF metadata:', error);
        throw error;
    }
}

module.exports = { uploadPDF };