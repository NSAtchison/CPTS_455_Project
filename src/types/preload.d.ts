export {};

declare global {
  interface Window {
    api: {
      onChatMessage: (
        callback: (message: {
          username: string;
          text: string;
          isFile: boolean;
          instanceID?: string;
        }) => void,
      ) => void;
      sendChat: (text: string, isFile: boolean, fileData?: string) => void;
      setUsername: (name: string) => void;
      getInstanceId: () => string;
      onPeerListUpdated: (cb: (peers: { id: string; ip: string}[]) => void) => void;
      connectToPeer: (ip: string) => void;
      openFileDialog: () => string[];
      readFileAsBase64: (string) => string;
      openFile: (fileName: string) => void;
    };
  }
}
