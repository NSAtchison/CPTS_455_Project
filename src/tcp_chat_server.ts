import { BrowserWindow } from "electron";
import net from "net"

const TCP_PORT = 5001;

export const startTCPServer = (win: BrowserWindow) => {
    const clients: net.Socket[] = []
    
    const tcpServer = net.createServer((socket) => {
        console.log("New client connected:", socket.remoteAddress);
        clients.push(socket);
    
        // Listen for data from the clients
        socket.on("data", (data) => {
            const message = data.toString();
    
            clients.forEach((s) => {
                if(s !== socket) s.write(message);
            });
    
            win.webContents.send("chat-message", {text: message});
        });
    
        socket.on("close", () => {
            console.log("Client disconnected:", socket.remoteAddress);
            const disconnect_index = clients.indexOf(socket);
            if(disconnect_index >= 0) clients.splice(disconnect_index, 1);
        });
    });
    
    tcpServer.listen(TCP_PORT, () => {
        console.log(`TCP Server listnening on port ${TCP_PORT}`)
    })
}

const connectedPeers = new Set<string>();

export const connectToPeer = (ip: string, win: BrowserWindow, peerId?: string) => {
    if(peerId && connectedPeers.has(ip)) return;
    if(peerId) connectedPeers.add(peerId)
    
    const client = net.createConnection({ host: ip, port: TCP_PORT }, () => {
        console.log("Connect to:", ip);
    });

    client.on("data", (data) => {
        const message = data.toString();
        win.webContents.send("chat-message", {text: message});
    })

    client.on("end", () => console.log("Disconnected from:", ip));
}
