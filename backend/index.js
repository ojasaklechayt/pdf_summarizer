require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const { uploadPDF, getDocumentById } = require('./config/firebaseUtils');
const { uploadFile, getFile } = require('./config/supabaseUtils');
const cors = require('cors');
const { processQuestion } = require('./nlpProcessor')

const app = express();
const server = http.createServer(app);
const corsOptions = {
    origin: ['https://pdf-summarizer-lac.vercel.app', 'http://localhost:5000'],
    methods: ["GET", "POST"],
    credentials: true
}

app.use(cors(corsOptions));

const io = new Server(server, {
    cors: corsOptions
});
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the backend of PDF Summarizer');
});

// Upload Route
app.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded', success: false });
        }

        const fileName = file.originalname;
        console.log(fileName);
        const fileType = file.mimetype;
        console.log(fileType);

        // Prepare file data for Supabase
        const fileData = {
            name: fileName,
            type: fileType,
            buffer: file.buffer,
        };

        // Upload to Supabase
        const supabaseResponse = await uploadFile(fileData);
        if (!supabaseResponse) {
            throw new Error('Failed to upload to Supabase');
        }

        // Upload metadata to Firebase
        const docData = await uploadPDF(
            supabaseResponse.path,
            supabaseResponse.fileName,
            new Date(),
            supabaseResponse.publicUrl
        );

        // Emit the document metadata to all connected sockets
        io.emit('document-uploaded', {
            ...docData,
            fileUrl: supabaseResponse.publicUrl
        });

        res.status(200).json({
            message: 'PDF uploaded successfully',
            success: true,
            document: {
                ...docData,
                fileUrl: supabaseResponse.publicUrl
            }
        });

    } catch (error) {
        console.error('Error in upload route:', error);
        res.status(500).json({
            message: error.message || 'Error uploading PDF',
            success: false
        });
    }
});

// Get file route
app.get('/file/:documentId', async (req, res) => {
    try {
        const document = await getDocumentById(req.params.documentId);

        if (!document) {
            return res.status(404).json({
                message: 'Document not found',
                success: false
            });
        }

        console.log(document.filepath)
        const fileData = await getFile(document.filepath);

        if (!fileData) {
            return res.status(404).json({
                message: 'File not found in storage',
                success: false
            });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${document.filename}"`);
        res.send(fileData);

    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({
            message: error.message || 'Error fetching file',
            success: false
        });
    }
});

// Socket.IO Handlers
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('store-document', (documentId) => {
        socket.documentId = documentId;
        console.log(`Document ID stored for socket: ${socket.id}`);
    });

    socket.on('ask-question', async ({ documentId, question }) => {
        console.log(`Received question: "${question}" for documentId: ${documentId}`);

        try {
            const document = await getDocumentById(documentId)
            if (!document) {
                socket.emit('receive-answer', {
                    success: false,
                    message: 'Document not found'
                });
                return;
            }

            const answer = await processQuestion(document.filepath, question);
            socket.emit('receive-answer', {
                success: true,
                answer
            });

        } catch (error) {
            console.error('Error processing question:', error);
            socket.emit('receive-answer', {
                success: false,
                message: 'Error processing question',
                error: error.message
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(error.status || 500).json({
        message: error.message || 'Internal Server Error',
        success: false
    });
});

// Start Server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
