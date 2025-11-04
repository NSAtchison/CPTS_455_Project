export {};

declare global {
  interface Window {
    api: {
      onChatMessage: (callback: (msg: {username: string, text: string, instanceID?: string}) => void) => void;
      sendChat: (text: string) => void;
      setUsername: (name: string) => void;
      getInstanceId: () => string,
    };
  }
}
