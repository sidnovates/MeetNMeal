const WS_URL = 'ws://localhost:8000';

class WebSocketService {
    constructor() {
        this.ws = null;
        this.handlers = {
            'USER_READY': [],
            'USER_JOINED': [],
            'SESSION_CLOSING': [],
            'SESSION_EXPIRED': [],
        };
    }

    connect(groupId, userId) {
        if (this.ws) {
            this.disconnect();
        }

        this.ws = new WebSocket(`${WS_URL}/ws/${groupId}/${userId}`);

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.dispatch(data.type, data);
            } catch (err) {
                console.error('Failed to parse WS message:', err);
            }
        };

        this.ws.onclose = (event) => {
            console.log('WebSocket disconnected:', event.code, event.reason);
            if (event.code === 1000 && event.reason === "Session Expired") {
                this.dispatch('SESSION_EXPIRED', { message: "Session Expired" });
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    on(eventType, callback) {
        if (this.handlers[eventType]) {
            this.handlers[eventType].push(callback);
        }
        // Return unsubscribe function
        return () => {
            this.handlers[eventType] = this.handlers[eventType].filter(cb => cb !== callback);
        };
    }

    dispatch(eventType, data) {
        if (this.handlers[eventType]) {
            this.handlers[eventType].forEach(callback => callback(data));
        }
    }
}

export const wsService = new WebSocketService();
