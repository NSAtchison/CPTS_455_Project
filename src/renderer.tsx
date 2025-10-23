import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import App from "./App";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#1976d2" },
  },
});

const root = createRoot(document.getElementById("root")!);
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
);
