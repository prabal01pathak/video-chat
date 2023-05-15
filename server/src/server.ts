import express, {Express, Request, Response} from "express";
import * as http from "http";
import * as WebSocket from "ws";

const app: Express = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


const room = {
  users: [],
  messages: [],
}

wss.on("connection", (ws: WebSocket) => {
  ws.on("close", () => {
    console.log("Client disconnected");
  });
  ws.on("message", (message: string) => {
    console.log("Received: %s", message);
    const parsedMessage: any = JSON.parse(message);
    if (parsedMessage.type === 'user') {
      room.users.push(parsedMessage.user);
    } else if (parsedMessage.type === 'message') {
      room.messages.push(parsedMessage.message);
    }
    console.log("clients: ", wss.clients)
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        console.log('sending room', room);
        client.send(JSON.stringify(room));
      }
    });
  });
  ws.send("Hi there, I am a WebSocket server");
});


server.listen(process.env.PORT || 8999, () => {
  console.log(`Server started on port :)`);
});
