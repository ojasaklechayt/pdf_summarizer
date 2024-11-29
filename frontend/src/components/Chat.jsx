/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import UserAvatar from '../assets/user-avatar.svg';
import AIAvatar from '../assets/aibackground.svg';
import SendArrow from '../assets/sendarrow.svg';

const socket = io('http://localhost:3000'); // Replace with your server URL

function Chat() {
    const [messages, setMessages] = useState([
        { text: 'Hello, how can I help you today?', sender: 'bot' },
    ]);

    const [inputMessage, setInputMessage] = useState('');
    const [documentId, setDocumentId] = useState(null);

    useEffect(() => {
        // Listen for answers from the server (bot's response)
        socket.on('receive-answer', (answer) => {
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: answer, sender: 'bot' },
            ]);
        });

        // Cleanup socket listener on unmount
        return () => {
            socket.off('receive-answer');
        };
    }, []);

    const handleSendMessage = () => {
        if (inputMessage.trim()) {
            // Add the user message to the chat
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: inputMessage, sender: 'user' },
            ]);

            // Send the message to the backend server
            if (documentId) {
                socket.emit('ask-question', { documentId, question: inputMessage });
            } else {
                socket.emit('ask-question', { question: inputMessage });
            }

            // Clear the input field
            setInputMessage('');
        }
    };

    return (
        <div className="flex flex-col h-screen w-full bg-white pt-20 pb-20">
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Map through the messages to display them */}
                {messages.map((message, index) => (
                    <div key={index} className="flex items-start space-x-4 lg:pl-16">
                        {/* Display avatar depending on sender */}
                        <img
                            src={message.sender === 'bot' ? AIAvatar : UserAvatar}
                            alt={`${message.sender} Avatar`}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="p-3 rounded-lg text-black text-start">
                            {message.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="bg-white flex items-center space-x-2 border rounded-lg border-gray-300 fixed bottom-6 left-4 right-4 w-auto shadow-lg sm:left-6 sm:right-6 md:left-10 md:right-10">
                <input
                    type="text"
                    className="flex-1 py-4 px-4 rounded-full text-sm text-black outline-none bg-white"
                    placeholder="Send a message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                />
                <button
                    className="text-black py-2 px-4 rounded-lg"
                    onClick={handleSendMessage}
                >
                    <img src={SendArrow} alt="Send Arrow" className="w-7 h-7" />
                </button>
            </div>
        </div>
    );
}

export default Chat;
