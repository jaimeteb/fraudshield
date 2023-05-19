import { Box } from "@mui/material";
import React from "react";
import { statusKey } from "@src/pages/common/constants";
import { extractorFactory } from "@src/pages/content/services/extractor";
import { zIndexManager } from "@src/pages/content/services/z-index";

function StickyIcon() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = React.useCallback(() => {
    const extractorInstance = extractorFactory.get();
    extractorInstance.init();
  }, []);

  React.useEffect(() => {
    const listener = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
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

  return (
    <Box
      onClick={handleClick}
      sx={{
        width: "60px",
        height: "60px",
        position: "fixed",
        bottom: "30px",
        right: "30px",
        zIndex: zIndexManager.get(),
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)",
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
        "L"
      ) : (
        <Box component="img" src={chrome.runtime.getURL("icon-34.png")} />
      )}
    </Box>
  );
}

export default StickyIcon;
