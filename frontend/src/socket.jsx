import { io } from 'socket.io-client';

const socket = io('https://pdf-summarizer-uldt.onrender.com');

socket.on('connect', () => {
    console.log('Connected to server');
});

export default socket;
