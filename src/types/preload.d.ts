export {};

declare global {
  interface Window {
    api: {
      onChatMessage: (
        callback: (message: {
          username: string;
          text: string;
          instanceID?: string;
        }) => void,
      ) => void;
      sendChat: (text: string) => void;
      setUsername: (name: string) => void;
      getInstanceId: () => string;
      onPeerListUpdated: (cb: (peers: { id: string; ip: string}[]) => void) => void;
      connectToPeer: (ip: string) => void
    };
  }
}
