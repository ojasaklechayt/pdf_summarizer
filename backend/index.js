require('dotenv').config();
const express = require('express');
const multer = require('multer');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const fs = require('fs');
const { processQuestion } = require('./nlpProcessor');
const { uploadPDF } = require('./utils/fileUtils');
const { getDocumentById } = require('./models/documentModel');
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
const PORT = process.env.PORT;

app.use(cors());

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

// Check PostgreSQL connection
pool.connect()
    .then(() => {
        console.log('Connected to PostgreSQL database');
    })
    .catch((err) => {
        console.error('Error connecting to PostgreSQL database:', err);
        process.exit(1); // Exit the process if DB connection fails
    });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        const uniquesuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniquesuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: false }));

if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

app.get('/', (req, res) => {
    res.send('Welcome to the backend of PDF Summarizer');
});

app.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        const { originalname, filename } = req.file;
        const uploadDate = new Date();
        const docData = await uploadPDF(filename, originalname, uploadDate);

        // Emit the document ID to all connected sockets immediately after the file upload
        io.emit('document-uploaded', docData.id);
        
        res.status(200).json({
            message: 'PDF uploaded successfully',
            document: docData
        });
    } catch (error) {
        console.error('Error uploading PDF:', error);
        res.status(500).json({ message: 'Error uploading PDF' });
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    // Store the document ID when the socket receives it
    socket.on('store-document', (documentId) => {
        socket.documentId = documentId;
        console.log(`Document ID stored for socket: ${socket.id}`);
    });

    socket.on('ask-question', async ({ documentId, question }) => {
        console.log(`Received question: "${question}" for documentId: ${documentId}`)

        try {
            const document = await getDocumentById(documentId);
            console.log(document);
            if (document) {
                const answer = await processQuestion(document.filename, question);
                console.log(answer);
                socket.emit('receive-answer', answer);
            } else {
                socket.emit('receive-answer', 'Document not found');
            }
        } catch (error) {
            console.error('Error processing question:', error);
            socket.emit('receive-answer', 'Error processing question.');
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});