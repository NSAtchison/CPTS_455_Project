import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper, Stack } from "@mui/material";
import { SettingsMenu } from "./ui/SettingsMenu";

export default function App() {
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<{ username: string; text: string }[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const name = prompt("Enter your username:");
    if(name && name.trim() != "") {
      setUsername(name);
      window.api.setUsername(name);
    } else {
      setUsername("Anonymous");
      window.api.setUsername("Anonymous");
    }

    window.api.onChatMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
    });
  }, [])

  const sendMessage = () => {
    if (!input.trim()) return;
    window.api.sendChat(input);
    setMessages((prev) => [...prev, { username: username || "Me", text: input}]);
    setInput("");
  };

  return (
    <Box p={2} display="flex" flexDirection="column" height="100vh">
      <Stack direction="row">
        <Typography variant="h5" gutterBottom>
          LAN Chat
        </Typography>
        <SettingsMenu />
      </Stack>

      <Paper sx={{ flexGrow: 1, overflowY: "auto", mb: 2, p: 2 }} elevation={3}>
        {messages.map((msg, i) => (
          <Typography key={i}>{msg.username}: {msg.text}</Typography>
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
