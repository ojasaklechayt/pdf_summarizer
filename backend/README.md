# Backend - PDF Summarizer Chatbot

## Project Overview
This is the backend of the PDF Summarizer Chatbot, handling file uploads, real-time communication, and PDF summarization. Built with **Node.js**, it uses **Socket.io** for real-time messaging and **PostgreSQL** for metadata storage. The bot also handles file storage with **Multer**.

---

## Technologies Used
- **Node.js**: Backend JavaScript runtime.
- **Socket.io**: Real-time bidirectional communication with the frontend.
- **Multer**: Middleware for handling file uploads.
- **PostgreSQL**: Relational database for metadata storage (file names, timestamps).
- **Gemini API**: For summarizing PDF content.

---

## Features
- **File Upload Handling**: Files are uploaded and stored on the server.
- **Real-Time Communication**: Using **Socket.io** for message exchange.
- **PDF Summarization**: PDFs are processed, and summaries are returned to the frontend.
- **Metadata Storage**: Metadata about files (e.g., name, timestamp) is stored in PostgreSQL.

---

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ojasaklechayt/pdf_summarizer.git
   cd pdf_summarizer/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Update your `.env` file with the following values:
   ```env
   PORT=3001
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=pdfsummarizer
   DB_PASSWORD=password
   DB_PORT=5432
   UPLOADS_DIR=uploads/
   GEMINI_API=Your_API_key
   ```

4. **Start the server**:
   ```bash
   npm run start
   ```

5. Open the backend service on `http://localhost:3001`.

---

## Future Enhancements
- **AI-Based Summarization**: Implement machine learning models to improve summarization accuracy.
- **Error Handling**: Improve server-side error management for better reliability.
