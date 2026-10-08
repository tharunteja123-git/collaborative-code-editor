/**
 * Thin WebSocket relay for Yjs CRDT document sync.
 * This server holds NO business logic — its only job is relaying
 * Yjs update messages between clients connected to the same room.
 * Auth, rooms, and code execution all live in the FastAPI service.
 */
import http from "http";
import { WebSocketServer } from "ws";
import { setupWSConnection } from "@y/websocket-server/utils";

const PORT = process.env.SYNC_PORT || 1234;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Yjs sync server is running");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (conn, req) => {
  // The room/doc name is taken from the URL path, e.g. ws://host:1234/room-abc123
  setupWSConnection(conn, req);
});

server.listen(PORT, () => {
  console.log(`Yjs sync server listening on ws://localhost:${PORT}`);
});
