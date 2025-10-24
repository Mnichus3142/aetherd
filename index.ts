import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import { evaluateExpression } from './main';

const app = express();
const server = createServer(app);

app.use(express.static('public'));

const PORT = 3000;

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        console.log(`Received message: ${JSON.parse(message.toString()).message}`);
        ws.send(JSON.stringify({ message: evaluateExpression(JSON.parse(message.toString()).message)}));
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});