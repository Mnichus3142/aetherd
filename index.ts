const info = require('./modules/info');

import { barDatapackCreator } from './lib/classes/barDatapackCreator';

const barDatapack = new barDatapackCreator();

info.startWatcher((data: any) => {
    barDatapack.setter(data);
});

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const server = createServer(app);

const app2 = express();
const server2 = createServer(app2);

app.use(express.static('public'));
app.use(express.json());

app2.use(express.static('public'));
app2.use(express.json());

const runnerPORT = 3000;
const barPORT = 3001;

const wss = new WebSocketServer({ server: server });

const wss2 = new WebSocketServer({ server: server2 });

import {
  atan2, derivative, e, evaluate, log, pi, pow, round, sqrt
} from 'mathjs'

import { Locker } from './lib/locker';
import { Config } from './lib/createConfig';

const locker = new Locker();
locker.prepare();

const config = new Config();

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
    console.log('New client connected to runner');

    ws.on('message', async (message) => {
        // console.log(`Received message: ${JSON.parse(message.toString()).message}`);
        ws.send(JSON.stringify({ message: await evaluateExpression(JSON.parse(message.toString()).message) }));
    });

    ws.on('close', () => {
        console.log('Client disconnected from runner');
    });
});

wss2.on('connection', (ws2) => {
    console.log('New client connected to bar');

	ws2.on('message', async (message) => {
		ws2.send(JSON.stringify({ datapack: barDatapack.getter() }));
		console.log(barDatapack.getter());
	});

    ws2.on('close', () => {
        console.log('Client disconnected from bar');
    });
});

app.post("/run", (req, res) => {
    locker.openApp(req.body.message, req.body.searchInWeb, config.getConfig("aether-launcher").searchQuery);
    res.sendStatus(200);
});

server.listen(runnerPORT, () => {
    console.log(`Aether-runner server runner is listening on http://localhost:${runnerPORT}`);
});

server2.listen(barPORT, () => {
    console.log(`Aether-bar server is listening on http://localhost:${barPORT}`);
});
