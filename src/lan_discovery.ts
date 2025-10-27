import { BrowserWindow } from "electron";
import dgram from "dgram"
import { connectToPeer } from "./tcp_chat_server";
import { INSTANCE_ID } from "./main";

const DISCOVERY_PORT = 5000;
const DISCOVERY_MSG = JSON.stringify({
  type: "LAN_CHAT_DISCOVERY",
  id: INSTANCE_ID,
});

export const startLANDiscovery = (win: BrowserWindow) => {
    // UDP socket used for discovering other users
    const discoverySocket = dgram.createSocket("udp4");
    

    discoverySocket.on("message", (msg, rinfo) => {
      try {
        const data = JSON.parse(msg.toString());

        if (data.id === INSTANCE_ID) return;

        if (data.type === "LAN_CHAT_DISCOVERY") {
          console.log("Found user:", rinfo.address);

          const response = JSON.stringify({
            type: "LAN_CHAT_RESPONSE",
            id: INSTANCE_ID,
          });

          // Tell the other user that we exist
          discoverySocket.send(
            Buffer.from(response),
            rinfo.port,
            rinfo.address
          );

          // Notify Front-End that we have found another user to possibly chat with
          win.webContents.send("user-found", { ip: rinfo.address })

          // Connect to this peer
          connectToPeer(rinfo.address, win, data.id);
        }
        // ✅ Also handle incoming responses
        if (data.type === "LAN_CHAT_RESPONSE") {
          console.log("Got response from:", rinfo.address);
          win.webContents.send("user-found", { ip: rinfo.address });
          connectToPeer(rinfo.address, win, data.id);
        }
      } catch (err) {
        console.warn("Invalid discovery message:", msg.toString())
      }
    });
    
    discoverySocket.bind(DISCOVERY_PORT, () => {
      discoverySocket.setBroadcast(true);
      console.log(`Listening for LAN peers on port ${DISCOVERY_PORT}`)
    });
    
    // Broadcast our presence every 5 seconds
    setInterval(() => {
      discoverySocket.send(
        Buffer.from(DISCOVERY_MSG),
        0,
        DISCOVERY_MSG.length,
        DISCOVERY_PORT,
        "255.255.255.255"
      );
    }, 5000)

    return discoverySocket;
}
