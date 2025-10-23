// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  sendChat: (text: string) => ipcRenderer.send("send-chat", text),
  onChatMessage: (cb: (msg: { text: string }) => void) =>
    ipcRenderer.on("chat-message", (_, msg) => cb(msg)),
});
