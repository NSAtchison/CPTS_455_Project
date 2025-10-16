import React from "react";
import { Box, ThemeProvider } from "@mui/material";
import { ExampleButton } from "./ui/ExampleButton";
import { theme } from "./api/theme";
import { CssBaseline, Stack } from "@mui/material";
import { Navigate, RouterProvider, createHashRouter } from "react-router-dom";
import { routes } from './api/constants';

// Try to avoid having much, if any, logic in this file.
// This is always loaded, so we want to keep it light an small.
const MainPage = React.memo(() => (
    <ThemeProvider theme={theme}>
        <Box style={{padding: 10, boxSizing: "border-box", width: "100%", height: "100%",}}>
            <ExampleButton />
        </Box>
    </ThemeProvider>
));

const router = createHashRouter([
    { path: "*", element: <Navigate to={routes.mainPage} />},
    {
        path: routes.mainPage,
        element: <MainPage />
    },
]);

export const App = React.memo(() => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Stack sx={{height: "100vh", boxSizing: "border-box", overflow: "hidden"}}>
                <RouterProvider router={router} />
            </Stack>
        </ThemeProvider>
    )
})