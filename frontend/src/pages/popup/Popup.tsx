import React from "react";
import "@pages/popup/Popup.css";
import { theme } from "../common/styles";
import { ThemeProvider } from "@mui/material/styles";
import { Box, Typography, Stack, Button } from "@mui/material";
import { storageKey } from "../common/constants";
import { Signin } from "./components/Signin";

/**
 * TODO:
 * - Toggle position
 * - Disable
 * - Pulse animation
 * - Signup
 * - More websites
 * - Form UX
 */

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

  const handleLogout = React.useCallback(() => {
    chrome.storage.sync.set({ [storageKey]: null });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        gap="10px"
        sx={{
          minHeight: "150px",
          p: "20px",
          background: "radial-gradient(circle at 18.7% 37.8%, rgb(250, 250, 250) 0%, rgb(225, 234, 238) 90%)",
        }}
      >
        <Box component="header">
          {email ? (
            <Typography
              variant="h5"
              sx={{
                textAlign: "center",
              }}
            >
              Welcome to FraudShield
            </Typography>
          ) : null}
          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
            }}
          >
            {email ? `Hi, ${email}` : "Sign in to continue"}
          </Typography>
        </Box>
        {email ? (
          <Button onClick={handleLogout} variant="contained">
            Sign out
          </Button>
        ) : (
          <Signin />
        )}
      </Stack>
    </ThemeProvider>
  );
};

export default Popup;
