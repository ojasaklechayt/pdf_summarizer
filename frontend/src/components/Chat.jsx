/* eslint-disable no-unused-vars */
import { useState, useContext, useEffect } from 'react';
import UserAvatar from '../assets/user-avatar.svg';
import AIAvatar from '../assets/aibackground.svg';
import SendArrow from '../assets/sendarrow.svg';
import { DocumentContext } from '../context/DocumentProvider';
import socket from '../socket';
import ReactMarkdown from 'react-markdown';
import { Toaster, toast } from 'sonner';

function Chat() {
    const [messages, setMessages] = useState([
        { text: 'Hello, how can I help you today?', sender: 'bot' },
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const { documentId } = useContext(DocumentContext);

    useEffect(() => {
        // Listening for the server's answer when received
        socket.on('receive-answer', (response) => {
            console.log('Received from server:', response.answer);
            handleBotMessage(response.answer);
        });

        socket.on('connect_error', (error) => {
            toast.error('Connection Failed', {
                description: 'Unable to connect to the server. Please check your connection.',
                duration: 2000,
            });
        });

        return () => {
            socket.off('receive-answer');
            socket.off('connect_error');
        };
    }, []);

    // Function to handle the bot's response with typing effect
    const handleBotMessage = (message) => {
        // Add a temporary typing indicator
        setMessages((prevMessages) => [
            ...prevMessages,
            { text: '', sender: 'bot', isLoading: true, fullText: message }
        ]);
        setIsTyping(true);

        // First, show the loading state
        setTimeout(() => {
            // Start character-by-character rendering
            let index = 0;
            const typingInterval = setInterval(() => {
                if (index <= message.length) {
                    setMessages((prevMessages) => {
                        const updatedMessages = [...prevMessages];
                        updatedMessages[updatedMessages.length - 1] = {
                            text: message.slice(0, index),
                            sender: 'bot',
                            fullText: message,
                            isLoading: false
                        };
                        return updatedMessages;
                    });
                    index++;
                } else {
                    clearInterval(typingInterval);
                    setIsTyping(false);
                }
            }, 10);
        }, 1000); // 1-second delay after loading state
    };

    // Function to handle sending a message
    const handleSendMessage = () => {
        console.log(documentId);
        if (inputMessage.trim()) {
            if (!documentId) {
                toast.error('Document Upload Required', {
                    description: 'Please upload a PDF file before sending a message.',
                    duration: 2000,
                });
                return;
            }

            // Display the user's message
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: inputMessage, sender: 'user' },
            ]);

            console.log('Sending documentId:', documentId);
            // Emit the document ID and user's question to the server
            socket.emit('ask-question', { documentId, question: inputMessage });

            // Clear the input field
            setInputMessage('');
        }
    };

    return (
        <>
            <Toaster richColors position="top-right" />
            <div className="flex flex-col h-screen w-full bg-white pt-20 pb-20">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => (
                        <div key={index} className="flex items-start space-x-4 lg:pl-16">
                            <img
                                src={message.sender === 'bot' ? AIAvatar : UserAvatar}
                                alt={`${message.sender} Avatar`}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className={`p-3 rounded-lg ${message.sender === 'bot' ? 'text-black' : 'text-black'} text-start`}>
                                {message.isLoading ? (
                                    <span className="animate-pulse text-gray-500">Generating response...</span>
                                ) : (
                                    <ReactMarkdown>{message.text}</ReactMarkdown>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white flex items-center space-x-2 border rounded-lg border-gray-300 fixed bottom-6 left-4 right-4 w-auto shadow-lg sm:left-6 sm:right-6 md:left-10 md:right-10">
                    <input
                        type="text"
                        className="flex-1 py-4 px-4 rounded-full text-sm text-black outline-none bg-white"
                        placeholder="Send a message..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                        className="text-black py-2 px-4 rounded-lg"
                        onClick={handleSendMessage}
                    >
                        <img src={SendArrow} alt="Send Arrow" className="w-7 h-7" />
                    </button>
                </div>
            </div>
        </>
    );
}

export default Chat;
