import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper, Stack, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import { SettingsMenu } from "./ui/SettingsMenu";
import SettingsIcon from '@mui/icons-material/Settings';


export default function App() {
  const [username, setUsername] = useState("");
  const [hasUsername, setHasUsername] = useState(false);
  const [messages, setMessages] = useState<{ username: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  
  const [editUsername, setEditUsername] = useState("");
  const [openSettings, setOpenSettings] = useState(false);

  useEffect(() => {
    window.api.onChatMessage((msg) => {
      const myID = window.api.getInstanceId();
      if (msg.instanceID === myID) return;
      setMessages((prev) => [...prev, msg]);
    });
  }, [])

  const handleSetUsername = () => {
    if (username.trim() === "") return;
    window.api.setUsername(username);
    localStorage.setItem("username", username);
    setHasUsername(true);
  }

  const sendMessage = () => {
    if (!input.trim()) return;

    const myID = window.api.getInstanceId();
    const msg = { username, text: input, instanceID: myID};
    
    setMessages((prev) => [...prev, msg]);

    window.api.sendChat(input);

    setInput("");
  };

  const handleSettingsOpen = () => {
    setEditUsername(username);
    setOpenSettings(true);
  }

  return (
    <Box p={2} display="flex" flexDirection="column" height="100vh">
      <Stack direction="row">
        <Typography variant="h5" gutterBottom>
          LAN Chat
        </Typography>
        <IconButton onClick={handleSettingsOpen}>
            <SettingsIcon />
        </IconButton>
        <SettingsMenu setUsername={setUsername} editUsername={editUsername} setEditUsername={setEditUsername} openSettings={openSettings} setOpenSettings={setOpenSettings}/>
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
      <Dialog open={!hasUsername}>
        <DialogTitle>Enter Your Username</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Username" type="text" fullWidth variant="standard" value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSetUsername()} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSetUsername} variant="contained">
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
