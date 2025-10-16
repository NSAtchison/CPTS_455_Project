import { createTheme } from "@mui/material";
import { blue } from "@mui/material/colors";

//Update globals to add more keys to the theme (e.e. "tertiary")
// See this for more info: https://mui.com/material-ui/customization/palette/

//Define our keys here. This is a very simple theme customization.
//There are tools online to pick color sets that match
export const theme = createTheme({
    palette: {
        primary: {
            main: blue[500],
        },
        secondary: {
            main: "#ff4400",
        },
    },
});