import { h } from "./dom.js";

export const ROLES = [
  { id: "qi_specialist",          label: "Quality improvement specialist / coordinator" },
  { id: "patient_safety_officer", label: "Patient safety officer / risk manager" },
  { id: "infection_preventionist",label: "Infection preventionist" },
  { id: "phc_in_charge",          label: "Primary health care facility in-charge" },
  { id: "charge_nurse",           label: "Charge nurse / unit lead" },
  { id: "frontline_clinician",    label: "Frontline clinician (nurse / physician / allied health)" },
  { id: "chw",                    label: "Community health worker / CHEW" },
  { id: "data_analyst",           label: "Healthcare data analyst / informatics" },
  { id: "clinical_educator",      label: "Clinical educator" },
  { id: "moh_programme_officer",  label: "Ministry of Health / programme officer" },
  { id: "regulatory_lead",        label: "Accreditation / regulatory lead" },
  { id: "senior_leadership",      label: "Senior leadership (CMO / CNO / DHO / Medical Director / Programme Director)" },
  { id: "consultant",             label: "External consultant / advisor" },
  { id: "researcher",             label: "Researcher / academic" },
  { id: "student",                label: "Student / trainee" },
];

export const SETTINGS = [
  { id: "district_hospital",  label: "District / community hospital",          group: "lmic" },
  { id: "phc_clinic",         label: "Primary care clinic / health centre",    group: "lmic" },
  { id: "moh_office",         label: "Ministry of Health / programme office",  group: "lmic" },
  { id: "donor_programme",    label: "Donor-funded clinical programme (HIV / TB / malaria)", group: "lmic" },
  { id: "mission_hospital",   label: "Faith-based / mission hospital",         group: "lmic" },
  { id: "community_outreach", label: "Community / outreach",                   group: "lmic" },
  { id: "tertiary_hospital",  label: "Tertiary / academic hospital",           group: "hic" },
  { id: "ltc",                label: "Long-term / residential care",           group: "hic" },
  { id: "mental_health",      label: "Mental health & addictions",             group: "hic" },
  { id: "regulator",          label: "Regulator / accrediting body",           group: "any" },
  { id: "consulting",         label: "Consulting firm / NGO",                  group: "any" },
  { id: "academic",           label: "Academic / research institution",        group: "any" },
];

export function renderOnboarding({ initial, onSubmit }) {
  let step = 1;
  const selected = {
    roles: new Set(initial?.roles || []),
    setting: initial?.setting || null,
  };
  const container = h("section", { class: "card" });

  function render() {
    container.replaceChildren();
    container.append(h("p", { class: "eyebrow" }, `Setup — step ${step} of 2`));
    if (step === 1) container.append(stepRoles());
    else container.append(stepSetting());
  }

  function stepRoles() {
    const wrap = h("div", {});
    wrap.append(h("h2", {}, "What is your role?"));
    wrap.append(h("p", {}, "Pick up to three. This helps us pick scenarios that look like your work."));
    const list = h("div", { class: "choice-list" });
    for (const r of ROLES) {
      const id = `role-${r.id}`;
      const checked = selected.roles.has(r.id);
      const label = h("label", { class: "choice" + (checked ? " is-selected" : "") },
        h("input", {
          type: "checkbox", id, value: r.id, checked,
          onchange: (e) => {
            if (e.target.checked) {
              if (selected.roles.size >= 3) { e.target.checked = false; return; }
              selected.roles.add(r.id);
            } else {
              selected.roles.delete(r.id);
            }
            render();
          }
        }),
        h("div", { class: "choice-body" }, h("div", { class: "choice-title" }, r.label)),
      );
      list.append(label);
    }
    wrap.append(list);

    const actions = h("div", { style: { display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "12px" } },
      h("button", {
        class: "btn btn-secondary",
        onclick: () => { selected.roles.clear(); selected.roles.add("qi_specialist"); render(); }
      }, "Skip — I’m a QI generalist"),
      h("button", {
        class: "btn btn-primary",
        disabled: selected.roles.size === 0,
        onclick: () => { step = 2; render(); }
      }, "Next"),
    );
    wrap.append(actions);
    return wrap;
  }

  function stepSetting() {
    const wrap = h("div", {});
    wrap.append(h("h2", {}, "Where do you work?"));
    wrap.append(h("p", {}, "Pick the closest match. Scenarios use vocabulary from your setting (for example, ‘directorate brief’ rather than ‘board report’ if you work in a Ministry of Health programme)."));

    const groups = [
      { label: "Lower-resource / public-sector settings", items: SETTINGS.filter(s => s.group === "lmic") },
      { label: "Higher-resource settings",                 items: SETTINGS.filter(s => s.group === "hic") },
      { label: "Other",                                    items: SETTINGS.filter(s => s.group === "any") },
    ];
    for (const g of groups) {
      wrap.append(h("p", { class: "eyebrow", style: { marginTop: "16px" } }, g.label));
      const list = h("div", { class: "choice-list" });
      for (const s of g.items) {
        const id = `setting-${s.id}`;
        const checked = selected.setting === s.id;
        list.append(h("label", { class: "choice" + (checked ? " is-selected" : "") },
          h("input", {
            type: "radio", name: "setting", id, value: s.id, checked,
            onchange: () => { selected.setting = s.id; render(); }
          }),
          h("div", { class: "choice-body" }, h("div", { class: "choice-title" }, s.label)),
        ));
      }
      wrap.append(list);
    }

    const actions = h("div", { style: { display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "12px" } },
      h("button", { class: "btn btn-secondary", onclick: () => { step = 1; render(); } }, "Back"),
      h("button", {
        class: "btn btn-primary",
        disabled: !selected.setting,
        onclick: () => onSubmit({
          roles: [...selected.roles],
          setting: selected.setting,
          createdAt: Date.now(),
        })
      }, "Start playing"),
    );
    wrap.append(actions);
    return wrap;
  }

  render();
  return container;
}
