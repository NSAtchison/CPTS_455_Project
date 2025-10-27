export {};

declare global {
  interface Window {
    api: {
      onChatMessage: (callback: (msg: { text: string }) => void) => void;
      sendChat: (msg: { id: string; text: string }) => void;
      onUserFound: (callback: (user: { ip: string }) => void) => void;
      getInstanceId: () => Promise<string>;
    };
  }
}
