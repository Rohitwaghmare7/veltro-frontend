import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
    if (socket?.connected) {
        return socket;
    }

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

    socket = io(SOCKET_URL, {
        auth: {
            token,
        },
        transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
        console.log('✅ Socket.io connected');
    });

    socket.on('disconnect', () => {
        console.log('❌ Socket.io disconnected');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    return socket;
};

export const getSocket = (): Socket | null => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Event listeners for inbox
export const onNewMessage = (callback: (message: any) => void) => {
    socket?.on('new_message', callback);
};

export const onConversationUpdate = (callback: (conversation: any) => void) => {
    socket?.on('conversation_updated', callback);
};

export const offNewMessage = () => {
    socket?.off('new_message');
};

export const offConversationUpdate = () => {
    socket?.off('conversation_updated');
};
