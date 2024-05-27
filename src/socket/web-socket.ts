// src/websocket/WebSocketServer.ts
import WebSocket from 'ws';
import { Server, IncomingMessage } from 'http';

export class WebSocketServer {
    private wss: WebSocket.Server;
    private authenticate: (token: string) => Promise<any>;

    constructor(server: Server, authenticate: (token: string) => any) {
        this.wss = new WebSocket.Server({ server });
        this.authenticate = authenticate;

        this.wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
            try {
                const token = req.headers.authorization
                if (!token) {
                    throw new Error('Authorization token missing');
                }

                const user = await this.authenticate(token);
                if (!user) {
                    throw new Error('Invalid token');
                }

                console.log('New client connected');


                ws.on('message', (message: string) => {
                    console.log(`Received message: ${message}`);

                    // responder al cliente
                    ws.send(`Echo: ${message}`);
                });

                ws.on('close', () => {
                    console.log('Client disconnected');
                });
            } catch (error) {
                console.error('Error authenticating client:', error);
                ws.close();
            }
        });
    }

    public broadcast(message: string) {
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
}