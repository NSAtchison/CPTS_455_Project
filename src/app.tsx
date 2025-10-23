import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";

export default function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    window.api.onChatMessage((msg: { text: string }) => {
      setMessages((prev) => [...prev, msg.text]);
    });
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      window.api.sendChat(input);
      setMessages((prev) => [...prev, `Me: ${input}`]);
      setInput("");
    }
  };

  return (
    <Box p={2} display="flex" flexDirection="column" height="100vh">
      <Typography variant="h5" gutterBottom>
        LAN Chat
      </Typography>

      <Paper sx={{ flexGrow: 1, overflowY: "auto", mb: 2, p: 2 }} elevation={3}>
        {messages.map((msg, i) => (
          <Typography key={i}>{msg}</Typography>
        ))}
      </Paper>

      <Box display="flex" gap={1}>
        <TextField
          fullWidth
          label="Message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button variant="contained" onClick={sendMessage}>
          Send
        </Button>
      </Box>
    </Box>
  );
}
