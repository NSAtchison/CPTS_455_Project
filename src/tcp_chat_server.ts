import { BrowserWindow } from "electron";
import net from "net"

const TCP_PORT = 5001;

export const peers: net.Socket[] = []

export const startTCPServer = (win: BrowserWindow, INSTANCE_ID: `${string}-${string}-${string}-${string}-${string}`) => {
    const tcpServer = net.createServer((socket) => {
        console.log("New client connected:", socket.remoteAddress);
        peers.push(socket);
    
        // Listen for data from the clients
        socket.on("data", (data) => {
            const lines = data.toString().split("\n");
            for (const line of lines) {
                if (!line.trim()) continue;

                try {
                    const msg = JSON.parse(line); // { id, text }

                    // Ignore messages that came from ourselves
                    if (msg.id === INSTANCE_ID) continue;

                    // Broadcast to all other peers except sender
                    peers.forEach((s) => {
                        if (s !== socket) s.write(line + "\n");
                    });

                    // Send to frontend
                    win.webContents.send("chat-message", { text: msg.text });
                } catch {
                    console.warn("Invalid JSON message:", line);
                }
            }
        });
    
        socket.on("close", () => {
            console.log("Client disconnected:", socket.remoteAddress);
            const disconnect_index = peers.indexOf(socket);
            if(disconnect_index !== -1) peers.splice(disconnect_index, 1);
        });
    });
    
    tcpServer.listen(TCP_PORT, () => {
        console.log(`TCP Server listnening on port ${TCP_PORT}`)
    })
}

const connectedPeers = new Set<string>();

export const connectToPeer = (ip: string, win: BrowserWindow, peerId?: string) => {
    if(peerId && connectedPeers.has(peerId)) return;
    if(peerId) connectedPeers.add(peerId)
    
    const client = net.createConnection({ host: ip, port: TCP_PORT }, () => {
        console.log("Connect to:", ip);
        peers.push(client)
    });

    client.on("data", (data) => {
        const message = data.toString();
        win.webContents.send("chat-message", {text: message});
    })

    client.on("end", () => {
        if(peerId) connectedPeers.delete(peerId);
        const idx = peers.indexOf(client);
        if(idx !== -1) peers.splice(idx, 1);
    });
}
