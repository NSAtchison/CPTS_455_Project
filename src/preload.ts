// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { INSTANCE_ID } from "./main";

contextBridge.exposeInMainWorld("api", {
  sendChat: (text: string) => ipcRenderer.send("send-chat", { id: INSTANCE_ID, text }),
  onChatMessage: (cb: (msg: { text: string }) => void) =>
    ipcRenderer.on("chat-message", (_, msg) => cb(msg)),
  onUserFound: (cb: (user: { ip: string}) => void) => {
    ipcRenderer.on("user-found", (_, user) => cb(user));
  },
});
