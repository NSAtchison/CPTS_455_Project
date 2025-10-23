export {};

declare global {
  interface Window {
    api: {
      onChatMessage: (callback: (msg: { text: string }) => void) => void;
      sendChat: (msg: string) => void;
    };
  }
}
