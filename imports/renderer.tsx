import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import App from "./App";

// DONT TOUCH THIS FILE UNLESS YOU KNOW WHAT YOU'RE DOING,
// THIS IS JUST STARTING THE FRONT END OF THE APP

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#1976d2" },
  },
});

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.querySelector("#root")!);
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>,
);
