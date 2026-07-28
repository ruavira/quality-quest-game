// iOS Safari Add-to-Home-Screen coach-mark + standard PWA install button.

import { h } from "./dom.js";

export function setupInstall(rootEl, state, setMeta) {
  // Standard prompt (Chrome / Edge / Android)
  let deferred = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
    showStandardInstallPrompt(rootEl, deferred, setMeta);
  });

  // iOS Safari path (no beforeinstallprompt)
  if (isIOSSafari() && !isStandalone()) {
    const last = state.meta.installPromptDismissedAt || 0;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - last > sevenDays) showIOSCoachMark(rootEl, setMeta);
  }
}

function showStandardInstallPrompt(rootEl, promptEvent, setMeta) {
  if (document.querySelector(".install-prompt") || isStandalone()) return;
  const node = h("aside", { class: "coach-mark install-prompt", role: "status" },
    h("p", {}, h("strong", {}, "Install Quality Quest"), " for one-click desktop access and offline use after the first successful load."),
    h("div", { class: "install-actions" },
      h("button", {
        class: "btn btn-primary",
        onclick: async () => {
          await promptEvent.prompt();
          const choice = await promptEvent.userChoice;
          if (choice?.outcome === "accepted") node.remove();
        },
      }, "Install Quality Quest"),
      h("button", {
        class: "btn btn-ghost",
        onclick: () => {
          setMeta("installPromptDismissedAt", Date.now());
          node.remove();
        },
      }, "Not now"),
    ),
  );
  rootEl.append(node);
}

function showIOSCoachMark(rootEl, setMeta) {
  if (document.querySelector(".coach-mark")) return;
  const node = h("aside", { class: "coach-mark", role: "status" },
    h("p", {}, "To use Quality Quest offline, tap ", h("strong", {}, "Share"), " → ",
      h("strong", {}, "Add to Home Screen"), ". iOS may forget saved progress after 7 idle days — open at least once a week."),
    h("button", { onclick: () => { setMeta("installPromptDismissedAt", Date.now()); node.remove(); } }, "Got it"),
  );
  rootEl.append(node);
}

function isIOSSafari() {
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
  return isIOS && isSafari;
}

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches ||
         window.navigator.standalone === true;
}
