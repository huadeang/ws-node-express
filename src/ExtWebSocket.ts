import * as WebSocket from 'ws';

/*
type ObjectAlias = WebSocket;

interface ExtWebSocket extends ObjectAlias{
    isAlive: boolean;
}*/
export class ExtWebSocket extends WebSocket{
    
    isAlive: boolean = false;

    constructor(address:string,clientOptions:WebSocket.ClientOptions){
        super(address,clientOptions);
    }
}

