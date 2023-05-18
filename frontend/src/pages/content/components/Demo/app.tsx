import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { useEffect } from "react";
import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@src/pages/common/styles";
import React from "react";
import {
  MESSAGES,
  domains,
  Domain,
  statusKey,
} from "@src/pages/common/constants";

class MarketplaceExtractor {
  meta: Domain;

  constructor(meta: Domain) {
    this.meta = meta;
  }

  private getSellerName() {
    if (this.meta.sellerName) return this.meta.sellerName;
    const node = document.querySelector(this.meta.sellerSelector);
    if (node) return node.textContent;
  }

  extract() {
    const marketplaceName = this.meta.name;
    const sellerName = this.getSellerName();
    const title = document.querySelector(this.meta.titleSelector).textContent;
    const desc = document.querySelector(
      this.meta.descriptionSelector
    ).textContent;

    return {
      description: `${title} ${desc}`
        .replace(/\s+/g, " ")
        .replace('"', "")
        .trim(),
      marketplaceName,
      sellerName,
    };
  }

  process({ description, marketplaceName, sellerName }) {
    chrome?.runtime?.sendMessage({
      type: MESSAGES.CONTENT.MARKETPLACE,
      content: {
        description,
        marketplaceName,
        sellerName,
      },
    });
  }

  init() {
    this.process(this.extract());
  }
}

class EmailExtractor {
  meta: Domain;

  constructor(meta: Domain) {
    this.meta = meta;
  }

  init() {
    chrome?.runtime?.sendMessage({
      type: MESSAGES.CONTENT.EMAIL,
      content: {
        body: document
          .querySelector(this.meta.bodySelector)
          .textContent.replace(/\s+/g, " ")
          .replace('"', "")
          .trim(),
      },
    });
  }
}

class ExtractorFactory {
  parseUrl(): string {
    return window.location.hostname;
  }

  get() {
    const hostname = this.parseUrl();
    const websiteInfo = domains.find((d) => d.hostname === hostname);

    switch (websiteInfo.type) {
      case "marketplace":
        return new MarketplaceExtractor(websiteInfo);
      case "email":
        return new EmailExtractor(websiteInfo);
      default:
        break;
    }
  }
}

class ZIndexManager {
  base: number;

  constructor() {
    this.base = 10000;
  }

  get() {
    return this.base++;
  }
}

const extractorFactory = new ExtractorFactory();
const zIndexManager = new ZIndexManager();

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
        width: "80px",
        height: "80px",
        position: "fixed",
        bottom: "50px",
        right: "50px",
        zIndex: zIndexManager.get(),
        borderRadius: "50%",
        backgroundColor: "lightcoral",
        transition: "all 300ms",
        "&:hover": {
          boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
        },
        "&:active": {
          boxShadow: "rgba(0, 0, 0, 0.65) 0px 5px 15px",
        },
      }}
    >
      {isLoading ? "L" : ""}
    </Box>
  );
}

export default function App() {
  useEffect(() => {
    console.log("content view loaded");
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <StickyIcon />
    </ThemeProvider>
  );
}
