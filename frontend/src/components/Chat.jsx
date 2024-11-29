import { useState } from 'react';
import UserAvatar from '../assets/user-avatar.svg'; // User avatar image
import AIAvatar from '../assets/aibackground.svg'; // Bot avatar image
import SendArrow from '../assets/sendarrow.svg';

function Chat() {
    const [messages, setMessages] = useState([
        { text: 'Hello, how can I help you today?', sender: 'user' },
        { text: 'I need some information about your services.', sender: 'bot' },
        { text: 'Sure, what specifically are you looking for?', sender: 'user' },
        { text: 'Our own Large Language Model (LLM) is a type of AI that can learn from data. We have trained it on 7 billion parameters which makes it better than other LLMs. We are featured on aiplanet.com and work with leading enterprises to help them use AI securely and privately. We have a Generative AI Stack which helps reduce the hallucinations in LLMs and allows enterprises to use AI in their applications.', sender: 'bot' },
    ]);

    const [inputMessage, setInputMessage] = useState('');

    const handleSendMessage = () => {
        if (inputMessage.trim()) {
            setMessages([...messages, { text: inputMessage, sender: 'user' }]);
            setInputMessage('');
        }
    };

    return (
        <div className="flex flex-col h-screen w-full bg-white pt-20 pb-20"> {/* Adjusted pt-16 for header space */}
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Map through the messages to display them */}
                {messages.map((message, index) => (
                    <div key={index} className="flex items-start space-x-4 lg:pl-16">
                        {/* Display avatar depending on sender */}
                        <img
                            src={message.sender === 'bot' ? AIAvatar : UserAvatar} // Alternate avatars based on sender
                            alt={`${message.sender} Avatar`}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div
                            className={'p-3 rounded-lg text-black text-start'}
                        >
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
