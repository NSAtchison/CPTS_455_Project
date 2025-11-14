// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
// import { randomUUID } from "crypto";

let username = "Anonymouos";
let instanceID: string | undefined = undefined;

ipcRenderer.on("set-instance-id", (_, id) => {
  instanceID = id;
});

contextBridge.exposeInMainWorld("api", {
  setUsername: (name: string) => {
    username = name;
  },
  getInstanceId: () => instanceID,
  sendChat: (text: string, isFile: boolean, fileData?: string) =>
  ipcRenderer.send("send-chat", { 
    username, 
    text, 
    instanceID, 
    messageID: (globalThis.crypto as any).randomUUID?.() || Math.random().toString(36).slice(2),
    isFile,
    fileData
  }),
  onChatMessage: (
    callback: (message: {
      username: string;
      text: string;
      instanceID?: string;
    }) => void,
  ) => ipcRenderer.on("chat-message", (_, message) => callback(message)),
  onPeerListUpdated: (callback: (peers: { id: string; ip: string }[]) => void) => {
    ipcRenderer.removeAllListeners("peer-list-updated");
    ipcRenderer.on("peer-list-updated", (_, peers) => {
      console.log("Renderer received peer list:", peers); // helpful debug
      callback(peers);
    });
  },
  connectToPeer: (ip: string) => ipcRenderer.send("connect-to-peer", ip),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  readFileAsBase64: async (filePath: string) => {
    return ipcRenderer.invoke('read-file', filePath);
  }
});
