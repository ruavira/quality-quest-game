// Quality Quest — Profile & Path configuration screen
// Opened via the "Path" nav button. Shows current profile, lets the user edit it,
// and previews how the profile weights the adaptive module order.

import { h, clear } from "./dom.js";
import { moduleWeights, recommendedModuleOrder } from "../engine.js";
import { renderOnboarding, ROLES, SETTINGS } from "./onboarding.js";

const MODULE_META = {
  A: { name: "Reading the Data",           colour: "var(--brand-600)" },
  B: { name: "Using the Data",             colour: "var(--brand-600)" },
  C: { name: "Reading Safety Data (incl. RCA2, FMEA, Just Culture)", colour: "var(--series-2, #c05621)" },
  D: { name: "Quality Review",             colour: "var(--series-3, #2d6a4f)" },
  E: { name: "Regulatory & Accreditation", colour: "var(--series-4, #5e3ea1)" },
  F: { name: "Leading with Data",          colour: "var(--brand-600)" },
  G: { name: "Population & Equity",        colour: "var(--series-2, #c05621)" },
  H: { name: "Communicating Data",         colour: "var(--series-3, #2d6a4f)" },
};

function roleLabel(id) {
  return ROLES.find(r => r.id === id)?.label ?? id;
}
function settingLabel(id) {
  return SETTINGS.find(s => s.id === id)?.label ?? id;
}

export function renderProfile({ profile, onSave, onMap, onPlay, onReview, reviewCount = 0 }) {
  // If no profile yet, go straight to the onboarding form.
  if (!profile) {
    return renderOnboarding({
      initial: null,
      onSubmit: onSave,
    });
  }

  // Root container — swapped between view and edit mode.
  const root = h("div", {});
  let editing = false;

  function mount(node) {
    clear(root);
    root.append(node);
  }

  function showView() {
    editing = false;
    mount(viewMode());
  }
  function showEdit() {
    editing = true;
    mount(editMode());
  }

  // ── View mode ─────────────────────────────────────────────────────────────

  function viewMode() {
    const wrap = h("div", {});

    // ── Profile summary card ──
    const profileCard = h("section", { class: "card" },
      h("p", { class: "eyebrow" }, "Your profile"),
      h("h2", {}, "Your learning path"),
    );

    // Roles
    const roles = profile.roles || [];
    if (roles.length > 0) {
      const roleWrap = h("div", { class: "profile-field" },
        h("div", { class: "profile-field-label" }, "Role"),
        h("div", { class: "profile-chip-row" },
          ...roles.map(r => h("span", { class: "profile-chip" }, roleLabel(r))),
        ),
      );
      profileCard.append(roleWrap);
    }

    // Setting
    if (profile.setting) {
      profileCard.append(
        h("div", { class: "profile-field" },
          h("div", { class: "profile-field-label" }, "Setting"),
          h("div", { class: "profile-chip-row" },
            h("span", { class: "profile-chip" }, settingLabel(profile.setting)),
          ),
        ),
      );
    }

    profileCard.append(
      h("p", { class: "profile-note" },
        "Changing your profile reweights which modules appear next. Your progress and badges are kept."),
      h("button", {
        class: "btn btn-secondary",
        style: { marginTop: "var(--sp-2)" },
        onclick: showEdit,
      }, "Edit profile"),
    );
    wrap.append(profileCard);

    // ── Module priority card ──
    const weights = moduleWeights(profile);
    const ordered = recommendedModuleOrder(profile);          // A–H sorted by weight desc
    const maxWeight = Math.max(...Object.values(weights));

    const priorityCard = h("section", { class: "card" },
      h("p", { class: "eyebrow" }, "How your path is weighted"),
      h("p", { style: { marginBottom: "var(--sp-3)", color: "var(--ink-700)" } },
        "Based on your role and setting, the engine gives more weight to the modules below. " +
        "You'll see those scenarios first on your recommended path."),
    );

    for (const modId of ordered) {
      const meta = MODULE_META[modId];
      if (!meta) continue;
      const w = weights[modId] || 1;
      const pct = Math.round(w / maxWeight * 100);
      const bar = h("div", { class: "profile-module-bar" },
        h("div", { class: "profile-module-bar-label" },
          h("span", { class: "profile-module-id" }, modId),
          h("span", {}, meta.name),
        ),
        h("div", { class: "profile-module-bar-track" },
          h("div", {
            class: "profile-module-bar-fill",
            style: { width: `${pct}%`, background: meta.colour },
          }),
        ),
      );
      priorityCard.append(bar);
    }
    wrap.append(priorityCard);

    // ── Actions card ──
    wrap.append(
      h("section", { class: "card" },
        h("div", { class: "profile-actions" },
          h("button", { class: "btn btn-primary", onclick: onPlay },
            "Continue recommended path"),
          reviewCount > 0 ? h("button", { class: "btn btn-secondary", onclick: onReview },
            `Review ${reviewCount} due skill${reviewCount === 1 ? "" : "s"}`) : null,
          h("button", { class: "btn btn-secondary", onclick: onMap },
            "View module map"),
        ),
      ),
    );

    return wrap;
  }

  // ── Edit mode ─────────────────────────────────────────────────────────────

  function editMode() {
    const wrap = h("div", {});
    wrap.append(
      h("p", { class: "eyebrow" }, "Edit your profile"),
      h("p", { style: { color: "var(--ink-700)", marginBottom: "var(--sp-4)" } },
        "Update your role and setting. Your progress and badges won't change."),
    );

    // Reuse the onboarding form, pre-filled.
    // Replace the "Start playing" label with "Save & rebuild path".
    const form = renderOnboarding({
      initial: profile,
      onSubmit: (newProfile) => {
        onSave(newProfile);   // parent saves and re-renders this screen in view mode
      },
    });

    // Patch the submit button text by querying after mount
    // (renderOnboarding renders synchronously, so we can inspect immediately)
    wrap.append(form);

    // "Cancel" link
    wrap.append(
      h("div", { style: { textAlign: "center", marginTop: "var(--sp-3)" } },
        h("button", { class: "btn btn-ghost", onclick: showView }, "← Cancel, keep current profile"),
      ),
    );

    return wrap;
  }

  showView();
  return root;
}
