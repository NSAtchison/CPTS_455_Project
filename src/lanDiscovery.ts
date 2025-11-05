import { BrowserWindow } from "electron";
import dgram from "dgram";
// import { io as ClientIO, Socket } from "socket.io-client";
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

        // connectToPeer(win, rinfo.address, SOCKET_PORT);
        win.webContents.send("peer-found", {
          ip: rinfo.address,
          id: data.id,
        })
      }

      if (data.type === "LAN_CHAT_RESPONSE") {
        console.log("Got response from:", rinfo.address);
        // connectToPeer(win, rinfo.address, SOCKET_PORT);
        win.webContents.send("peer-found", {
          ip: rinfo.address,
          id: data.id,
        })
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