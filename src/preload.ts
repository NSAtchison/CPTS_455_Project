// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  getInstanceId: async (): Promise<string> => {
    return ipcRenderer.invoke("get-instance-id");
  },
  sendChat: (msg: { id: string; text: string }) => ipcRenderer.send("send-chat", msg),
  onChatMessage: (cb: (msg: { text: string }) => void) =>
    ipcRenderer.on("chat-message", (_, msg) => cb(msg)),
  onUserFound: (cb: (user: { ip: string}) => void) => {
    ipcRenderer.on("user-found", (_, user) => cb(user));
  },
});
