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
import { UploadFile } from "@mui/icons-material";

export default function App() {
  const [username, setUsername] = useState("");
  const [hasUsername, setHasUsername] = useState(false);
  const [messages, setMessages] = useState<
    { username: string; text: string; isFile: boolean }[]
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
    const message = { username, text: input, instanceID: myID, isFile: false };

    setMessages((previous) => [...previous, message]);

    window.api.sendChat(input, false);

    setInput("");
  };

  const uploadFile = async () => {
    const filePaths: string[] = await window.api.openFileDialog();
    const filePath: string = filePaths[0];
    const base64Data = await window.api.readFileAsBase64(filePath);

    const myID = window.api.getInstanceId();
    const fileName: string = filePath.split(/[/\\]/).pop() as string;
    const message = { username, text: fileName, instanceID: myID, isFile: true };

    setMessages((previous) => [...previous, message]);

    window.api.sendChat(fileName, true, base64Data);

    setInput("");
  };

  const handleSettingsOpen = () => {
    setEditUsername(username);
    setOpenSettings(true);
  };

  const handleClose = () => {
    setPeerListAnchorEl(undefined);
  };

  const handleFileDownload = (fileName: string) => {
    window.api.openFile(fileName);
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
            {message.isFile ? (
              <span>{message.username}:
              <span
                style={{ color: 'lightblue', textDecoration: 'underline', cursor: 'pointer' }}
                onClick={() => handleFileDownload(message.text)}
              >
                {message.text}
              </span></span>
            ) : (
              <span>{message.username}: {message.text}</span>
            )}
          </Typography>
        ))}
      </Paper>

      <Box display={"flex"} gap={1}>
        <Button variant={"text"} onClick={uploadFile}>
          <UploadFile></UploadFile>
        </Button>
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
