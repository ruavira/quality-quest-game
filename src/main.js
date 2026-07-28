// Quality Quest — application orchestrator.

import { getState, saveProfile, recordAnswer, awardBadge, setMeta, exportTranscript, clearAll, subscribe } from "./state.js";
import { loadContent } from "./content.js";
import { buildPath, buildModulePath, checkBadges } from "./engine.js";
import { mount, h } from "./ui/dom.js";
import { renderSplash } from "./ui/splash.js";
import { renderOnboarding } from "./ui/onboarding.js";
import { renderScenario } from "./ui/scenario.js";
import { renderDebrief } from "./ui/debrief.js";
import { renderMap } from "./ui/map.js";
import { renderProfile } from "./ui/profile.js";
import { renderCaseFile } from "./ui/caseFile.js";
import { setupInstall } from "./ui/install.js";

const appRoot = document.getElementById("app-root");
const route = { screen: "splash", current: null, path: [], pathIndex: 0, lastResult: null };

let content;

async function boot() {
  try {
    content = await loadContent();
  } catch (e) {
    console.error("Failed to load content:", e);
    mount(appRoot, h("div", { class: "card" },
      h("h2", {}, "Quality Quest couldn’t load its content."),
      h("p", {}, "Check your connection and try again. If the problem persists, the offline cache may be incomplete."),
      h("button", { class: "btn btn-primary", onclick: () => location.reload() }, "Retry"),
    ));
    return;
  }
  setupInstall(document.body, getState(), setMeta);
  render();
}

function render() {
  const state = getState();
  switch (route.screen) {
    case "splash":      return renderSplashScreen(state);
    case "onboarding":  return renderOnboardingScreen(state);
    case "profile":     return renderProfileScreen(state);
    case "summary":     return renderSummaryScreen(state);
    case "scenario":    return renderScenarioScreen(state);
    case "debrief":     return renderDebriefScreen(state);
    case "casefile":    return renderCaseFileScreen(state);
  }
}

function renderSplashScreen(state) {
  mount(appRoot, renderSplash({
    hasProfile: !!state.profile,
    onStart:    () => { route.screen = "profile"; render(); },
    onContinue: () => { route.screen = "profile"; render(); },
  }));
}

function renderOnboardingScreen(state) {
  mount(appRoot, renderOnboarding({
    initial: state.profile,
    onSubmit: (profile) => {
      saveProfile(profile);
      startPath();
    },
  }));
}

function renderProfileScreen(state) {
  mount(appRoot, renderProfile({
    profile: state.profile,
    onSave: (profile) => {
      saveProfile(profile);
      // If this was the first-ever profile setup (came from splash), start playing.
      // Otherwise, stay on the profile screen so the user sees the updated weights.
      if (!state.profile) {
        startPath();
      } else {
        route.screen = "profile";
        render();
      }
    },
    onMap:  () => { route.screen = "summary"; render(); },
    onPlay: () => startPath(),
  }));
}

function startPath() {
  const state = getState();
  route.path = buildPath(state.profile, content.scenarios, { length: 12, currentTier: 1 });
  if (route.path.length === 0) {
    route.screen = "casefile";
  } else {
    route.pathIndex = 0;
    route.screen = "scenario";
  }
  render();
}

function renderSummaryScreen(state) {
  mount(appRoot, renderMap({
    library:      content.scenarios,
    answers:      state.progress.answers,
    completedIds: state.progress.completedScenarioIds,
    badges:       state.badges,
    onPlayNext:      () => startPath(),
    onFocusModule:   (moduleId) => startModulePath(moduleId),
    onCaseFile:      () => { route.screen = "casefile"; render(); },
    onReset: () => {
      if (confirm("Clear your profile, progress, and badges? This cannot be undone.")) {
        clearAll();
        route.screen = "splash";
        render();
      }
    },
  }));
}

function startModulePath(moduleId) {
  const state = getState();
  route.path = buildModulePath(moduleId, state.profile, content.scenarios);
  if (route.path.length === 0) {
    // All scenarios in this module are complete — bounce back to map.
    route.screen = "summary";
  } else {
    route.pathIndex = 0;
    route.screen    = "scenario";
  }
  render();
}

function renderScenarioScreen(state) {
  const scenario = route.path[route.pathIndex];
  if (!scenario) { route.screen = "casefile"; render(); return; }
  route.current = scenario;
  mount(appRoot, renderScenario({
    scenario,
    profile: state.profile,
    pathIndex: route.pathIndex,
    pathLength: route.path.length,
    onAnswer: (result) => {
      recordAnswer(scenario, { correct: result.correct });
      route.lastResult = result;
      route.screen = "debrief";
      render();
    },
  }));
}

function renderDebriefScreen(state) {
  const scenario = route.current;
  mount(appRoot, renderDebrief({
    scenario,
    result: route.lastResult,
    isLast: route.pathIndex >= route.path.length - 1,
    onReflect: (text) => recordAnswer(scenario, { correct: route.lastResult.correct, reflection: text }),
    onNext: () => {
      // Re-check badges after each answer.
      const newly = checkBadges(getState(), content.scenarios);
      for (const b of newly) awardBadge(b);
      if (route.pathIndex >= route.path.length - 1) {
        route.screen = "casefile";
      } else {
        route.pathIndex += 1;
        route.screen = "scenario";
      }
      render();
    },
  }));
}

function renderCaseFileScreen(state) {
  mount(appRoot, renderCaseFile({
    profile: state.profile,
    library: content.scenarios,
    completedIds: state.progress.completedScenarioIds,
    answers: state.progress.answers,
    badges: state.badges,
    onBack: () => { route.screen = "summary"; render(); },
    onPrint: () => window.print(),
    onExport: () => {
      const blob = new Blob([JSON.stringify(exportTranscript(), null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quality-quest-transcript-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
  }));
}

// Header nav wiring (Path / Case File buttons)
window.addEventListener("qq:nav", (e) => {
  const screen = e.detail?.screen;
  if (screen === "profile" || screen === "summary" || screen === "casefile") {
    route.screen = screen;
    render();
  }
});

// Service worker registration (PWA / offline)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .catch(err => console.warn("Service worker registration failed:", err));
  });
}

boot();
