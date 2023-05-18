import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { Box, Typography, Stack, Button } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@src/pages/common/styles";
import React from "react";
import { MESSAGES } from "@src/pages/common/constants";
import { zIndexManager } from "@src/pages/content/services/z-index";
import { StickyIcon } from "../StickyIcon";
import { ReportForm } from "../ReportForm";
import { AnalyzeForm } from "../AnalyzeForm";

function ResultPopup() {
  const [aiResult, setAiResult] = React.useState(null);
  const [showReportForm, setShowReportForm] = React.useState(false);
  const [showAnalyzeForm, setShowAnalyzeForm] = React.useState(false);

  React.useEffect(() => {
    /**
     * background script listener
     */
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === MESSAGES.BACKGROUND) {
        setAiResult(message.content);
      }
      sendResponse();
    });
  }, []);

  const handleClose = React.useCallback(() => {
    setAiResult(null);
    setShowReportForm(false);
    setShowAnalyzeForm(false);
  }, []);

  const handleReportClick = React.useCallback(() => {
    setShowReportForm(true);
    setShowAnalyzeForm(false);
  }, []);

  const handleAnalyzeClick = React.useCallback(() => {
    setShowReportForm(false);
    setShowAnalyzeForm(true);
  }, []);

  return aiResult ? (
    <Box
      sx={{
        width: "300px",
        height: "auto",
        position: "fixed",
        bottom: "130px",
        right: "130px",
        backgroundColor: "lightblue",
        p: 2,
        zIndex: zIndexManager.get(),
      }}
    >
      {showReportForm ? (
        <ReportForm handleClose={handleClose} />
      ) : showAnalyzeForm ? (
        <AnalyzeForm handleClose={handleClose} />
      ) : (
        <>
          <Stack flexDirection="row" justifyContent="space-between">
            <Typography variant="h5" sx={{ pb: 1 }}>
              Fraud probability: {aiResult.probability}
            </Typography>
            <Typography onClick={handleClose} variant="h5" sx={{ pb: 1 }}>
              Close
            </Typography>
          </Stack>
          {aiResult.reasons.map((r) => (
            <Typography variant="body2" sx={{ py: 1 }}>
              {r}
            </Typography>
          ))}
          <Stack flexDirection="row" justifyContent="space-between">
            <Button onClick={handleReportClick} size="small" color="error">
              Report content
            </Button>
            <Button onClick={handleAnalyzeClick} size="small" color="warning">
              Analyze
            </Button>
          </Stack>
        </>
      )}
    </Box>
  ) : null;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <StickyIcon />
      <ResultPopup />
    </ThemeProvider>
  );
}
