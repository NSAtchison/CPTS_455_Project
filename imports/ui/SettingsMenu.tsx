import React from "react";
import {
  TextField,
  Button,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export const SettingsMenu: React.FC<{
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  editUsername: string;
  setEditUsername: React.Dispatch<React.SetStateAction<string>>;
  openSettings: boolean;
  setOpenSettings: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
  setUsername,
  editUsername,
  setEditUsername,
  openSettings,
  setOpenSettings,
}) => {
  const handleClose = () => {
    setEditUsername("");
    setOpenSettings(false);
  };

  const handleUsernameChange = () => {
    setUsername(editUsername);
  };

  return (
    <React.Fragment>
      <Dialog open={openSettings} onClose={handleClose}>
        <DialogTitle id={"alert-dialog-title"}>Settings Menu</DialogTitle>
        <DialogContent>
          <Stack>
            <FormGroup row>
              <TextField
                value={editUsername}
                variant={"outlined"}
                onChange={(event) => setEditUsername(event.target.value)}
              />
              <IconButton onClick={handleUsernameChange}>
                <CheckCircleIcon />
              </IconButton>
            </FormGroup>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button autoFocus onClick={handleClose}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};
