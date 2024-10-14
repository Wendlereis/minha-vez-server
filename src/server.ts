import { createServer } from "http";
import { Server } from "socket.io";

interface Payload {
  name: string;
}

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const players: string[] = [];

const playersInGame: string[] = [];

io.on("connection", (socket) => {
  socket.on("join", (data: Payload) => {
    players.push(data.name);

    io.emit("players-waiting", players);
  });

  socket.on("join-court", (data: Payload) => {
    playersInGame.push(data.name);

    io.emit("players-in-game", playersInGame);  

    const playerJoiningIndex = players.indexOf(data.name);

    players.splice(playerJoiningIndex, 1);

    io.emit("players-waiting", players);
  });

  socket.on("left-court", (data: Payload) => {
    const playerInGameIndex = playersInGame.indexOf(data.name);

    playersInGame.splice(playerInGameIndex, 1);

    io.emit("players-in-game", playersInGame);

    players.push(data.name);

    io.emit("players-waiting", players);
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

io.listen(3000);
