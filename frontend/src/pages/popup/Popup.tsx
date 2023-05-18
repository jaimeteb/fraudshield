import React from "react";
import "@pages/popup/Popup.css";
import { theme } from "../common/styles";
import { ThemeProvider } from "@mui/material/styles";
import { Box, Typography, Stack } from "@mui/material";
import { storageKey } from "../common/constants";
import { Signin } from "./components/Signin";

const Popup = () => {
  const [email, setEmail] = React.useState("");

  React.useEffect(() => {
    chrome.storage.sync.get(storageKey, (result) => {
      const token = result[storageKey];
      if (token) {
        setEmail(result[storageKey]);
      }
    });

    const listener = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (storageKey in changes) {
        setEmail(changes[storageKey].newValue);
      }
    };
    /**
     * popup script listener
     */
    chrome.storage.onChanged.addListener(listener);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Stack direction="column" gap="20px" margin="20px">
        <Box component="header">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <Typography
            variant="h5"
            sx={{
              textAlign: "center",
            }}
          >
            {email ? `Hi, ${email}` : "Sign in to continue"}
          </Typography>
        </Box>
        {email ? null : <Signin />}
      </Stack>
    </ThemeProvider>
  );
};

export default Popup;
