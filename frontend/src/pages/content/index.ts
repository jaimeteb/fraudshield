console.log("content loaded");

window.addEventListener(
  "PassToBackground",
  function (evt: any) {
    chrome.runtime.sendMessage(evt.detail);
  },
  false
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message);
  if (message.action) {
    window.dispatchEvent(new CustomEvent("PassToInjected", { detail: "to injected" }));
  }
  sendResponse();
});

(() => {
  const e = document.createElement("script");
  (e.src = chrome.runtime.getURL("src/pages/injected/index.js")),
    (e.onload = function () {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.remove();
    }),
    (document.head || document.documentElement).prepend(e);
})();

/**
 * @description
 * Chrome extensions don't support modules in content scripts.
 */
import("./components/Demo");
