const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function processQuestion(pdfFilename, question) {
    try {
        const genAI = new GoogleGenerativeAI(`${process.env.GEMINI_API}`);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const text = await extractTextFromPDF(pdfFilename) + question;
        const result = await model.generateContent(text);
        const answer = result.response.text();
        // const answer = "Hello Client!!";

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
