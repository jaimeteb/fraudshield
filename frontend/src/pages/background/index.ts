import reloadOnUpdate from "virtual:reload-on-update-in-background-script";
import { MESSAGES, storageKey, statusKey } from "../common/constants";

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
};

type MessageType = {
  type: string;
  content: any;
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
  // TODO: email body
  const res = await fetch(`${BASE}${ROUTES.MARKETPLACE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      description: description,
      marketplace_name: marketplaceName,
      seller_name: sellerName,
    }),
  });
  if (res.ok) {
    const data = await res.json();
    console.log(data);
    chrome.storage.sync.set({ [statusKey]: "idle" });
  }
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
      conversation: messages,
      user_email: userEmail,
    }),
  });
  if (res.ok) {
    const data = await res.json();
    chrome.storage.sync.set({ [statusKey]: "idle" });
    sendAiResult(data);
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
    default:
      break;
  }

  // if (message === "test") {
  //   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  //     chrome.tabs.sendMessage(
  //       tabs[0].id,
  //       { action: "open_dialog_box" },
  //       function (response) {}
  //     );
  //   });
  // }

  sendResponse();
});

console.log("background loaded");
