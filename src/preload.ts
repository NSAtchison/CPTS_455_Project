// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

let username = "Anonymouos";

contextBridge.exposeInMainWorld("api", {
  setUsername: (name: string) => {
    username = name;
  },
  sendChat: (msg: string) => ipcRenderer.send("send-chat", {username, msg}),
  onChatMessage: (cb: (msg: {username: string, text: string}) => void) =>
    ipcRenderer.on("chat-message", (_, msg) => cb(msg)),
  onUserFound: (cb: (user: { ip: string}) => void) => {
    ipcRenderer.on("user-found", (_, user) => cb(user));
  },
});
