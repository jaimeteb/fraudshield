import reloadOnUpdate from "virtual:reload-on-update-in-background-script";
import {
  MESSAGES,
  storageKey,
  statusKey,
  statsUsed,
  statsFraud,
  statsReported,
} from "../common/constants";

reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate("pages/content/style.scss");

const BASE = "http://localhost:8000";

const ROUTES = {
  SIGNIN: "/login",
  MARKETPLACE: "/ai/marketplace",
  EMAIL: "/ai/email_body",
  CONVERSATION: "/ai/conversation",
  JOB_LISTING: "/ai/job_listing",
  REPORTS: "/reports",
  ANALYZE: "/crowdsource/analyze",
  GET_STATS: "/stats/user",
};

type MessageType = {
  type: string;
  content: any;
};

const getUserEmail = async () => {
  const res = await chrome.storage.sync.get(storageKey);
  return res[storageKey];
};

const sendAiResult = (result: any) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: MESSAGES.BACKGROUND, content: result },
      function (response) {}
    );
  });
};

const sendAiAnalyzeResult = (result: any) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: MESSAGES.BACKGROUND_ANALYZE, content: result },
      function (response) {}
    );
  });
};

const handleSignIn = async (email: string, password: string) => {
  const res = await fetch(`${BASE}${ROUTES.SIGNIN}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(email + ":" + password)}`,
    },
  });
  if (res.ok) {
    const data = await res.json();
    chrome.storage.sync.set({ [storageKey]: email });
  }
};

const handleMarketPlace = async (
  description: string,
  marketplaceName: string,
  sellerName: string
) => {
  chrome.storage.sync.set({ [statusKey]: "loading" });
  const userEmail = await getUserEmail();

  const res = await fetch(`${BASE}${ROUTES.MARKETPLACE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_email: userEmail,
      description: description,
      marketplace_name: marketplaceName,
      seller_name: sellerName,
    }),
  });
  if (res.ok) {
    const data = await res.json();
    sendAiResult(data);
    chrome.storage.sync.set({ [statusKey]: "idle" });
  }
};

const handleEmail = async (body: string) => {
  chrome.storage.sync.set({ [statusKey]: "loading" });
  const userEmail = await getUserEmail();

  const res = await fetch(`${BASE}${ROUTES.EMAIL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      body,
      user_email: userEmail,
    }),
  });
  if (res.ok) {
    const data = await res.json();
    chrome.storage.sync.set({ [statusKey]: "idle" });
    sendAiResult(data);
  }
};

const handleConversation = async (messages: string[]) => {
  chrome.storage.sync.set({ [statusKey]: "loading" });
  const userEmail = await getUserEmail();

  const res = await fetch(`${BASE}${ROUTES.CONVERSATION}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      conversation: messages.join(" "),
      user_email: userEmail,
    }),
  });
  if (res.ok) {
    const data = await res.json();
    chrome.storage.sync.set({ [statusKey]: "idle" });
    sendAiResult(data);
  }
};

const handleJobListing = async (description: string, company: string) => {
  chrome.storage.sync.set({ [statusKey]: "loading" });
  const userEmail = await getUserEmail();

  const res = await fetch(`${BASE}${ROUTES.JOB_LISTING}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      description: description,
      company: company,
      user_email: userEmail,
    }),
  });
  if (res.ok) {
    const data = await res.json();
    chrome.storage.sync.set({ [statusKey]: "idle" });
    sendAiResult(data);
  }
};

const handleReportForm = async ({ fraudEmail, fraudWebsite, details }) => {
  chrome.storage.sync.set({ [statusKey]: "loading" });
  const userEmail = await getUserEmail();

  const res = await fetch(`${BASE}${ROUTES.REPORTS}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fraud_email: fraudEmail,
      fraud_website: fraudWebsite,
      details: details,
      user_email: userEmail,
    }),
  });
  if (res.ok) {
    const data = await res.json();
    chrome.storage.sync.set({ [statusKey]: "idle" });
  }
};

const handleAnalyzeForm = async ({ fraudEmail, fraudWebsite }) => {
  chrome.storage.sync.set({ [statusKey]: "loading" });

  const res = await fetch(`${BASE}${ROUTES.ANALYZE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fraud_email: fraudEmail,
      fraud_website: fraudWebsite,
    }),
  });
  if (res.ok) {
    const data = await res.json();
    chrome.storage.sync.set({ [statusKey]: "idle" });
    sendAiAnalyzeResult(data);
  }
};

const handleStats = async () => {
  const userEmail = await getUserEmail();

  const res = await fetch(
    `${BASE}${ROUTES.GET_STATS}?` +
      new URLSearchParams({
        user_email: userEmail,
      })
  );
  if (res.ok) {
    const data = await res.json();
    chrome.storage.sync.set({
      [statsUsed]: data.amount_used,
      [statsFraud]: data.amount_fraud,
      [statsReported]: data.amount_reported,
    });
  }
};

chrome.runtime.onMessage.addListener(async function (
  message: MessageType,
  sender,
  sendResponse
) {
  const { type, content } = message;

  switch (type) {
    case MESSAGES.POPUP.SIGNIN:
      handleSignIn(content.email, content.password);
      break;
    case MESSAGES.CONTENT.MARKETPLACE:
      handleMarketPlace(
        content.description,
        content.marketplaceName,
        content.sellerName
      );
      break;
    case MESSAGES.CONTENT.EMAIL:
      handleEmail(content.body);
      break;
    case MESSAGES.CONTENT.CONVERSATION:
      handleConversation(content.messages);
      break;
    case MESSAGES.CONTENT.JOB_LISTING:
      handleJobListing(content.description, content.company);
      break;
    case MESSAGES.REPORT_FORM:
      handleReportForm(content);
      break;
    case MESSAGES.ANALYZE_FORM:
      handleAnalyzeForm(content);
      break;
    case MESSAGES.GET_STATS:
      handleStats();
      break;
    default:
      break;
  }
  sendResponse();
});

console.log("background loaded");
