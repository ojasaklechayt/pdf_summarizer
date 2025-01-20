const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getFile } = require('./config/supabaseUtils');
const Tesseract = require('tesseract.js');
const { createCanvas, loadImage } = require('canvas');
const pdf2pic = require('pdf2pic');

async function processQuestion(filepath, question) {
    try {
        // Step 1: Get the PDF from Supabase storage
        console.log('Retrieving file from Supabase:', filepath);
        const pdfBuffer = await getFile(filepath);

        if (!pdfBuffer) {
            throw new Error('PDF file not found in Supabase storage.');
        }
        console.log('File successfully retrieved.');

        // Step 2: Try to extract text using pdf-parse first
        let pdfText;
        try {
            const data = await pdfParse(pdfBuffer);
            pdfText = data.text;
            console.log('PDF text extracted successfully using pdf-parse.');
        } catch (pdfParseError) {
            console.log('pdf-parse failed, falling back to Tesseract OCR...', pdfParseError);
            pdfText = await extractTextWithTesseract(pdfBuffer);
            console.log('PDF text extracted successfully using Tesseract OCR.');
        }

        if (!pdfText) {
            throw new Error('Failed to extract text from the PDF using both methods.');
        }

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
        return answer;
    } catch (error) {
        console.error('Error in processQuestion:', error.message);
        throw new Error(`Failed to process question: ${error.message}`);
    }
}

// Helper function to extract text using Tesseract OCR
async function extractTextWithTesseract(pdfBuffer) {
    try {
        // Convert PDF to images
        const converter = new pdf2pic({
            density: 300,
            format: "png",
            width: 2480,
            height: 3508
        });

        // Convert PDF pages to images
        const images = await converter.convertBuffer(pdfBuffer);
        let fullText = '';

        // Process each image with Tesseract
        for (const image of images) {
            const { data: { text } } = await Tesseract.recognize(
                image.buffer,
                'eng',
                { logger: m => console.log(m) }
            );
            fullText += text + '\n';
        }

        return fullText;
    } catch (error) {
        console.error('Error in Tesseract text extraction:', error);
        throw new Error(`Failed to extract text using Tesseract: ${error.message}`);
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

        // Try pdf-parse first
        try {
            const data = await pdfParse(pdfBuffer);
            return data.text;
        } catch (pdfParseError) {
            console.log('pdf-parse failed, falling back to Tesseract OCR...', pdfParseError);
            return await extractTextWithTesseract(pdfBuffer);
        }
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
}

module.exports = { processQuestion };