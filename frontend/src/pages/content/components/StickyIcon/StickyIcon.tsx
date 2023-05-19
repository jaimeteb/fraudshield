import { Box, CircularProgress, Typography } from "@mui/material";
import React from "react";
import { statusKey, positionKey } from "@src/pages/common/constants";
import { extractorFactory } from "@src/pages/content/services/extractor";
import { zIndexManager } from "@src/pages/content/services/z-index";

function StickyIcon() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [enable, setEnable] = React.useState(true);
  const [hasNotification, setHasNotification] = React.useState(false);

  const prevLocation = React.useRef(window.location.href);

  const handleClick = React.useCallback(() => {
    setHasNotification(false);
    const extractorInstance = extractorFactory.get();
    extractorInstance.init();
  }, []);

  const handleDocumentClick = React.useCallback((evt: any) => {
    if (evt.target.id === "ch-shadow-root") return;

    if (prevLocation.current !== window.location.href) {
      prevLocation.current = window.location.href;
      setHasNotification(true);
    }
  }, []);

  React.useEffect(() => {
    const listener = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (positionKey in changes) {
        if (changes[positionKey].newValue) {
          setEnable(true);
        } else {
          setEnable(false);
        }
      }

      if (statusKey in changes) {
        if (changes[statusKey].newValue === "loading") {
          setIsLoading(true);
        } else if (changes[statusKey].newValue === "idle") {
          setIsLoading(false);
        }
      }
    };
    /**
     * content script listener
     */
    chrome.storage.onChanged.addListener(listener);
  }, []);

  React.useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  return (
    <Box
      onClick={handleClick}
      sx={{
        width: "60px",
        height: "60px",
        position: "fixed",
        bottom: "30px",
        ...(enable ? { right: "30px" } : { left: "30px" }),
        zIndex: zIndexManager.get(),
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)",
        transition: "all 300ms",
        "&:hover": {
          boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
        },
        "&:active": {
          boxShadow: "rgba(0, 0, 0, 0.65) 0px 5px 15px",
        },
      }}
    >
      {isLoading ? (
        <CircularProgress color="primary" />
      ) : (
        <Box component="img" src={chrome.runtime.getURL("icon-34.png")} />
      )}
      {hasNotification ? (
        <Typography
          variant="h5"
          sx={{
            width: "25px",
            height: "25px",
            position: "fixed",
            bottom: "75px",
            ...(enable ? { right: "30px" } : { left: "30px" }),
            zIndex: zIndexManager.get(),
            backgroundColor: "orange",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          !
        </Typography>
      ) : null}
    </Box>
  );
}

export default StickyIcon;
