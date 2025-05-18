/* eslint-disable no-unused-vars */
import { useState, useEffect, useContext } from 'react';
import { DocumentContext } from '../context/DocumentProvider';
import axios from 'axios';
import socket from '../socket';
import { Toaster, toast } from 'sonner';

const ChatSidebar = () => {
    const [chats, setChats] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { documentId, setDocumentId } = useContext(DocumentContext);

    useEffect(() => {
        fetchChats();

        socket.on('update-sidebar', ({ documentId: updatedId, chatHistory }) => {
            if (chats.some((chat) => chat.id === updatedId)) {
                setChats((prevChats) =>
                    prevChats.map((chat) =>
                        chat.id === updatedId ? { ...chat, chatHistory, title: chatHistory[0]?.text } : chat
                    )
                );
            } else {
                setChats((prevChats) => [
                    ...prevChats,
                    { id: updatedId, chatHistory, title: chatHistory[0]?.text },
                ]);
            }
        });

        return () => {
            socket.off('update-sidebar');
        };
    }, [chats]);

    const fetchChats = async () => {
        try {
            const response = await axios.get('/chats');
            if (response.data.success) {
                const chatsWithTitles = response.data.chats.map((chat) => ({
                    ...chat,
                    title: chat.chatHistory?.[0]?.text || 'Untitled Chat',
                }));
                setChats(chatsWithTitles);
            }
        } catch {
            toast.error('Failed to fetch chats');
        }
    };

    const handleChatSelect = (id) => setDocumentId(id);
    const handleDelete = async (id) => {
        try {
            await axios.delete(`/chats/${id}`);
            setChats(chats.filter((chat) => chat.id !== id));
        } catch {
            toast.error('Failed to delete chat');
        }
    };

    return (
        <div className={`transition-all duration-300 bg-white border-r border-gray-300 shadow-md ${isSidebarOpen ? 'w-64' : 'w-16'} h-full flex flex-col`}>
            <button
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className="p-2 text-gray-600 hover:text-black transition-colors"
            >
                <svg
                    className={`w-6 h-6 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <div className="overflow-y-auto flex-1">
                {chats.map((chat) => (
                    <div
                        key={chat.id}
                        className={`cursor-pointer p-3 hover:bg-gray-100 rounded-md flex items-center space-x-3 transition-colors ${documentId === chat.id ? 'bg-emerald-200' : ''}`}
                        onClick={() => handleChatSelect(chat.id)}
                    >
                        <span className={`truncate ${isSidebarOpen ? 'block' : 'hidden'}`}>{chat.title || 'Untitled Chat'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatSidebar;