import { useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { FaUpload, FaQuestionCircle } from 'react-icons/fa';

const PDFSummarizer = () => {
    // Declare state variables to manage the application's state
    const [file, setFile] = useState(null);
    const [document, setDocument] = useState(null);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');

    // Event handler for file input change
    const handleFileChange = (e) => {
        // Update the 'file' state when the user selects a file
        setFile(e.target.files[0]);
    };

    // Event handler for file upload
    const handleUpload = async () => {
        try {
            // Create a FormData object and append the selected file
            const formData = new FormData();
            formData.append('pdf', file);

            // Send a POST request to the backend's /upload endpoint
            const response = await axios.post('/upload', formData);

            // Update the 'document' state with the response data
            setDocument(response.data.document);
        } catch (error) {
            // Log any errors that occur during the upload process
            console.error('Error uploading PDF:', error);
        }
    };

    // Event handler for question input change
    const handleQuestionChange = (e) => {
        // Update the 'question' state as the user types their question
        setQuestion(e.target.value);
    };

    // Event handler for asking a question
    const handleAsk = () => {
        // Establish a WebSocket connection with the backend
        const socket = io();

        // Emit the 'ask-question' event, passing the document ID and the user's question
        socket.emit('ask-question', { documentId: document.id, question });

        // Listen for the 'receive-answer' event, which is emitted by the backend
        socket.on('receive-answer', (answer) => {
            // Update the 'answer' state with the received answer
            setAnswer(answer);
        });
    };

    // Render the PDF Summarizer component
    return (
        <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                {/* Page title */}
                <h1 className="text-2xl font-bold mb-4">PDF Summarizer</h1>

                {/* File upload section */}
                <div className="mb-4">
                    {/* Label for the file upload input */}
                    <label htmlFor="pdf-upload" className="block font-medium mb-2">
                        Upload PDF
                    </label>
                    <div className="flex items-center">
                        {/* File upload input field */}
                        <input
                            type="file"
                            id="pdf-upload"
                            className="bg-gray-700 text-white px-4 py-2 rounded-lg mr-2 flex-grow"
                            onChange={handleFileChange}
                        />
                        {/* Upload button */}
                        <button
                            onClick={handleUpload}
                            className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg"
                        >
                            <FaUpload className="mr-2" />
                            Upload
                        </button>
                    </div>
                </div>

                {/* Document information section */}
                {document && (
                    <div className="mb-4">
                        {/* Display the uploaded document's filename */}
                        <p className="font-medium mb-2">Document uploaded: {document.originalname}</p>
                        <div className="flex items-center">
                            {/* Question input field */}
                            <input
                                type="text"
                                value={question}
                                onChange={handleQuestionChange}
                                className="bg-gray-700 text-white px-4 py-2 rounded-lg mr-2 flex-grow"
                                placeholder="Ask a question"
                            />
                            {/* Ask button */}
                            <button
                                onClick={handleAsk}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg"
                            >
                                <FaQuestionCircle className="mr-2" />
                                Ask
                            </button>
                        </div>

                        {/* Answer display section */}
                        {answer && (
                            <div className="mt-4 bg-gray-700 p-4 rounded-lg">
                                {/* Display the 'Answer:' label */}
                                <p className="font-medium mb-2">Answer:</p>
                                {/* Display the received answer */}
                                <p>{answer}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PDFSummarizer;