export {};

declare global {
  interface Window {
    api: {
      onChatMessage: (callback: (msg: {username: string, text: string}) => void) => void;
      sendChat: (msg: string) => void;
      onUserFound: (callback: (user: { ip: string }) => void) => void;
      setUsername: (name: string) => void;
    };
  }
}
