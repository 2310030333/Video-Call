// server.js
const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 3000 });

server.on("connection", (socket) => {
    socket.on("message", (message) => {
        // Relay message to other connected clients
        server.clients.forEach((client) => {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
    socket.on("close", () => console.log("Client disconnected"));
});

console.log("Signaling server running on ws://localhost:3000");
