import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { useEffect } from "react";
import { Box, Typography, Stack } from "@mui/material";
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

class ConversationExtractor {
  meta: Domain;

  constructor(meta: Domain) {
    this.meta = meta;
  }

  init() {
    let messagesIn = document.querySelectorAll(this.meta.messageInSelector);
    let messagesOut = document.querySelectorAll(this.meta.messageOutSelector);

    const clonedMessagesIn = [];
    const clonedMessagesOut = [];

    messagesIn.forEach((m) => {
      const clonedNode = m.cloneNode(true);
      clonedNode.textContent = `[in] ${m.textContent}`;
      clonedMessagesIn.push(clonedNode);
    });
    messagesOut.forEach((m) => {
      const clonedNode = m.cloneNode(true);
      clonedNode.textContent = `[out] ${m.textContent}`;
      clonedMessagesOut.push(clonedNode);
    });

    let messages = clonedMessagesIn.concat(clonedMessagesOut);

    // sort based on appearance order in the document
    messages.sort(function (a, b) {
      return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1;
    });

    let contents = messages.map((message) =>
      message.textContent.replace(/\s+/g, " ").replace('"', "").trim()
    );

    chrome?.runtime?.sendMessage({
      type: MESSAGES.CONTENT.CONVERSATION,
      content: {
        messages: contents,
      },
    });
  }
}

class JobListingExtractor {
  meta: Domain;

  constructor(meta: Domain) {
    this.meta = meta;
  }

  init() {
    chrome?.runtime?.sendMessage({
      type: MESSAGES.CONTENT.JOB_LISTING,
      content: {
        company: document
          .querySelector(this.meta.companySelector)
          .textContent.replace(/\s+/g, " ")
          .replace('"', "")
          .trim(),
        description: document
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
      case "conversation":
        return new ConversationExtractor(websiteInfo);
      case "job-listing":
        return new JobListingExtractor(websiteInfo);
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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

function ResultPopup() {
  const [aiResult, setAiResult] = React.useState(null);

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
