import { BrowserWindow } from "electron";
import dgram from "dgram";
import os from "os";
// import { io as ClientIO, Socket } from "socket.io-client";

const DISCOVERY_PORT = 5000;

const getLocalIPs = () => {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
};

const localIPs = getLocalIPs();

const discoveredPeers: { id: string; ip: string }[] = [];

export const startLANDiscovery = (
  win: BrowserWindow,
  SOCKET_PORT: number,
  INSTANCE_ID: `${string}-${string}-${string}-${string}-${string}`,
) => {
  // UDP socket used for discovering other users
  const discoverySocket = dgram.createSocket("udp4");

  discoverySocket.on("message", (message, rinfo) => {
    try {
      const data = JSON.parse(message.toString());

      if (localIPs.includes(rinfo.address)) return; // ignore self

      const peer = { id: data.id, ip: rinfo.address };
      const exists = discoveredPeers.some((p) => p.id === peer.id);

      if (!exists) {
        discoveredPeers.push(peer);
        console.log("Discovered peer:", peer);
        win.webContents.send("peer-list-updated", discoveredPeers);
      } else {
        return;
      }

      if (data.type === "LAN_CHAT_DISCOVERY") {
        console.log("Found user:", rinfo.address);

        const response = JSON.stringify({
          type: "LAN_CHAT_RESPONSE",
          id: INSTANCE_ID,
        });

        // Reply to DISCOVERY_PORT to ensure the peer sees it
        discoverySocket.send(Buffer.from(response), rinfo.port, rinfo.address);
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
    const message = JSON.stringify({
      type: "LAN_CHAT_DISCOVERY",
      id: INSTANCE_ID,
    });

    discoverySocket.send(
      Buffer.from(message),
      0,
      message.length,
      DISCOVERY_PORT,
      "255.255.255.255",
    );
  }, 5000);
};
