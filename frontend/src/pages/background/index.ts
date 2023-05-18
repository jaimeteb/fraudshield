import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate("pages/content/style.scss");

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log(message);

  if (message === "test") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "open_dialog_box" },
        function (response) {}
      );
    });
  }

  sendResponse();
});

console.log("background loaded");
