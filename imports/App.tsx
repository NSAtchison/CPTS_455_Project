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
import ListIcon from "@mui/icons-material/List";
import { UploadFile } from "@mui/icons-material";

type ChatMessageType = {
  username: string;
  text: string;
  isFile: boolean;
  instanceID?: string;
  fileData?: string;
};

const handleFileDownload = (fileName: string) => {
  window.api.openFile(fileName);
};

export default function App() {
  const [username, setUsername] = useState("");
  const [hasUsername, setHasUsername] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [peers, setPeers] = useState<{ id: string; ip: string }[]>([]);

  const [startTime] = useState(() => new Date());

  // 🔹 Metrics state
  const [latencies, setLatencies] = useState<number[]>([]);
  const [bytesSent, setBytesSent] = useState(0);
  const [bytesReceived, setBytesReceived] = useState(0);
  const [deliveryTimes, setDeliveryTimes] = useState<
    { index: number; sentAt: number; deliveredAt: number; latencyMs: number }[]
  >([]);

  // 🔹 Queue of send times for our own messages (for latency measurement)
  const pendingSentTimesReference = React.useRef<number[]>([]);

  const [editUsername, setEditUsername] = useState("");
  const [openSettings, setOpenSettings] = useState(false);

  const [peerListAnchorElement, setPeerListAnchorElement] = React.useState<
    undefined | HTMLElement
  >(undefined);
  const open = Boolean(peerListAnchorElement);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPeerListAnchorElement(event.currentTarget);
  };

  useEffect(() => {
    window.api.onChatMessage((message) => {
      const myID = window.api.getInstanceId();
      const now = performance.now();
      if (message.instanceID === myID) {
        const sentAt = pendingSentTimesReference.current.shift();
        if (sentAt !== undefined) {
          const latencyMs = now - sentAt;

          // Record latency sample
          setLatencies((previous) => [...previous, latencyMs]);

          // Record per-message delivery time (indexed)
          setDeliveryTimes((previous) => {
            const index = previous.length + 1;
            return [
              ...previous,
              { index, sentAt, deliveredAt: now, latencyMs },
            ];
          });
        }

        // Don't re-add our own messages to UI (already added on send)
        return;
      }
      // 🔹 Messages from other users – track bytes received
      if (message.isFile && message.fileData) {
        // Approx original bytes of file from base64
        const base64Size = message.fileData.length;
        const approxBytes = Math.floor((base64Size * 3) / 4);
        setBytesReceived((previous) => previous + approxBytes);
      } else if (!message.isFile && typeof message.text === "string") {
        const textBytes = new TextEncoder().encode(message.text).length;
        setBytesReceived((previous) => previous + textBytes);
      }

      setMessages((previous) => [...previous, message]);
    });
  }, []);

  useEffect(() => {
    window.api.onPeerListUpdated((newPeers) => {
      setPeers(newPeers);
    });
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

    const textBytes = new TextEncoder().encode(input).length;
    setBytesSent((previous) => previous + textBytes);

    const sentAt = performance.now();
    pendingSentTimesReference.current.push(sentAt);

    setMessages((previous) => [...previous, message]);

    window.api.sendChat(input, false);

    setInput("");
  };

  const uploadFile = async () => {
    const filePaths: string[] = await window.api.openFileDialog();
    if (!filePaths || !filePaths[0]) return;

    const filePath: string = filePaths[0];
    const fileRead = await window.api.readFileAsBase64(filePath);

    if(!fileRead.ok) {
      if (fileRead.error === "FILE_TOO_LARGE") {
        alert(
          `File is too large (${(fileRead.size / (1024*1024)).toFixed(2)} MB). ` +
          `Max allowed is ${(fileRead.max / (1024*1024)).toFixed(2)} MB.`
        );
      } else {
        alert('Failed to read file for upload.');
      }
      return;
    }

    const base64Data = fileRead.data

    const myID = window.api.getInstanceId();
    const fileName: string = filePath.split(/[/\\]/).pop() as string;
    const message = {
      username,
      text: fileName,
      instanceID: myID,
      isFile: true,
    };

    const base64Size = base64Data.length;
    const approxBytes = Math.floor((base64Size * 3) / 4);
    setBytesSent((previous) => previous + approxBytes);

    const sentAt = performance.now();
    pendingSentTimesReference.current.push(sentAt);

    setMessages((previous) => [...previous, message]);

    window.api.sendChat(fileName, true, base64Data);

    setInput("");
  };

  const handleSettingsOpen = () => {
    setEditUsername(username);
    setOpenSettings(true);
  };

  const handleClose = () => {
    setPeerListAnchorElement(undefined);
  };

  const buildMetrics = () => {
    const totalMessages = messages.length;

    const messagesSent = messages.filter(
      (m) => m.username === username && !m.isFile,
    ).length;

    const messagesRecieved = messages.filter(
      (m) => m.username !== username && !m.isFile,
    ).length;

    const filesSent = messages.filter(
      (m) => m.username === username && m.isFile,
    ).length;

    const filesRecieved = messages.filter(
      (m) => m.username !== username && m.isFile,
    ).length;

    const endTime = new Date();

    const duration = (endTime.getTime() - startTime.getTime()) / 1000 || 1;

    // 🔹 Latency stats
    const sampleCount = latencies.length;
    const avgLatencyMs =
      sampleCount > 0
        ? latencies.reduce((sum, v) => sum + v, 0) / sampleCount
        : undefined;
    const minLatencyMs = sampleCount > 0 ? Math.min(...latencies) : undefined;
    const maxLatencyMs = sampleCount > 0 ? Math.max(...latencies) : undefined;

    // 🔹 Throughput (messages/sec)
    const messagesSentPerSecond = messagesSent / duration;
    const messagesRecievedPerSecond = messagesRecieved / duration;

    // 🔹 Throughput (bytes/sec)
    const bytesSentPerSecond = bytesSent / duration;
    const bytesReceivedPerSecond = bytesReceived / duration;

    return {
      username,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      totals: {
        totalMessages,
        messagesSent,
        messagesRecieved,
        filesSent,
        filesRecieved,
      },
      peers: {
        currentPeerCount: peers.length,
        peers,
      },
      // 🔹 New metrics block: latency
      latency: {
        sampleCount,
        avgMs: avgLatencyMs,
        minMs: minLatencyMs,
        maxMs: maxLatencyMs,
        // per-message delivery times for your own messages
        perMessage: deliveryTimes,
      },
      // 🔹 New metrics block: throughput
      throughput: {
        bytesSent,
        bytesReceived,
        bytesSentPerSecond,
        bytesReceivedPerSecond,
        messagesSentPerSecond,
        messagesRecievedPerSecond,
      },
    };
  };

  const handleExportMetrics = async () => {
    const metrics = buildMetrics();
    try {
      const result = await window.api.exportMetrics(metrics);
      if (!result?.ok) {
        console.error("Metrics export failed:", result?.reason);
      }
    } catch (error) {
      console.error("Failed to export metrics:", error);
    }
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
        <Button variant={"outlined"} onClick={handleExportMetrics}>
          Export Metrics
        </Button>
        <Menu
          anchorEl={peerListAnchorElement}
          open={open}
          onClose={handleClose}
        >
          {peers.map((peer) => (
            <Button
              key={peer.id}
              onClick={() => window.api.connectToPeer(peer.ip)}
            >
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
              <span>
                {message.username}:
                <span
                  style={{
                    color: "lightblue",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                  onClick={() => handleFileDownload(message.text)}
                >
                  {message.text}
                </span>
              </span>
            ) : (
              <span>
                {message.username}: {message.text}
              </span>
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
