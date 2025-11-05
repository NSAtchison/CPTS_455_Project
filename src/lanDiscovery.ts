import { BrowserWindow } from "electron";
import dgram from "dgram";
import { io as ClientIO, Socket } from "socket.io-client";
import { INSTANCE_ID } from "./main";

const DISCOVERY_PORT = 5000;
const DISCOVERY_MSG = JSON.stringify({
  type: "LAN_CHAT_DISCOVERY",
  id: INSTANCE_ID,
});

const connectedPeers = new Set<string>();

export const startLANDiscovery = (win: BrowserWindow, SOCKET_PORT: number) => {
  // UDP socket used for discovering other users
  const discoverySocket = dgram.createSocket("udp4");

  discoverySocket.on("message", (message, rinfo) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.id === INSTANCE_ID) return; // ignore self

      if (data.type === "LAN_CHAT_DISCOVERY") {
        console.log("Found user:", rinfo.address);

        const response = JSON.stringify({
          type: "LAN_CHAT_RESPONSE",
          id: INSTANCE_ID,
        });

        // Reply to DISCOVERY_PORT to ensure the peer sees it
        discoverySocket.send(Buffer.from(response), rinfo.port, rinfo.address);

        connectToPeer(win, rinfo.address, SOCKET_PORT);
      }

      if (data.type === "LAN_CHAT_RESPONSE") {
        console.log("Got response from:", rinfo.address);
        connectToPeer(win, rinfo.address, SOCKET_PORT);
      }
    } catch {
      console.warn("Invalid discovery message:", message.toString());
    }
  });

  discoverySocket.bind(DISCOVERY_PORT, () => {
    discoverySocket.setBroadcast(true);
    console.log(`Listening for LAN peers on port ${DISCOVERY_PORT}`);
  });

  // Broadcast our presence every 5 seconds
  setInterval(() => {
    discoverySocket.send(
      Buffer.from(DISCOVERY_MSG),
      0,
      DISCOVERY_MSG.length,
      DISCOVERY_PORT,
      "255.255.255.255",
    );
  }, 5000);
};

const connectToPeer = (win: BrowserWindow, ip: string, port: number) => {
  const key = `${ip}:${port}`;
  // If peer is already connected, don't connect again
  if (connectedPeers.has(key)) return;
  connectedPeers.add(key);

  console.log("Connecting to peer Socket.IO server:", key);

  const socket: Socket = ClientIO(`http://${ip}:${port}`, {
    reconnectionAttempts: 3,
    timeout: 2000,
  });

  socket.on("connect", () => {
    console.log("Connected to peer:", ip);
  });

  socket.on("chat-message", (message) => {
    win.webContents.send("chat-message", message);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from peer:", ip);
    connectedPeers.delete(key);
  });
};
