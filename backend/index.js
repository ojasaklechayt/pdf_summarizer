require('dotenv').config();
const express = require('express');
const multer = require('multer');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const { processQuestion } = require('./nlpProcessor');
const { uploadPDF, getDocumentById } = require('./config/firebaseUtils');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));

// Ensure 'uploads' directory exists
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the backend of PDF Summarizer');
});

// Upload Route
app.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        const { originalname, filename } = req.file;
        const uploadDate = new Date();

        // Upload PDF metadata to Firebase
        const docData = await uploadPDF(filename, originalname, uploadDate);

        // Emit the document metadata to all connected sockets
        io.emit('document-uploaded', docData);

        res.status(200).json({
            message: 'PDF uploaded successfully',
            document: docData
        });
    } catch (error) {
        console.error('Error uploading PDF:', error);
        res.status(500).json({ message: 'Error uploading PDF' });
    }
});

// Socket.IO Handlers
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Store document ID in socket
    socket.on('store-document', (documentId) => {
        socket.documentId = documentId;
        console.log(`Document ID stored for socket: ${socket.id}`);
    });

    // Handle question requests
    socket.on('ask-question', async ({ documentId, question }) => {
        console.log(`Received question: "${question}" for documentId: ${documentId}`);

        try {
            console.log(documentId, question)
            const document = await getDocumentById(documentId);

            if (document) {
                const answer = await processQuestion(document.filename, question);
                socket.emit('receive-answer', answer);
            } else {
                socket.emit('receive-answer', 'Document not found');
            }
        } catch (error) {
            console.error('Error processing question:', error);
            socket.emit('receive-answer', 'Error processing question.');
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start Server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
