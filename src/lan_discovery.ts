import { BrowserWindow } from "electron";
import dgram from "dgram"
import { connectToPeer } from "./tcp_chat_server";

const DISCOVERY_PORT = 5000;
const DISCOVERY_MSG = "LAN_CHAT_DISCOVERY";

export const startLANDiscovery = (win: BrowserWindow) => {
    // UDP socket used for discovering other users
    const discoverySocket = dgram.createSocket("udp4");
    

    discoverySocket.on("message", (msg, rinfo) => {
      const text = msg.toString()
      if (text === DISCOVERY_MSG) {
        console.log("Found user:", rinfo.address);
        // Tell the other user that we exist
        discoverySocket.send(Buffer.from("LAN_CHAT_RESPONSE"), rinfo.port, rinfo.address);
        // Notify Front-End that we have found another user to possibly chat with
        win.webContents.send("user-found", { ip: rinfo.address })

        connectToPeer(rinfo.address, win)

      }
      // ✅ Also handle incoming responses
      if (text === "LAN_CHAT_RESPONSE") {
        console.log("Got response from:", rinfo.address);
        win.webContents.send("user-found", { ip: rinfo.address });
        connectToPeer(rinfo.address, win);
      }
    })
    
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
