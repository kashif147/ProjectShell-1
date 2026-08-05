// Non-React counterpart to pages/events/EventFallbackImage.jsx - that
// component is a live, DOM-only preview with no file behind it, so it can't
// be sent as an Event's imageUrl. This builds a static, self-contained SVG
// with no external font/network dependency, so it renders correctly in any
// <img> tag, e-mail client, or API consumer - then base64-encodes it as a
// data: URI so it's a real string CreateEventDrawer can persist to
// Event.imageUrl when no file has been uploaded.

const FORMAT_STYLES = {
  "in-person": { accent: "#FF6B57", glyph: "P", label: "In-Person" },
  webinar: { accent: "#F2A93B", glyph: "W", label: "Online" },
  hybrid: { accent: "#FF9457", glyph: "H", label: "Hybrid" },
  course: { accent: "#F2A93B", glyph: "C", label: "Course" },
  conference: { accent: "#FF6B57", glyph: "C", label: "Conference" },
};

function toBase64(str) {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return window.btoa(unescape(encodeURIComponent(str)));
  }
  return Buffer.from(str, "utf-8").toString("base64");
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Greedy word-wrap into at most maxLines, ellipsizing the last line if there's more text than fits. */
function wrapText(text, maxCharsPerLine, maxLines) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    } else {
      current = next;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);
  const fullyConsumed = lines.join(" ").length >= text.trim().length;
  if (lines.length === maxLines && !fullyConsumed) {
    const last = lines[maxLines - 1];
    lines[maxLines - 1] =
      last.length > maxCharsPerLine - 1 ? `${last.slice(0, maxCharsPerLine - 1)}…` : `${last}…`;
  }
  return lines;
}

function formatDate(date) {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d?.getTime?.())) return null;
  return new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

/**
 * Builds a static data: URI SVG for use as Event.imageUrl when no image has
 * been uploaded.
 *
 * @param {string} title
 * @param {string|Date|null} date
 * @param {string|null} venue
 * @param {"in-person"|"webinar"|"hybrid"|"course"|"conference"} format - eyebrow/badge label; an Event Type match (Course/Webinar/Conference) takes priority here over the raw delivery mode, so this alone can't be used to decide whether venue should show (see deliveryFormat).
 * @param {"In-Person"|"Online"|"Hybrid"|null} deliveryFormat - the event's actual delivery mode from computeEventFormat(), independent of the badge label above. Decides whether the venue/location line shows. Falls back to `format` when omitted.
 * @param {number|string|null} cpdHours - e.g. 5 -> "5 CPD Hours" chip
 * @param {string|null} accreditationBody - e.g. "Nursing and Midwifery Board of Ireland"
 */
