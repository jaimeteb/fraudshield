console.log("injected code loaded");

window.addEventListener(
    "PassToInjected",
    function (a: any) {
      console.log(a)
    },
    false
  );

window.dispatchEvent(new CustomEvent("PassToBackground", { detail: "test" }));
