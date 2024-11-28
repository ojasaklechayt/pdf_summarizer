const express = require('express');
const multer = require('multer');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const fs = require('fs');
const { processQuestion } = require('./nlpProcessor');
const { uploadPDF } = require('./utils/fileUtils');
const { getDocumentById } = require('./models/documentModel');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
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

const fs = require('fs');
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
};

app.get('/', (req, res) => {
    res.send('Welcome to the backend of PDF Summarizer');
});

app.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        const { originalname, filename } = req.file;
        const uploadDate = new Date();

        const docData = await uploadPDF(filename, originalname, uploadDate);

        res.status(200).json({
            message: 'PDF uploaded successfully',
            document: docData
        })
    } catch (error) {
        console.error('Error uploading PDF:', error);
        res.status(500).json({ message: 'Error uploading PDF' });
    }
});


io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('ask-question', async ({ documentId, question }) => {
        try {
            const document = await getDocumentById(documentId);
            if (document) {
                const answer = await processQuestion(document.filename, question);
                socket.emit('receive-answer', answer);
            } else {
                socket.emit('receive-anseer', 'Document not found');
            }
        } catch (error) {
            console.error('Error processing question:', error);
            socket.emit('receive-answer', 'Error processing question.');
        }
    });


    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
})


app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});