export function buildEventFallbackImageDataUri({
  title = "",
  date = null,
  venue = null,
  format = "course",
  deliveryFormat = null,
  cpdHours = null,
  accreditationBody = null,
} = {}) {
  const cfg = FORMAT_STYLES[format] || FORMAT_STYLES.course;
  const width = 480;
  const height = 270;

  const cpdText = cpdHours != null && cpdHours !== "" ? `${cpdHours} CPD Hour${Number(cpdHours) === 1 ? "" : "s"}` : null;
  const accreditationLines = accreditationBody ? wrapText(`${accreditationBody} Approved`, 30, 2) : [];
  const dateText = formatDate(date);
  const normalizedDelivery = String(deliveryFormat || format || "").toLowerCase();
  const showVenue = venue && (normalizedDelivery === "in-person" || normalizedDelivery === "hybrid");
  // Date and venue are independent lines (venue below date) rather than one
  // joined/wrapped line, so a long venue name doesn't crowd out the date.
  const metaLines = [
    dateText,
    showVenue ? wrapText(venue, 44, 1)[0] : null,
  ].filter(Boolean);
  const titleLines = title ? wrapText(title, 28, 2) : [];

  // Second, independent pill for the actual delivery mode (In-Person /
  // Online / Hybrid, from computeEventFormat()) - shown alongside the Event
  // Type pill above, not instead of it, and skipped only when it would
  // repeat the same text (e.g. a Webinar's type pill already reads
  // "Online").
  const deliveryLabelMap = { "in-person": "In-Person", online: "Online", hybrid: "Hybrid" };
  const deliveryLabel = deliveryLabelMap[normalizedDelivery] || null;
  const showDeliveryPill = deliveryLabel && deliveryLabel !== cfg.label;

  // Top block grows downward: format eyebrow -> title -> date/venue meta.
  let y = 34;
  const eyebrowWidth = 16 + cfg.label.length * 7;
  const deliveryPillX = 24 + eyebrowWidth + 8;
  const deliveryWidth = showDeliveryPill ? 16 + deliveryLabel.length * 7 : 0;
  const eyebrowSvg = `<rect x="24" y="${y - 14}" width="${eyebrowWidth}" height="22" rx="11" fill="rgba(255,255,255,0.12)"/>
    <text x="${24 + eyebrowWidth / 2}" y="${y + 2}" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="${cfg.accent}" text-anchor="middle">${escapeXml(cfg.label.toUpperCase())}</text>
    ${showDeliveryPill ? `<rect x="${deliveryPillX}" y="${y - 14}" width="${deliveryWidth}" height="22" rx="11" fill="rgba(255,255,255,0.12)"/>
    <text x="${deliveryPillX + deliveryWidth / 2}" y="${y + 2}" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="#F7F3EA" text-anchor="middle">${escapeXml(deliveryLabel.toUpperCase())}</text>` : ""}`;
  y += 36;

  const titleSvg = titleLines
    .map((line, i) => {
      const lineY = y + i * 26;
      return `<text x="24" y="${lineY}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#F7F3EA">${escapeXml(line)}</text>`;
    })
    .join("");
  y += titleLines.length * 26 + (titleLines.length ? 8 : 0);

  const metaSvg = metaLines
    .map((line, i) => {
      const lineY = y + i * 18;
      return `<text x="24" y="${lineY}" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="500" fill="rgba(247,243,234,0.75)">${escapeXml(line)}</text>`;
    })
    .join("");

  // Bottom block grows upward: accreditation -> CPD chip -> bottom margin.
  let bottomY = height - 26;
  const accreditationSvg = accreditationLines
    .slice()
    .reverse()
    .map((line, i) => {
      const lineY = bottomY - i * 16;
      return `<text x="24" y="${lineY}" font-family="Arial, Helvetica, sans-serif" font-size="12.5" font-weight="500" fill="rgba(247,243,234,0.85)">${escapeXml(line)}</text>`;
    })
    .join("");
  if (accreditationLines.length) bottomY -= accreditationLines.length * 16 + 8;

  const cpdChipWidth = cpdText ? 18 + cpdText.length * 7.5 : 0;
  const cpdSvg = cpdText
    ? `<rect x="24" y="${bottomY - 26}" width="${cpdChipWidth}" height="28" rx="6" fill="${cfg.accent}"/>
       <text x="${24 + cpdChipWidth / 2}" y="${bottomY - 8}" font-family="Arial, Helvetica, sans-serif" font-size="13.5" font-weight="700" fill="#0A1F2E" text-anchor="middle">${escapeXml(cpdText)}</text>`
    : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0E3A3C"/>
      <stop offset="100%" stop-color="#0A1F2E"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="18" fill="url(#bg)"/>
  <circle cx="${width - 12}" cy="12" r="100" fill="${cfg.accent}" opacity="0.16"/>
  <circle cx="36" cy="${height - 30}" r="120" fill="${cfg.accent}" opacity="0.05"/>
  <circle cx="${width - 46}" cy="46" r="26" fill="${cfg.accent}"/>
  <text x="${width - 46}" y="54" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#0A1F2E" text-anchor="middle">${cfg.glyph}</text>
  ${eyebrowSvg}
  ${titleSvg}
  ${metaSvg}
  ${accreditationSvg}
  ${cpdSvg}
</svg>`;

  return `data:image/svg+xml;base64,${toBase64(svg)}`;
}
