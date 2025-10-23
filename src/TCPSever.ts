import { app } from "electron";
import * as path from "path";
import * as net from "net";
import * as dgram from "dgram";
import { ports } from  "../imports/api/constants"
import { instanceID, peers } from './mainStartup';

const tcpPort = ports.TCPServerPort;

interface ChatMessage {
  type: "chat";
  from: string;
  text: string;
  timestamp: number;
}

interface IntroMessage {
  type: "intro";
  id: string;
  name: string;
  port: number;
}

interface DiscoverMessage {
  type: "discover";
  id: string;
}

interface DiscoverReply {
  type: "discover-reply";
  id: string;
  name: string;
  port: number;
}

type IncomingMessage = ChatMessage | IntroMessage | DiscoverMessage | DiscoverReply;

const handleIncomingMessage = (msg: IncomingMessage, socket: net.Socket) => {
  if (msg.type === "intro") {
    const { id, name, port } = msg;
    if (id === instanceID) return;

    const existing = peers.get(id);
    if (!existing) {
      peers.set(id, { id, name, host: socket.remoteAddress || "unknown", port, socket });
      sendToRenderer("peer-joined", { id, name, host: socket.remoteAddress, port });
    }
  } else if (msg.type === "chat") {
    sendToRenderer("chat-message", { from: msg.from, text: msg.text, timestamp: msg.timestamp });
  }
}

const tcpServer = net.createServer((socket) => {
    socket.setEncoding("utf8");
    let buffer = "";

    socket.on("data", (data) => {
      buffer += data;
      let idx: number;
      while ((idx = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (!line.trim()) continue;

        try {
          const msg: IncomingMessage = JSON.parse(line);
          handleIncomingMessage(msg, socket);
        } catch {
          console.warn("Bad JSON from peer");
        }
      }
    });


    socket.on("close", () => {
      for (const [id, p] of peers.entries()) {
        if (p.socket === socket) {
          peers.delete(id);
          sendToRenderer("peer-left", { id });
        }
      }
    });
});

export const startTCPServer = async () => {
  app.whenReady().then(() => {
    tcpServer.listen(tcpPort, () => {
        console.log("TCP Server listening on port" + tcpPort)
    })
  })
}