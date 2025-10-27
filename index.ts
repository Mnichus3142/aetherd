import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const server = createServer(app);

app.use(express.static('public'));
app.use(express.json());

const PORT = 3000;

const wss = new WebSocketServer({ server });

import {
  atan2, chain, derivative, e, evaluate, log, pi, pow, round, sqrt
} from 'mathjs'

import { Locker } from './lib/locker';

const locker = new Locker();
locker.prepare();

const evaluateExpression = async (prompt: string) => {
    try {
        if (prompt.length < 2) {
            throw new Error('Prompt too short for math evaluation');
        }

        const result = evaluate(prompt, {
            atan2,
            derivative,
            e,
            log,
            pi,
            pow,
            round,
            sqrt
        });

        return result.toString();
    } catch (error) {
        const response = await locker.response(prompt, 5);
        return response.map(key => key[0]);
    }
}

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', async (message) => {
        console.log(`Received message: ${JSON.parse(message.toString()).message}`);
        ws.send(JSON.stringify({ message: await evaluateExpression(JSON.parse(message.toString()).message) }));
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

app.post("/run", (req, res) => {
    locker.openApp(req.body.message);
    res.sendStatus(200);
});

server.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});