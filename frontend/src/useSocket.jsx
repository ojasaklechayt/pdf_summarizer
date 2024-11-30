import { useEffect } from 'react';
import socket from './socket';
import { toast } from 'sonner';

const useSocket = () => {
    useEffect(() => {
        socket.connect();
        console.log('Socket connected');
        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            toast.error('Connection Failed', {
                description: 'Unable to connect to the server. Please check your network.',
                duration: 2000,
            });
        });
        return () => {
            socket.off('connect_error');
        };
    }, []);
};

export default useSocket;