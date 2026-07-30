const generatedIcons = new Map();

const CATEGORY_ICON_RULES = [
  {
    test:
      /(ресторан|кафе|еда|food|restaurant|cafe|ovqat|taom|oshxona|restoran|kafe)/i,
    icon: "cutlery",
  },
  {
    test: /(магаз|shop|goods|товар|do[ʻ'’]?kon|savdo|market|tovar)/i,
    icon: "bag",
  },
  {
    test: /(красот|spa|beauty|go[ʻ'’]?zallik|salon)/i,
    icon: "sparkles",
  },
  {
    test:
      /(здоров|медиц|врач|health|medical|sog[ʻ'’]?liq|tibbiyot|shifokor|dorixona)/i,
    icon: "heart",
  },
  {
    test:
      /(развлеч|игр|entertain|game|ko[ʻ'’]?ngil|o[ʻ'’]?yin|kino|attraksion)/i,
    icon: "gamepad",
  },
  { test: /(азс|заправ|fuel|gas|yoqilg[ʻ'’]?i|benzin)/i, icon: "fuel" },
  { test: /(отел|hotel|mehmonxona)/i, icon: "hotel" },
  { test: /(сервис|услуг|service|xizmat|servis)/i, icon: "service" },
  { test: /(дет|kids|children|child|bola|bolalar)/i, icon: "kids" },
  {
    test: /(образован|учеб|education|ta[ʻ'’]?lim|o[ʻ'’]?quv|maktab)/i,
    icon: "education",
  },
  { test: /(спорт|фитнес|sport|fitness|fitnes)/i, icon: "sport" },
  {
    test: /(отдых|путешеств|travel|trip|tour|sayohat|turizm|dam olish)/i,
    icon: "travel",
  },
];

function resolveCategoryIconType(name = "") {
  const normalized = String(name).trim().toLowerCase();
  const matchedRule = CATEGORY_ICON_RULES.find((rule) =>
    rule.test.test(normalized)
  );
  return matchedRule?.icon || "grid";
}

function getIconMarkup(iconType) {
  const icons = {
    cutlery:
      '<path d="M11 8v6M13 8v6M15 8v6M11 14q0 3.5 2 3.5V28M22 8c5 1 5 9 0 9v11"/>',
    bag: '<path d="M10 16h16l-2 12H12L10 16z"/><path d="M14 16v-2a4 4 0 0 1 8 0v2"/>',
    sparkles:
      '<circle cx="12" cy="14" r="3.5"/><circle cx="12" cy="24" r="3.5"/><line x1="15" y1="12.2" x2="29" y2="8"/><line x1="15" y1="25.8" x2="29" y2="30"/><line x1="22" y1="18" x2="29" y2="8"/><line x1="22" y1="18" x2="29" y2="30"/>',
    heart:
      '<path d="M18 28C18 28 8 21.5 8 14.5A6.5 6.5 0 0 1 18 10.8a6.5 6.5 0 0 1 10 3.7C28 21.5 18 28 18 28z"/>',
    gamepad:
      '<rect x="9" y="15" width="18" height="12" rx="4"/><line x1="13" y1="21" x2="17" y2="21"/><line x1="15" y1="19" x2="15" y2="23"/><circle cx="22" cy="20" r="1"/><circle cx="24" cy="22" r="1"/>',
    fuel:
      '<path d="M11 28V12a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M7 28h24"/><path d="M23 14h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2"/><line x1="11" y1="18" x2="23" y2="18"/>',
    hotel:
      '<rect x="10" y="14" width="16" height="14" rx="1"/><path d="M14 28v-5h8v5"/><rect x="13" y="17" width="3" height="3"/><rect x="20" y="17" width="3" height="3"/><rect x="13" y="22" width="3" height="3"/><rect x="20" y="22" width="3" height="3"/><path d="M18 9v5M13 12l5-3 5 3"/>',
    service:
      '<path d="M23 9c-3.5 0-6.5 3-6.5 6.5 0 1.1.3 2.1.8 3L8.5 27.3a2 2 0 0 0 2.8 2.8l8.8-8.8c.9.5 1.9.8 3 .8 3.5 0 6.5-3 6.5-6.5 0-1.3-.4-2.5-1-3.5l-3.5 3.5-2.5-2.5 3.5-3.5A6.4 6.4 0 0 0 23 9z"/>',
    kids: '<circle cx="18" cy="11" r="3.5"/><path d="M12 20c0-3.3 2.7-6 6-6s6 2.7 6 6v4H12v-4z"/><line x1="15" y1="24" x2="14" y2="29"/><line x1="21" y1="24" x2="22" y2="29"/>',
    education:
      '<path d="M8 16.5l10-4.5 10 4.5-10 4.5z"/><path d="M13 21v4c0 2.2 2.2 4 5 4s5-1.8 5-4v-4"/><line x1="28" y1="16.5" x2="28" y2="23"/><path d="M26.5 23l1.5 2.5 1.5-2.5z"/>',
    sport:
      '<line x1="13" y1="18" x2="23" y2="18"/><rect x="8" y="15" width="5" height="6" rx="1"/><rect x="23" y="15" width="5" height="6" rx="1"/><line x1="5" y1="18" x2="9" y2="18"/><line x1="27" y1="18" x2="31" y2="18"/>',
    travel:
      '<rect x="10" y="15" width="16" height="13" rx="2"/><path d="M14 15v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="21" x2="26" y2="21"/><line x1="14" y1="21" x2="14" y2="28"/><line x1="22" y1="21" x2="22" y2="28"/>',
    grid: '<rect x="10" y="10" width="7" height="7" rx="1"/><rect x="19" y="10" width="7" height="7" rx="1"/><rect x="10" y="19" width="7" height="7" rx="1"/><rect x="19" y="19" width="7" height="7" rx="1"/>',
  };
  return icons[iconType] || icons.grid;
}

export function buildCategoryIconDataUrl(name = "", isActive = false) {
  const cacheKey = `${String(name).trim().toLowerCase()}|${isActive ? 1 : 0}`;
  if (generatedIcons.has(cacheKey)) {
    return generatedIcons.get(cacheKey);
  }

  const iconType = resolveCategoryIconType(name);
  const strokeColor = isActive ? "#0F172A" : "#FFFFFF";
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 36 36">
  <g fill="none" stroke="${strokeColor}" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9">
    ${getIconMarkup(iconType)}
  </g>
</svg>`;

  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  generatedIcons.set(cacheKey, url);
  return url;
}
