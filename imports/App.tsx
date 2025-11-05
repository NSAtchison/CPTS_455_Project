import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
} from "@mui/material";
import { SettingsMenu } from "./ui/SettingsMenu";
import SettingsIcon from "@mui/icons-material/Settings";
import ListIcon from '@mui/icons-material/List';

export default function App() {
  const [username, setUsername] = useState("");
  const [hasUsername, setHasUsername] = useState(false);
  const [messages, setMessages] = useState<
    { username: string; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [peers, setPeers] = useState<{ id: string; ip: string }[]>([]);

  const [editUsername, setEditUsername] = useState("");
  const [openSettings, setOpenSettings] = useState(false);

  const [peerListAnchorEl, setPeerListAnchorEl] = React.useState<undefined | HTMLElement>(undefined);
  const open = Boolean(peerListAnchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPeerListAnchorEl(event.currentTarget);
  };

  useEffect(() => {
    window.api.onChatMessage((message) => {
      const myID = window.api.getInstanceId();
      if (message.instanceID === myID) return;
      setMessages((previous) => [...previous, message]);
    });
  }, []);

  useEffect(() => {
    window.api.onPeerListUpdated((newPeers) => {
      setPeers(newPeers);
    })
  }, []);

  const handleSetUsername = () => {
    if (username.trim() === "") return;
    window.api.setUsername(username);
    localStorage.setItem("username", username);
    setHasUsername(true);
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const myID = window.api.getInstanceId();
    const message = { username, text: input, instanceID: myID };

    setMessages((previous) => [...previous, message]);

    window.api.sendChat(input);

    setInput("");
  };

  const handleSettingsOpen = () => {
    setEditUsername(username);
    setOpenSettings(true);
  };

  const handleClose = () => {
    setPeerListAnchorEl(undefined);
  };

  return (
    <Box display={"flex"} flexDirection={"column"} height={"100vh"} p={2}>
      <Stack direction={"row"}>
        <Typography gutterBottom variant={"h5"}>
          LAN Chat
        </Typography>
        <IconButton onClick={handleSettingsOpen}>
          <SettingsIcon />
        </IconButton>
        <IconButton onClick={handleClick}>
          <ListIcon />
        </IconButton>
        <Menu anchorEl={peerListAnchorEl} open={open} onClose={handleClose}>
          {peers.map((peer) => (
            <Button key={peer.id} onClick={() => window.api.connectToPeer(peer.ip)}>
              Connect to {peer.ip}
            </Button>
          ))}
        </Menu>
        <SettingsMenu
          editUsername={editUsername}
          openSettings={openSettings}
          setEditUsername={setEditUsername}
          setOpenSettings={setOpenSettings}
          setUsername={setUsername}
        />
      </Stack>

      <Paper elevation={3} sx={{ flexGrow: 1, overflowY: "auto", mb: 2, p: 2 }}>
        {messages.map((message, index) => (
          <Typography key={index}>
            {message.username}: {message.text}
          </Typography>
        ))}
      </Paper>

      <Box display={"flex"} gap={1}>
        <TextField
          fullWidth
          label={"Message"}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && sendMessage()}
        />
        <Button variant={"contained"} onClick={sendMessage}>
          Send
        </Button>
      </Box>
      <Dialog open={!hasUsername}>
        <DialogTitle>Enter Your Username</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={"Username"}
            margin={"dense"}
            type={"text"}
            value={username}
            variant={"standard"}
            onChange={(event) => setUsername(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleSetUsername()}
          />
        </DialogContent>
        <DialogActions>
          <Button variant={"contained"} onClick={handleSetUsername}>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
