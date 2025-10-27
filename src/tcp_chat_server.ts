import { BrowserWindow } from "electron";
import net from "net"

const TCP_PORT = 5001;

export const peers: net.Socket[] = []

export const startTCPServer = (win: BrowserWindow, INSTANCE_ID: `${string}-${string}-${string}-${string}-${string}`) => {
    const tcpServer = net.createServer((socket) => {
        console.log("New client connected:", socket.remoteAddress);
        peers.push(socket);

        let buffer = "";
    
        // Listen for data from the clients
        socket.on("data", (data) => {
            buffer += data.toString();
            let idx: number;

            while ((idx = buffer.indexOf("\n")) >= 0) {
                const line = buffer.slice(0, idx).trim();
                buffer = buffer.slice(idx + 1);

                if (!line) continue;

                try {
                const msg: { id: string; text: string } = JSON.parse(line);

                // Ignore messages from self
                if (msg.id === INSTANCE_ID) continue;

                // Broadcast to all other connected clients
                peers.forEach((s) => {
                    if (s !== socket) s.write(JSON.stringify(msg) + "\n");
                });

                // Notify renderer
                win.webContents.send("chat-message", { text: msg.text });
                } catch (err) {
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

export const connectToPeer = (ip: string, win: BrowserWindow, INSTANCE_ID: `${string}-${string}-${string}-${string}-${string}`, peerId?: string) => {
    if(peerId && connectedPeers.has(peerId)) return;
    if(peerId) connectedPeers.add(peerId)
    
    const client = net.createConnection({ host: ip, port: TCP_PORT }, () => {
        console.log("Connect to:", ip);
        peers.push(client)
    });

    let buffer = "";

    client.on("data", (data) => {
        buffer += data.toString();

        let idx: number;
        while ((idx = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, idx).trim();
            buffer = buffer.slice(idx + 1);

            if (!line) continue;

            try {
                const msg: { id: string; text: string } = JSON.parse(line);

                if (msg.id === INSTANCE_ID) continue;

                // Broadcast to all other clients
                peers.forEach((s) => {
                    if (s !== client) s.write(JSON.stringify(msg) + "\n");
                });

                win.webContents.send("chat-message", { text: msg.text });
            } catch (err) {
                console.warn("Invalid JSON message:", line);
            }
        }
    });

    client.on("end", () => {
        if(peerId) connectedPeers.delete(peerId);
        const idx = peers.indexOf(client);
        if(idx !== -1) peers.splice(idx, 1);
    });
}
