import React, { useState } from "react";
import { TextField, Button, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';

export const SettingsMenu = () => {
    const [openSettings, setOpenSettings] = useState(false);

    const handleClose = () => {
        setOpenSettings(false);
    }
    return (
        <React.Fragment>
            <IconButton onClick={() => setOpenSettings(true)}>
                <SettingsIcon />
            </IconButton>
            <Dialog open={openSettings} onClose={handleClose}>
                <DialogTitle id="alert-dialog-title">
                    Settings Menu
                </DialogTitle>
                <DialogContent>
                    <Stack>
                        <TextField />
                        <TextField />
                        <TextField />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleClose} autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}

