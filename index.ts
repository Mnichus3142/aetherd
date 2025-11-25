const info = require('./modules/info');

info.startWatcher((data: any) => {
    console.log("CPU Usage:", data);
});

// import express from 'express';
// import { createServer } from 'http';
// import { WebSocketServer } from 'ws';

// const app = express();
// const server = createServer(app);

// const app2 = express();
// const server2 = createServer(app2);

// app.use(express.static('public'));
// app.use(express.json());

// app2.use(express.static('public'));
// app2.use(express.json());

// const PORT = 3000;
// const PORT2 = 3001;

// const wss = new WebSocketServer({ server: server });

// const wss2 = new WebSocketServer({ server: server2 });

// import {
//   atan2, derivative, e, evaluate, log, pi, pow, round, sqrt
// } from 'mathjs'

// import { Locker } from './lib/locker';
// import { Config } from './lib/createConfig';

// const locker = new Locker();
// locker.prepare();

// const config = new Config();

// const evaluateExpression = async (prompt: string) => {
//     try {
//         if (prompt.length < 2) {
//             throw new Error('Prompt too short for math evaluation');
//         }

//         const result = evaluate(prompt, {
//             atan2,
//             derivative,
//             e,
//             log,
//             pi,
//             pow,
//             round,
//             sqrt
//         });

//         return result.toString();
//     } catch (error) {
//         const response = await locker.response(prompt, 5);
//         return response.map(key => key[0]);
//     }
// }

// wss.on('connection', (ws) => {
//     console.log('New client connected');

//     ws.on('message', async (message) => {
//         console.log(`Received message: ${JSON.parse(message.toString()).message}`);
//         ws.send(JSON.stringify({ message: await evaluateExpression(JSON.parse(message.toString()).message) }));
//     });

//     ws.on('close', () => {
//         console.log('Client disconnected');
//     });
// });

// wss2.on('connection', (ws2) => {
//     console.log('New client connected dupa');

//     ws2.on('close', () => {
//         console.log('Client disconnected dupa');
//     });
// });

// app.post("/run", (req, res) => {
//     locker.openApp(req.body.message, req.body.searchInWeb, config.getConfig("aether-launcher").searchQuery);
//     res.sendStatus(200);
// });

// server.listen(PORT, () => {
//     console.log(`Server is listening on http://localhost:${PORT}`);
// });

// server2.listen(PORT2, () => {
//     console.log(`Server is listening on http://localhost:${PORT2}`);
// });