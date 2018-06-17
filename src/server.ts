import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
// import {ExtWebSocket}  from './ExtWebSocket';

const app = express();

//initial a simple http server;
const server = http.createServer(app);

//initial a WebSocket server instance
const wss = new WebSocket.Server({ server });

//listen a connection from client
wss.on('connection', (ws: WebSocket) => {
    //connection is up, let's add simple event

    console.log(`Client connected ->${ws.OPEN}`);
    ws.on('message', (message: string) => {
        console.log('On message : ' + message);
    

        //response message to client
        ws.send('Hello you send message : ' + message);

        //try to broadcast message to all client
        const broadcastRegex = /^broadcast\:/;

        if (broadcastRegex.test(message)) {
            message = message.replace(broadcastRegex, '');
            //send message to all client
            console.log(`Client conntectios is -> ${wss.clients.size}`);
            wss.clients.forEach(client => {
                if (client != ws) {
                    client.send(`Hello, broadcast message -> ${message}`);
                }
            });
        }
    });


    //send message imediatly to client when connected.
    ws.send('Hi this is Websocket server');

    ws.on('close',(ws:WebSocket)=>{
        console.log(`Client ${ws} disconected.`);
    });

    ws.on('error',(ws:WebSocket,error:Error)=>{
        console.log(`somthing error on ${ws} ${error}`);
    });
});



//start server

server.listen(8999, () => {
    console.log(`Server started on port 8999 :)`);
});

