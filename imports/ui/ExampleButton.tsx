import React, {useEffect, useState} from "react";
import { Button, Grid, Paper, Stack, Typography } from "@mui/material";
import { images } from '../api/constants';

export const ExampleButton = React.memo(() => {
    const [serverSays, setServerSays] = useState("");
    useEffect(() => {
        const removeListener = window.ipcListeners.testListener(
            (_event, response) => {
                console.log(response);
                setServerSays(response);
            },
        );
        return () => {
            removeListener();
        };
    }, []);

    return (
        <Stack style={{padding: 10, boxSizing: "border-box", width: "100%", height: "100%",}}>
            <Typography>
                {
                    'Test this by pressing the button or triggering "Test Listener" from the top bar.'
                }
            </Typography>

            <Paper sx={{ padding: 2}}>
                <Grid container>
                    <Grid>{serverSays}</Grid>
                    <Grid>
                        <Button variant={"contained"} onClick={async () => setServerSays(await window.ipcMethods.exampleMethod("Hello World"),)}>
                            Call ipcMethod
                        </Button>
                    </Grid>
                    <Grid>
                        <img src={images.testImage} />
                        <img src={images.testImage2} />
                    </Grid>
                </Grid>
            </Paper>
        </Stack>
    );
});