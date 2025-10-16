// DON'T EDIT THIS FILE UNLESS YOU KNOW WHAT YOU ARE DOING
// This is run in the render process only
import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";

import { App } from "../imports/App";
import { createRoot } from "react-dom/client";

const render = () => {
    const target  = document.querySelector("#react-target");
    const root = target && createRoot(target);
    root?.render(
        <>
            {/* This provides CSS fixes to be more compatible with more browsers */}
            <CssBaseline />
            <App />
        </>
    )
}

render();