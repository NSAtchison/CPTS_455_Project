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
          fileData?: string;
        }) => void,
      ) => void;
      sendChat: (text: string, isFile: boolean, fileData?: string) => void;
      setUsername: (name: string) => void;
      getInstanceId: () => string;
      onPeerListUpdated: (cb: (peers: { id: string; ip: string}[]) => void) => void;
      connectToPeer: (ip: string) => void;
      openFileDialog: () => string[];
      readFileAsBase64: (string) => {ok: boolean, data: string, error?: string, size?: number, max?: number};
      openFile: (fileName: string) => void;
      exportMetrics: (metrics: unknown) => Promise<{ ok: boolean; path?: string; reason?: string }>;
    };
  }
}
