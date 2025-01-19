const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getFile } = require('./config/supabaseUtils');

async function processQuestion(filepath, question) {
    try {
        // Step 1: Get the PDF from Supabase storage
        console.log('Retrieving file from Supabase:', filepath);
        const pdfBuffer = await getFile(filepath);

        if (!pdfBuffer) {
            throw new Error('PDF file not found in Supabase storage.');
        }
        console.log('File successfully retrieved.');

        // Step 2: Extract text from the PDF
        const data = await pdfParse(pdfBuffer);

        if (!data || !data.text) {
            throw new Error('Failed to extract text from the PDF.');
        }
        const pdfText = data.text;

        console.log('PDF text extracted successfully.');

        // Step 3: Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Step 4: Format the prompt with context and question
        const prompt = `Context from PDF:\n${pdfText}\n\nQuestion: ${question}\n\nPlease answer the question based on the provided PDF context. and if the input is related to "hello", "thanks" or "bye" or any other general chat, respond it with appropriate message even if it is not related to the pdf`;

        console.log('Sending prompt to Gemini AI for processing...');

        // Step 5: Generate response
        const result = await model.generateContent(prompt);
        const answer = result.response.text();

        console.log('Response successfully generated.');

        console.log(answer);
        // Step 6: Return the answer
        return answer;
    } catch (error) {
        console.error('Error in processQuestion:', error.message);
        throw new Error(`Failed to process question: ${error.message}`);
    }
}

// Helper function to extract text from PDF stored in Supabase
async function extractTextFromPDF(filepath) {
    try {
        // Get PDF buffer from Supabase
        const pdfBuffer = await getFile(filepath);
        
        if (!pdfBuffer) {
            throw new Error('PDF file not found in storage');
        }

        // Parse PDF
        const data = await pdfParse(pdfBuffer);
        
        if (!data || !data.text) {
            throw new Error('Failed to extract text from PDF');
        }

        return data.text;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
}

module.exports = { processQuestion };