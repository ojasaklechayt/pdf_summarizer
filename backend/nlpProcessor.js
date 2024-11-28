const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// Placeholder function for processing the question
// You can use LangChain or LlamaIndex to query PDFs for better answers
async function processQuestion(pdfFilename, question) {
    try {
        // Extract the text content from the PDF (assumes pre-extracted content)
        const text = await extractTextFromPDF(pdfFilename);

        // This is a basic implementation. Replace it with NLP processing (e.g., LangChain)
        const answer = text.includes(question) ? `Found in document: ${question}` : 'No relevant information found.';

        return answer;
    } catch (error) {
        console.error('Error in question processing:', error);
        return 'Error processing the question.';
    }
}

// Helper function to extract text from the uploaded PDF
async function extractTextFromPDF(pdfFilename) {
    const filePath = path.join(__dirname, 'uploads', pdfFilename);

    const data = await pdfParse(fs.readFileSync(filePath));
    return data.text;
}

module.exports = { processQuestion };
