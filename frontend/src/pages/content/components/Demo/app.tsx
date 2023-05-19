import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { Box, Typography, Stack, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@src/pages/common/styles";
import React from "react";
import { MESSAGES, domains } from "@src/pages/common/constants";
import { zIndexManager } from "@src/pages/content/services/z-index";
import { StickyIcon } from "../StickyIcon";
import { ReportForm } from "../ReportForm";
import { AnalyzeForm } from "../AnalyzeForm";
import { Stats } from "../Stats";

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
        bottom: "90px",
        right: "90px",
        backgroundColor: "#f4f0ec",
        p: 2,
        zIndex: zIndexManager.get(),
        borderRadius: "10px",
      }}
    >
      {showReportForm ? (
        <ReportForm handleClose={handleClose} />
      ) : showAnalyzeForm ? (
        <AnalyzeForm handleClose={handleClose} />
      ) : (
        <>
          <Stack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ pb: 1 }}
          >
            <Typography variant="h6">
              Fraud probability: {aiResult.probability}%
            </Typography>
            <IconButton aria-label="close" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
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
          <Stats />
        </>
      )}
    </Box>
  ) : null;
}

interface ReportPopupProps {
  setOpen: any;
}

function ReportPopup({ setOpen }: ReportPopupProps) {
  const [showReportForm, setShowReportForm] = React.useState(false);
  const [showAnalyzeForm, setShowAnalyzeForm] = React.useState(false);

  const handleClose = React.useCallback(() => {
    setOpen(false);
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

  return (
    <Box
      sx={{
        width: "300px",
        height: "auto",
        position: "fixed",
        bottom: "90px",
        right: "90px",
        backgroundColor: "#f4f0ec",
        p: 2,
        zIndex: zIndexManager.get(),
        borderRadius: "10px",
      }}
    >
      {showReportForm ? (
        <ReportForm handleClose={handleClose} />
      ) : showAnalyzeForm ? (
        <AnalyzeForm handleClose={handleClose} />
      ) : (
        <>
          <Stack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ pb: 1 }}
          >
            <Typography variant="h6">FraudShield actions</Typography>
            <IconButton aria-label="close" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Stack flexDirection="row" justifyContent="space-between">
            <Button onClick={handleReportClick} size="small" color="error">
              Report content
            </Button>
            <Button onClick={handleAnalyzeClick} size="small" color="warning">
              Analyze
            </Button>
          </Stack>
          <Stats />
        </>
      )}
    </Box>
  );
}

export default function App() {
  const [open, setOpen] = React.useState(false);

  const hasParseOption = domains.find(
    (d) => d.hostname === window.location.hostname
  );

  const handleIconClick = React.useCallback(() => {
    setOpen((prevState) => !prevState);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <StickyIcon handleClickCb={handleIconClick} />
      {hasParseOption ? (
        <ResultPopup />
      ) : open ? (
        <ReportPopup setOpen={setOpen} />
      ) : null}
    </ThemeProvider>
  );
}
