const LOWER_RESOURCE_SETTINGS = new Set([
  "district_hospital", "phc_clinic", "moh_office", "donor_programme",
  "mission_hospital", "community_outreach",
]);

const TERMS = {
  lower: {
    board: "directorate brief", board_meeting: "directorate review",
    exec: "Medical Director", exec2: "Programme Director",
    ehr: "HMIS / DHIS2 export", region: "district",
    accrediting_body: "SafeCare assessor",
  },
  higher: {
    board: "board report", board_meeting: "board meeting",
    exec: "Chief Medical Officer", exec2: "Chief Quality Officer",
    ehr: "EHR query", region: "region",
    accrediting_body: "accreditation surveyor",
  },
};

export function terminologyFor(profile) {
  return LOWER_RESOURCE_SETTINGS.has(profile?.setting) ? TERMS.lower : TERMS.higher;
}

export function localizeText(text, profile) {
  if (typeof text !== "string") return text;
  const terms = terminologyFor(profile);
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => terms[key] ?? match);
}

export function localizeValue(value, profile) {
  if (typeof value === "string") return localizeText(value, profile);
  if (Array.isArray(value)) return value.map(item => localizeValue(item, profile));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localizeValue(item, profile)]));
  }
  return value;
}

export function unresolvedTokens(value) {
  const tokens = [];
  const visit = item => {
    if (typeof item === "string") {
      for (const match of item.matchAll(/\{\{(\w+)\}\}/g)) tokens.push(match[1]);
    } else if (Array.isArray(item)) item.forEach(visit);
    else if (item && typeof item === "object") Object.values(item).forEach(visit);
  };
  visit(value);
  return [...new Set(tokens)];
}

