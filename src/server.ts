import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as jwt from 'jsonwebtoken';
import * as url from 'url';

// import {ExtWebSocket}  from './ExtWebSocket';

const app = express();

app.use(express.json());

// create jwt token
app.get('/login', (req, res) => {
    var token = getToken();
    console.log(`Request token : ${token}`);
    res.statusCode = 200;
    res.send({
        token: token
    });

})

// broadcast message to all client

app.post('/bs', (req, res) => {
    console.log(`Broadcast message ${req.body.name} to ${wss.clients.size} clients. `);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(req.body));
        }
    });
    res.sendStatus(200);
})

//initial a simple http server;

const server = http.createServer(app);

//initial a WebSocket server instance
//const wss = new WebSocket.Server({ server });
const wss = new WebSocket.Server({ noServer: true });

//create multiple path
const wss2 = new WebSocket.Server({ noServer: true });

//simple key
const secretkey = '1234';

//listen a connection from client
wss.on('connection', (ws: WebSocket) => {
    //connection is up, let's add simple event

    console.log(`Client connected ->${ws}`);

    //check authenticate

    ws.on('message', (msg: string) => {
        console.log(`Root msg ${msg}`);
        try {
            var event = JSON.parse(msg);
            ws.emit(event.type, event.payload);

        } catch (err) {
            console.log(`JSON error ${err}`);
        }
    }).on('authenticate', data => {
        console.log(`Authenticating token ${data.token}`);
        jwt.verify(data.token, secretkey, function (error: Error, decoded: any) {
            if (error) {
                //cb(false,401,'Unauthorized')
                console.log(`Unauthorized ${error}`);
            } else {
                //info.req. = decoded;
                console.log(`decoded is ${decoded}`)
                ws.send('Request authenticate success.');
                //cb(true)
            }
        })
    }).on('message', (message: string) => {
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
                if (client != ws && client.readyState === WebSocket.OPEN) {
                    client.send(`Hello, broadcast message -> ${message}`);
                }
            });
        }
    }).on('error', (ws: WebSocket, err: Error) => {
        console.log(`Error ${err}`);
    })


    //send message imediatly to client when connected.
    ws.send('Hi this is Websocket server');

    ws.on('close', (ws: WebSocket) => {
        console.log(`Client ${ws} disconected.`);
    });

    ws.on('error', (ws: WebSocket, error: Error) => {
        console.log(`somthing error on ${ws} ${error}`);
    });

});



function getToken() {
    var token = jwt.sign({ name: 'bank' }, secretkey, {
        expiresIn: 15 * 24 * 60 * 60 * 1000 // 15 days
    })
    return token;
}

wss2.on('connection', (ws: WebSocket) => {
    console.log('wss2 connected.')
    ws.send('You are connected to WSS2 ');
    ws.on('message', (msg: string) => {
        console.log(`Receive message ${msg}`)
    })
})


//create multiple path for web socket
server.on('upgrade', function upgrade(request, socket, head) {
    const pathname = url.parse(request.url).pathname;
    if (pathname === '/test') {
        wss2.handleUpgrade(request, socket, head, function done(ws) {
            wss2.emit('connection', ws, request);
        });
    } else {
        wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request);
        });
    }
})



//start server

server.listen(8999, () => {
    console.log(`Server started on port 8999 :)`);
});

