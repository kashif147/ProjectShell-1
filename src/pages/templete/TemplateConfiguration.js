import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Modal,
  message,
  notification,
  Tooltip,
} from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./TemplateConfiguration.css";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import TableUp, {
  defaultCustomSelect,
  TableAlign,
  TableMenuSelect,
  TableResizeScale,
  TableSelection,
  TableVirtualScrollbar,
} from "quill-table-up";
import "quill-table-up/index.css";
import "quill-table-up/table-creator.css";
import {
  ArrowLeftOutlined,
  CloseOutlined,
  EyeOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import MyInput from "../../component/common/MyInput";
import CustomSelect from "../../component/common/CustomSelect";
import {
  resetTemplateDetails,
  loadtempletedetails,
} from "../../features/templete/templeteDetailsSlice";
import { useDispatch, useSelector } from "react-redux";
import { getBookmarks } from "../../features/templete/BookmarkActions";
import htmlDocx from "html-docx-js/dist/html-docx";

Quill.register({ [`modules/${TableUp.moduleName}`]: TableUp }, true);

const { Text } = Typography;

// Create a local MyAlert function
const myAlert = (type, alertMessage, description) => {
  if (!["success", "error", "info", "warning"].includes(type)) {
    console.warn(`⚠️ Invalid notification type: ${type}`);
    return;
  }

  notification[type]({
    message: alertMessage,
    description,
    placement: "topRight",
  });
};

// Constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Helper function to replace placeholders with data
const replacePlaceholdersWithData = (htmlContent) => {
  if (!htmlContent) return "<p>No content available</p>";

  // Sample data from your JSON
  const sampleData = {
    // Personal Info
    surname: "Azim",
    forename: "Fazal",
    gender: "Male",
    dateOfBirth: "1999-11-11",
    countryPrimaryQualification: "Ireland",

    // Contact Info
    buildingOrHouse: "house",
    streetOrRoad: "Ballycullen",
    areaOrTown: "Dublin",
    eircode: "D16 CC01",
    countyCityOrPostCode: "County Dublin",
    country: "Ireland",
    mobileNumber: "+3533450987765",
    personalEmail: "fazalazim238@gmail.com",
    normalizedEmail: "fazalazim238@gmail.com",

    // Professional Details
    studyLocation: "Not specified",
    startDate: "Not specified",
    graduationDate: "Not specified",
    workLocation: "An Castan Disability Services",
    branch: "Meath",
    region: "Dublin North East",
    grade: "Advanced Nurse Practitioner",
    nmbiNumber: "Not specified",

    // Membership Info
    membershipNumber: "A00004",
    membershipCategory: "Active",
    firstJoinedDate: "2025-12-03",

    // Other
    payrollNumber: "Not specified",
    paymentType: "Not specified",
    paymentFrequency: "Not specified",
    subscriptionStatus: "Active",
    dateResigned: "N/A",
    dateCancelled: "N/A",

    // Reminders
    remindersReminderDate: "Not set",
    remindersType: "Not set",
  };

  let replacedContent = htmlContent;

  // Replace {{placeholder}} format with data
  Object.keys(sampleData).forEach((key) => {
    const placeholder = `{{${key}}}`;
    const value = sampleData[key];
    replacedContent = replacedContent.replace(
      new RegExp(placeholder, "g"),
      value
    );
  });

  // Also handle {placeholder} format (single braces) for backward compatibility
  Object.keys(sampleData).forEach((key) => {
    const placeholder = `{${key}}`;
    const value = sampleData[key];
    replacedContent = replacedContent.replace(
      new RegExp(placeholder, "g"),
      value
    );
  });

  // Add inline styles for tight line spacing
  return replacedContent
    .replace(
      /<p>/g,
      '<p style="margin: 0 0 4px 0; padding: 0; line-height: 1.0;">'
    )
    .replace(
      /<p([^>]*)>/g,
      '<p$1 style="margin: 0 0 4px 0; padding: 0; line-height: 1.0;">'
    )
    .replace(
      /<br\s*\/?>/g,
      '<br style="line-height: 1.0; margin: 0; padding: 0;" />'
    );
};

/** Merge Quill class-based presentation into inline styles so html-docx / Word keep alignment, indent, colors. */
const parseStyleObject = (styleStr) => {
  const out = {};
  if (!styleStr || typeof styleStr !== "string") return out;
  styleStr.split(";").forEach((part) => {
    const idx = part.indexOf(":");
    if (idx === -1) return;
    const k = part.slice(0, idx).trim().toLowerCase();
    const v = part.slice(idx + 1).trim();
    if (k && v) out[k] = v;
  });
  return out;
};

const stringifyStyleObject = (obj) =>
  Object.entries(obj)
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");

const mergeInlineStyles = (el, additions) => {
  const cur = parseStyleObject(el.getAttribute("style"));
  Object.assign(cur, additions);
  const s = stringifyStyleObject(cur);
  if (s) el.setAttribute("style", s);
  else el.removeAttribute("style");
};

const indentPaddingForQuill = (level, tagName) => {
  if (!level || level < 1) return null;
  if (tagName === "LI") return `${1.5 + level * 3}em`;
  return `${level * 3}em`;
};

/** quill-table-up: row wrapParentTag() maps only thead|tbody|tfoot — anything else → wrap(undefined) crash. */
const TABLE_UP_VALID_WRAP_TAGS = new Set(["thead", "tbody", "tfoot"]);

const sanitizeTableUpWrapTagAttrValue = (raw) => {
  const s = String(raw ?? "")
    .replace(/\u00a0/g, " ")
    .trim()
    .toLowerCase();
  return TABLE_UP_VALID_WRAP_TAGS.has(s) ? s : "tbody";
};

const normalizeTableUpDataWrapTagsOnRoot = (rootEl) => {
  if (!rootEl?.querySelectorAll) return;
  // Rows: invalid/missing data-wrap-tag → wrap(undefined). Infer thead|tfoot from parent when Word strips attrs.
  rootEl.querySelectorAll("table.ql-table tr").forEach((tr) => {
    const rawAttr = tr.getAttribute("data-wrap-tag");
    const cleaned = rawAttr
      ? String(rawAttr).replace(/\u00a0/g, " ").trim().toLowerCase()
      : "";
    let candidate = cleaned;
    if (!TABLE_UP_VALID_WRAP_TAGS.has(cleaned)) {
      const section = tr.parentElement?.tagName?.toLowerCase();
      if (section === "thead") candidate = "thead";
      else if (section === "tfoot") candidate = "tfoot";
      else candidate = "tbody";
    }
    tr.setAttribute("data-wrap-tag", sanitizeTableUpWrapTagAttrValue(candidate));
  });
  rootEl.querySelectorAll("[data-wrap-tag]").forEach((el) => {
    if (typeof el.matches === "function" && el.matches("table.ql-table tr")) {
      return;
    }
    el.setAttribute(
      "data-wrap-tag",
      sanitizeTableUpWrapTagAttrValue(el.getAttribute("data-wrap-tag"))
    );
  });
};

const normalizeTableUpWrapTagsInHtmlString = (html) => {
  if (typeof html !== "string" || !html) return html || "<p></p>";
  if (typeof window === "undefined") return html;
  const lower = html.toLowerCase();
  const needsWrapFix = lower.includes("data-wrap-tag");
  const needsTableLayout =
    lower.includes("ql-table") || lower.includes("ql-table-wrapper");
  if (!needsWrapFix && !needsTableLayout) return html;
  try {
    const doc = new DOMParser().parseFromString(
      `<div id="template-wraptag-root">${html}</div>`,
      "text/html"
    );
    const root = doc.getElementById("template-wraptag-root");
    if (!root) return html;
    normalizeTableUpDataWrapTagsOnRoot(root);
    if (needsTableLayout) rehydrateQuillTableUpLayoutOnRoot(root);
    return root.innerHTML;
  } catch {
    return html;
  }
};

const parsePxWidthToken = (raw) => {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s || /%$/.test(s)) return null;
  const n = parseFloat(s);
  return Number.isNaN(n) ? null : n;
};

/** Read quill-table-up column widths (px) from <col>; Word often keeps style when width="" is lost. */
const getTableUpColWidthsPx = (table) => {
  const cg = table.querySelector("colgroup");
  if (!cg) return null;
  const cols = [...cg.querySelectorAll("col")];
  if (!cols.length) return null;
  const out = [];
  for (const col of cols) {
    let raw = (col.getAttribute("width") || "").trim();
    if (!raw) {
      const st = parseStyleObject(col.getAttribute("style")).width;
      raw = (st || "").trim();
    }
    const px = parsePxWidthToken(raw);
    if (px == null) {
      if (/%$/.test(String(raw).trim())) return null;
      out.push(100);
    } else {
      out.push(px);
    }
  }
  return out;
};

/**
 * After DOCX round-trip: restore table width from cols, col styles, table inline width, or first-row cell widths.
 */
const rehydrateQuillTableUpLayoutOnRoot = (rootEl) => {
  if (!rootEl?.querySelectorAll) return;
  rootEl.querySelectorAll("table.ql-table").forEach((table) => {
    table.style.borderCollapse = "collapse";
    table.style.tableLayout = "fixed";
    if (table.hasAttribute("data-full")) {
      table.style.width = "100%";
      return;
    }
    const widths = getTableUpColWidthsPx(table);
    let sumPx = 0;
    let hasPx = false;
    if (widths) {
      sumPx = widths.reduce((a, b) => a + b, 0);
      hasPx = sumPx > 0;
    }
    if (!hasPx) {
      const tw = parseStyleObject(table.getAttribute("style")).width;
      const tn = parsePxWidthToken(tw);
      if (tn != null && tn > 0) {
        sumPx = tn;
        hasPx = true;
      }
    }
    if (!hasPx) {
      const tr0 = table.querySelector("tr");
      if (tr0) {
        let s = 0;
        const cells = [...tr0.children].filter((n) =>
          ["TD", "TH"].includes(n.tagName)
        );
        for (const td of cells) {
          const stw = parseStyleObject(td.getAttribute("style")).width;
          const aw = (td.getAttribute("width") || "").trim();
          const raw = (stw || aw || "").trim();
          const px = parsePxWidthToken(raw);
          if (px != null && px > 0) {
            s += px;
          }
        }
        if (s > 0) {
          sumPx = s;
          hasPx = true;
        }
      }
    }
    if (hasPx && sumPx > 0) {
      table.style.width = `${sumPx}px`;
    }
  });
};

/**
 * Before DOCX: mirror column widths onto <col style>, <table style>, and every row's cells so Word/html-docx keep them.
 */
const materializeTableUpWidthsForDocxRoundTripOnRoot = (rootEl) => {
  if (!rootEl?.querySelectorAll) return;
  rootEl.querySelectorAll("table.ql-table").forEach((table) => {
    if (table.hasAttribute("data-full")) return;
    const widths = getTableUpColWidthsPx(table);
    if (!widths || !widths.length) return;
    const sum = widths.reduce((a, b) => a + b, 0);
    if (sum <= 0) return;
    mergeInlineStyles(table, {
      width: `${sum}px`,
      "table-layout": "fixed",
      "border-collapse": "collapse",
    });
    const cg = table.querySelector("colgroup");
    if (cg) {
      [...cg.querySelectorAll("col")].forEach((col, i) => {
        const px = widths[i];
        if (px == null || px <= 0) return;
        const token = `${px}px`;
        col.setAttribute("width", token);
        mergeInlineStyles(col, { width: token, "min-width": token });
      });
    }
    table.querySelectorAll("tr").forEach((tr) => {
      let colIndex = 0;
      [...tr.children].forEach((node) => {
        if (!["TD", "TH"].includes(node.tagName)) return;
        const cs = Math.max(1, parseInt(node.getAttribute("colspan") || "1", 10));
        let w = 0;
        for (let j = 0; j < cs && colIndex + j < widths.length; j += 1) {
          w += widths[colIndex + j];
        }
        if (w > 0) {
          mergeInlineStyles(node, {
            width: `${w}px`,
            "min-width": `${w}px`,
            "box-sizing": "border-box",
          });
        }
        colIndex += cs;
      });
    });
  });
};

const solidifyQuillHtmlForDocx = (html) => {
  if (typeof window === "undefined" || !html) return html || "<p></p>";
  const QL_COLOR = {
    white: "#fff",
    red: "#e60000",
    orange: "#f90",
    yellow: "#ff0",
    green: "#008a00",
    blue: "#06c",
    purple: "#93f",
    black: "#000",
  };
  const QL_BG = {
    black: "#000",
    red: "#e60000",
    orange: "#f90",
    yellow: "#ff0",
    green: "#008a00",
    blue: "#06c",
    purple: "#93f",
  };
  const QL_FONT = {
    serif: "Georgia, 'Times New Roman', serif",
    monospace: "Monaco, 'Courier New', monospace",
  };
  try {
    const doc = new DOMParser().parseFromString(
      `<div id="template-solidify-root">${html}</div>`,
      "text/html"
    );
    const root = doc.getElementById("template-solidify-root");
    if (!root) return html;

    normalizeTableUpDataWrapTagsOnRoot(root);

    root.querySelectorAll("*").forEach((el) => {
      const cls = el.getAttribute("class");
      if (!cls) return;
      const classes = cls.split(/\s+/).filter(Boolean);
      const additions = {};

      if (classes.includes("ql-align-center")) additions["text-align"] = "center";
      else if (classes.includes("ql-align-right")) additions["text-align"] = "right";
      else if (classes.includes("ql-align-justify")) additions["text-align"] = "justify";

      const indentCl = classes.find((c) => /^ql-indent-\d+$/.test(c));
      if (indentCl) {
        const level = parseInt(indentCl.replace("ql-indent-", ""), 10);
        const pad = indentPaddingForQuill(level, el.tagName);
        if (pad) {
          const rtl = classes.includes("ql-direction-rtl");
          const alignRight = classes.includes("ql-align-right");
          if (rtl && alignRight) additions["padding-right"] = pad;
          else additions["padding-left"] = pad;
        }
      }

      if (classes.includes("ql-direction-rtl")) additions.direction = "rtl";

      classes.forEach((c) => {
        if (c.startsWith("ql-color-")) {
          const key = c.slice("ql-color-".length);
          if (QL_COLOR[key]) additions.color = QL_COLOR[key];
        }
        if (c.startsWith("ql-bg-")) {
          const key = c.slice("ql-bg-".length);
          if (QL_BG[key]) additions["background-color"] = QL_BG[key];
        }
        if (c.startsWith("ql-font-")) {
          const key = c.slice("ql-font-".length);
          if (QL_FONT[key]) additions["font-family"] = QL_FONT[key];
        }
      });

      if (Object.keys(additions).length) mergeInlineStyles(el, additions);

      const remaining = classes.filter(
        (c) =>
          !/^ql-align-(center|right|justify)$/.test(c) &&
          !/^ql-indent-\d+$/.test(c) &&
          !/^ql-color-/.test(c) &&
          !/^ql-bg-/.test(c) &&
          !/^ql-font-/.test(c) &&
          c !== "ql-direction-rtl"
      );
      if (remaining.length) el.setAttribute("class", remaining.join(" "));
      else el.removeAttribute("class");
    });

    materializeTableUpWidthsForDocxRoundTripOnRoot(root);
    rehydrateQuillTableUpLayoutOnRoot(root);

    return root.innerHTML;
  } catch (e) {
    console.warn("solidifyQuillHtmlForDocx:", e);
    return html;
  }
};

// Enhanced DOCX file creator with proper HTML preservation
const createDocxFile = async ({
  name,
  description,
  category,
  type,
  content,
  variables = [],
}) => {
  try {
    console.log("📝 Creating DOCX file with HTML content");
    console.log("📊 Content length:", content?.length);
    console.log("📋 Variables:", variables);

    // Inline Quill classes before DOCX — Word/html-docx drop ql-* classes otherwise.
    const cleanHtmlContent = solidifyQuillHtmlForDocx(content || "<p></p>");

    // Create complete HTML document with proper DOCX-compatible styling
    const completeHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Calibri', Arial, sans-serif;
            line-height: 1.0;
            color: #000000;
            margin: 0;
            padding: 0;
          }
         
          ul, ol {
            margin: 8pt 0;
            padding-left: 36pt;
          }
          .variables-section {
            margin-top: 24pt;
            padding-top: 12pt;
            border-top: 1pt solid #cccccc;
            page-break-inside: avoid;
          }
          .variable-item {
            margin: 6pt 0;
          }
          strong, b {
            font-weight: bold;
          }
          em, i {
            font-style: italic;
          }
          u {
            text-decoration: underline;
          }
          h1 { font-size: 24pt; margin: 24pt 0 12pt 0; }
          h2 { font-size: 18pt; margin: 18pt 0 9pt 0; }
          h3 { font-size: 14pt; margin: 14pt 0 7pt 0; }
          figure.table, table { border-collapse: collapse; }
          /* quill-table-up: width is driven by <col width>; forcing 100% breaks save/reopen */
          div.ql-table-wrapper {
            max-width: 100%;
            overflow-x: auto;
          }
          table.ql-table {
            table-layout: fixed;
            border-collapse: collapse;
          }
          table.ql-table[data-full] {
            width: 100%;
          }
          figure.table table:not(.ql-table),
          table:not(.ql-table) {
            width: 100%;
          }
          figure.table td, figure.table th, table td, table th {
            border: 1px solid #bfbfbf;
            padding: 4pt 6pt;
            vertical-align: top;
          }
          table.ql-table .ql-table-cell-inner p {
            margin-top: 0.2em;
            margin-bottom: 0.2em;
          }
        </style>
      </head>
      <body>
        <!-- Main Content -->
        <div class="ql-editor">
          ${cleanHtmlContent}
        </div>
      </body>
      </html>
    `;

    // Convert HTML to DOCX
    const docxBlob = htmlDocx.asBlob(completeHtml, {
      orientation: "portrait",
      margins: {
        top: 1440, // 1 inch in twips
        right: 1440,
        bottom: 1440,
        left: 1440,
      },
    });

    const fileName = `${name.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.docx`;

    const file = new File([docxBlob], fileName, {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    console.log("✅ DOCX file created:", fileName);
    console.log("📊 File size:", Math.round(file.size / 1024), "KB");

    return {
      file,
      fileName,
      fileSize: file.size,
      metadata: {
        name,
        description,
        category,
        type,
        content: cleanHtmlContent, // Store original HTML content
        variables,
        createdAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("❌ Error creating DOCX file:", error);
    throw new Error(`Failed to create document: ${error.message}`);
  }
};

// Quill Size is class-based; Word/DOCX often round-trips as inline font-size only.
const mapFontSizeToQuillSizeClass = (raw) => {
  const s = String(raw).trim().toLowerCase();
  if (/smaller|x-small|xx-small/.test(s)) return "ql-size-small";
  if (/larger|x-large/.test(s)) return "ql-size-large";

  const m = s.match(/^([\d.]+)\s*(pt|px|em|rem|%)?$/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (Number.isNaN(n)) return null;
  const unit = m[2] || "pt";

  let pxApprox = n;
  if (unit === "pt") pxApprox = n * (96 / 72);
  else if (unit === "em" || unit === "rem") pxApprox = n * 16;
  else if (unit === "%") pxApprox = (n / 100) * 16;

  if (pxApprox <= 11) return "ql-size-small";
  if (pxApprox <= 15) return null;
  if (pxApprox <= 24) return "ql-size-large";
  return "ql-size-huge";
};

const coerceInlineFontSizeToQuillSizeClasses = (html) => {
  if (typeof window === "undefined" || !html) return html;
  const inlineTags = new Set([
    "SPAN",
    "STRONG",
    "EM",
    "S",
    "U",
    "A",
    "B",
    "I",
    "CODE",
    "SUB",
    "SUP",
  ]);

  try {
    const doc = new DOMParser().parseFromString(
      `<div id="template-coerce-root">${html}</div>`,
      "text/html"
    );
    const root = doc.getElementById("template-coerce-root");
    if (!root) return html;

    root.querySelectorAll("[style]").forEach((el) => {
      if (!inlineTags.has(el.tagName)) return;
      const existingClass = el.getAttribute("class") || "";
      if (/\bql-size-(small|large|huge)\b/.test(existingClass)) return;

      const style = el.getAttribute("style") || "";
      const fsMatch = style.match(/font-size\s*:\s*([^;]+)/i);
      if (!fsMatch) return;

      const ql = mapFontSizeToQuillSizeClass(fsMatch[1]);
      if (!ql) return;

      el.classList.add(ql);
      const rest = style
        .split(";")
        .map((x) => x.trim())
        .filter(Boolean)
        .filter((x) => !/^font-size\s*:/i.test(x))
        .join("; ");
      if (rest) el.setAttribute("style", rest);
      else el.removeAttribute("style");
    });

    return root.innerHTML;
  } catch {
    return html;
  }
};

// Toolbar must be listed before `table-up`: theme init walks `Object.keys(modules)` in
// insertion order; TableUp's constructor calls getToolbarPicker() and needs toolbar ready.
const TEMPLATE_QUILL_MODULES = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      [{ align: [] }],
      [{ direction: "rtl" }],
      [{ [TableUp.toolName]: [] }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      ["clean"],
    ],
  },
  [TableUp.moduleName]: {
    customSelect: defaultCustomSelect,
    customBtn: true,
    modules: [
      { module: TableVirtualScrollbar },
      { module: TableAlign },
      { module: TableResizeScale },
      { module: TableSelection },
      { module: TableMenuSelect },
    ],
  },
};

const TEMPLATE_QUILL_FORMATS = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "script",
  "list",
  "indent",
  "align",
  "direction",
  // quill-table-up: every structure blot must be whitelisted or inserts throw Parchment errors.
  "table-up-container",
  "table-up-caption",
  "table-up",
  "table-up-main",
  "table-up-colgroup",
  "table-up-col",
  "table-up-head",
  "table-up-body",
  "table-up-foot",
  "table-up-row",
  "table-up-cell",
  "table-up-cell-inner",
  "blockquote",
  "code-block",
  "link",
  "image",
  "video",
];

// Function to extract content from DOCX base64 for the rich-text editor
const extractContentFromDocxBase64 = async (base64Content) => {
  try {
    console.log("📥 Extracting HTML content from DOCX base64...");

    if (!base64Content) {
      console.warn("⚠️ No base64 content provided");
      return { content: "<p></p>", plainText: "", variables: [] };
    }

    // Decode base64
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create blob
    const blob = new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;

          // Try to extract text from the DOCX
          const textDecoder = new TextDecoder("utf-8");
          let textContent = textDecoder.decode(arrayBuffer);

          console.log(
            "📄 Raw DOCX content (first 2000 chars):",
            textContent.substring(0, 2000)
          );

          let htmlContent = "";

          // Method 1: Try to find HTML content from our saved templates
          const htmlMatch = textContent.match(/<[^>]+>/g);
          if (htmlMatch && htmlMatch.length > 0) {
            console.log("✅ Found HTML tags in DOCX");

            // Saved templates: ql-editor wrapper (current) or legacy ck-content
            const qlMatch = textContent.match(
              /<div[^>]*class\s*=\s*["'][^"']*\bql-editor\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
            );
            const ckMatch = textContent.match(
              /<div[^>]*class\s*=\s*["'][^"']*\bck-content\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
            );
            const editorMatch = qlMatch || ckMatch;
            if (editorMatch) {
              htmlContent = editorMatch[1];
              console.log(
                qlMatch
                  ? "🔍 Found ql-editor body"
                  : "🔍 Found ck-content (legacy CKEditor) body"
              );
            } else {
              // Try to extract from body
              const bodyMatch = textContent.match(
                /<body[^>]*>([\s\S]*?)<\/body>/i
              );
              if (bodyMatch) {
                htmlContent = bodyMatch[1];
                console.log("🔍 Found body content");
              } else {
                // Use the whole HTML content
                const htmlStart = textContent.indexOf("<html");
                const htmlEnd = textContent.lastIndexOf("</html>");
                if (htmlStart !== -1 && htmlEnd !== -1) {
                  htmlContent = textContent.substring(htmlStart, htmlEnd + 7);
                  console.log("🔍 Found HTML document");
                } else {
                  htmlContent = textContent;
                  console.log("🔍 Using raw HTML content");
                }
              }
            }
          } else {
            // Method 2: Convert plain text to clean HTML
            console.log("📝 No HTML tags found, converting plain text to HTML");

            // Clean the text - remove control characters but keep structure
            textContent = textContent
              // eslint-disable-next-line no-control-regex
              .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, "")
              .replace(/\r\n/g, "\n")
              .replace(/\r/g, "\n");

            // Convert plain text to HTML with better paragraph handling
            // Split by double newlines (paragraphs)
            const paragraphs = textContent.split(/\n\s*\n+/);

            htmlContent = paragraphs
              .map((p) => {
                const trimmed = p.trim();
                if (!trimmed) return "";

                // Split into lines within paragraph
                const lines = trimmed.split("\n");

                // If only one line or very short, just wrap in <p>
                if (lines.length <= 1 || trimmed.length < 100) {
                  return `<p>${trimmed}</p>`;
                }

                // For multiple lines, join with <br> but be conservative
                const processedLines = lines
                  .map((line) => line.trim())
                  .filter((line) => line.length > 0);

                if (processedLines.length === 0) return "";

                // Join lines with space (not <br>) for normal paragraphs
                return `<p>${processedLines.join(" ")}</p>`;
              })
              .filter((p) => p)
              .join("");
          }

          // Clean up HTML for editor: drop noisy Word classes; keep typography-related inline styles
          const keepStyleDeclaration = (decl) => {
            const name = (decl.split(":")[0]?.trim() || "").toLowerCase();
            if (/^mso-/i.test(name)) return false;
            return (
              /^(margin-left|margin-right|padding-left|padding-right|padding-top|padding-bottom|padding|text-indent|font-size|font-family|font-weight|font-style|color|background-color|text-decoration(?:-line|-color|-style)?|letter-spacing|line-height|text-align|direction|border-left|border-right|border-top|border-bottom|border|border-width|border-style|border-color|width|min-width|max-width|height|min-height|max-height|vertical-align|table-layout|border-collapse|border-spacing|box-sizing|overflow|white-space)$/i.test(
                name
              )
            );
          };

          htmlContent = htmlContent
            .replace(/<\/?o:p>/g, "")
            .replace(/<\/?w:[^>]+>/g, "")
            .replace(/\sstyle\s*=\s*(["'])((?:(?!\1).)*)\1/gi, (m, quote, styleValue) => {
              const parts = styleValue.split(";").map((s) => s.trim()).filter(Boolean);
              const keep = parts.filter(keepStyleDeclaration);
              return keep.length ? ` style=${quote}${keep.join("; ")}${quote}` : "";
            })
            .replace(/\sclass\s*=\s*(["'])((?:(?!\1).)*)\1/gi, (m, quote, classNames) => {
              const keep = classNames
                .split(/\s+/)
                .filter(Boolean)
                .filter(
                  (c) =>
                    !/^Mso/i.test(c) &&
                    !/^WordSection/i.test(c) &&
                    !/^msonormal$/i.test(c)
                );
              return keep.length ? ` class=${quote}${keep.join(" ")}${quote}` : "";
            })
            .replace(/<p>\s*<\/p>/g, "")
            .replace(/>\s+</g, "><")
            .trim();

          htmlContent = coerceInlineFontSizeToQuillSizeClasses(htmlContent);

          if (
            typeof window !== "undefined" &&
            htmlContent.includes("ql-table")
          ) {
            try {
              const doc = new DOMParser().parseFromString(
                `<div id="template-extract-table-root">${htmlContent}</div>`,
                "text/html"
              );
              const r = doc.getElementById("template-extract-table-root");
              if (r) {
                normalizeTableUpDataWrapTagsOnRoot(r);
                rehydrateQuillTableUpLayoutOnRoot(r);
                htmlContent = r.innerHTML;
              }
            } catch (e) {
              console.warn("template DOCX table layout fix:", e);
            }
          }

          // Ensure proper paragraph structure
          // If we have content but no tags, wrap in <p>
          if (htmlContent && !htmlContent.match(/<[^>]+>/)) {
            htmlContent = `<p>${htmlContent}</p>`;
          }

          // If we have multiple lines without paragraphs, wrap in <p>
          if (htmlContent.includes("\n") && !htmlContent.includes("<p>")) {
            const lines = htmlContent.split("\n").filter((line) => line.trim());
            htmlContent = lines.map((line) => `<p>${line.trim()}</p>`).join("");
          }

          // Ensure we have valid HTML
          if (!htmlContent || htmlContent === "<p></p>") {
            htmlContent = "<p></p>";
          }

          console.log(
            "✅ Extracted HTML content (first 500 chars):",
            htmlContent.substring(0, 500)
          );
          console.log("📏 HTML content length:", htmlContent.length);

          // Extract variables from the content - handle both {{variable}} and {variable} formats
          const variableRegex = /\{\{(\w+)\}\}|\{(\w+)\}/g;
          const variables = [];
          let match;

          while ((match = variableRegex.exec(htmlContent)) !== null) {
            const variableName = match[1] || match[2];
            if (variableName) {
              variables.push(variableName);
            }
          }

          console.log("🔍 Found variables:", variables);

          resolve({
            content: htmlContent,
            plainText: htmlContent
              .replace(/<[^>]*>/g, " ")
              .replace(/\s+/g, " ")
              .trim(),
            variables: variables,
          });
        } catch (parseError) {
          console.error("❌ Error parsing DOCX content:", parseError);
          reject(new Error("Failed to parse DOCX content"));
        }
      };

      reader.onerror = (error) => {
        console.error("❌ Error reading DOCX file:", error);
        reject(new Error("Failed to read DOCX file"));
      };

      reader.readAsArrayBuffer(blob);
    });
  } catch (error) {
    console.error("❌ Error extracting content from base64:", error);
    return {
      content: "<p>Error loading template content</p>",
      plainText: "",
      variables: [],
    };
  }
};

// Helper function to convert HTML to plain text for variable detection
const htmlToPlainText = (html) => {
  if (!html) return "";

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  return tempDiv.textContent || tempDiv.innerText || "";
};

// UPDATE TEMPLATE API FUNCTION
const updateTemplateAPI = async (
  templateId,
  { file, name, description, category, tempolateType, contentChanged = false }
) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  if (!templateId) {
    throw new Error("Template ID is required for update");
  }

  try {
    console.log("📤 Updating template:", templateId);
    console.log("📊 Update data:", {
      name,
      description,
      category,
      tempolateType,
      contentChanged,
      hasFile: !!file,
    });

    const formData = new FormData();

    // Always add the JSON data
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("category", category.trim());
    formData.append("tempolateType", tempolateType.trim());

    // Only add file if content has changed
    if (contentChanged && file) {
      formData.append("file", file);
      console.log("📎 File included in update");
    } else {
      console.log("📝 No file update needed");
    }

    const response = await fetch(
      `${process.env.REACT_APP_CUMM || ""}/templates/${templateId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const responseText = await response.text();

    if (response?.status === 200) {
      console.log("✅ Template updated successfully");
      myAlert("success", "Template updated successfully");
      return responseText;
    }

    if (!response.ok) {
      let errorMessage = `Update failed (${response.status})`;

      try {
        const errorData = JSON.parse(responseText);
        errorMessage =
          errorData.message || errorData.error || JSON.stringify(errorData);
      } catch {
        if (responseText) {
          errorMessage = responseText;
        }
      }

      console.error("❌ Update failed:", errorMessage);
      throw new Error(errorMessage);
    }

    try {
      const result = JSON.parse(responseText);
      return result;
    } catch {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    console.error("❌ Update API error:", error);
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Network error. Please check your connection.");
    }
    throw error;
  }
};

// UPLOAD TEMPLATE API FUNCTION
const uploadTemplateAPI = async ({
  file,
  name,
  description,
  category,
  tempolateType,
}) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  // Validate file
  if (!file) {
    throw new Error("No file provided");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds limit (${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB)`
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name.trim());
  formData.append("description", description.trim());
  formData.append("category", category.trim());
  formData.append("tempolateType", tempolateType.trim());

  try {
    console.log("📤 Uploading DOCX file to API...");
    console.log("📊 File info:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const response = await fetch(
      `${process.env.REACT_APP_CUMM || ""}/templates/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const responseText = await response.text();

    if (response?.status === 201) {
      console.log("✅ Template uploaded successfully");
      myAlert("success", "Template uploaded successfully");
      return responseText;
    }

    if (!response.ok) {
      let errorMessage = `Upload failed (${response.status})`;

      try {
        const errorData = JSON.parse(responseText);
        errorMessage =
          errorData.message || errorData.error || JSON.stringify(errorData);
      } catch {
        if (responseText) {
          errorMessage = responseText;
        }
      }

      console.error("❌ Upload failed:", errorMessage);
      throw new Error(errorMessage);
    }

    try {
      const result = JSON.parse(responseText);
      return result;
    } catch {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    console.error("❌ Upload API error:", error);
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Network error. Please check your connection.");
    }
    throw error;
  }
};

const TemplateConfiguration = () => {
  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      emailContent: "<p></p>",
      templateName: "",
      description: "",
      category: "",
      tempolateType: "",
    },
    mode: "onBlur",
  });

  const { bookmarks, bookmarksLoading, bookmarksError } = useSelector(
    (state) => state.bookmarks
  );

  const { templeteData, templetedetailsloading } = useSelector(
    (state) => state.templeteDetails
  );

  const [selectedVariables, setSelectedVariables] = useState(new Set());
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedFile, setGeneratedFile] = useState(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [originalContent, setOriginalContent] = useState("");
  const [originalFormData, setOriginalFormData] = useState(null);
  const quillRef = useRef(null);
  /** HTML seeded on each Quill remount; avoids controlled `value` HTML↔Delta churn that strips indent/align/color. */
  const pendingEditorHtmlRef = useRef("<p></p>");
  const [editorSessionKey, setEditorSessionKey] = useState(0);
  const isProcessingRef = useRef(false);
  const previousContentRef = useRef("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateIdFromUrl = searchParams.get("id");

  // Watch template type for conditional rendering
  const watchedTemplateType = watch("tempolateType");

  // Helper function to check if content has changed
  const hasContentChanged = (newContent) => {
    if (!originalContent) {
      return true; // No original content, treat as changed
    }

    // Simple comparison - you might want to make this more sophisticated
    const cleanedNew = newContent.replace(/\s+/g, " ").trim();
    const cleanedOriginal = originalContent.replace(/\s+/g, " ").trim();

    const changed = cleanedNew !== cleanedOriginal;
    console.log("🔍 Content changed check:", {
      originalLength: originalContent.length,
      newLength: newContent.length,
      cleanedOriginalLength: cleanedOriginal.length,
      cleanedNewLength: cleanedNew.length,
      changed,
    });

    return changed;
  };

  // Check if form metadata has changed
  const hasMetadataChanged = (currentData) => {
    if (!originalFormData) return true;

    const changed =
      currentData.templateName !== originalFormData.templateName ||
      currentData.description !== originalFormData.description ||
      currentData.category !== originalFormData.category ||
      currentData.tempolateType !== originalFormData.tempolateType;

    console.log("🔍 Metadata changed check:", {
      nameChanged: currentData.templateName !== originalFormData.templateName,
      descChanged: currentData.description !== originalFormData.description,
      categoryChanged: currentData.category !== originalFormData.category,
      typeChanged: currentData.tempolateType !== originalFormData.tempolateType,
      overallChanged: changed,
    });

    return changed;
  };

  const [templeteId, setTempleteId] = useState(null);

  // Populate form with template data from API response (base64 DOCX)
  const populateFormWithTemplateData = useCallback(
    async (data) => {
      console.log("🔄 Populating form with template data from API");

      // Extract template object from API response
      const template = data.template || {};

      // Create form data object
      const formData = {
        templateName: template.name || "",
        description: template.description || "",
        category: template.category || "",
        tempolateType: template.tempolateType || "",
        emailContent: "",
      };
      setTempleteId(template._id);

      // Reset form with the template data
      reset(formData);

      // Store original form data for change detection
      setOriginalFormData(formData);

      setIsLoadingContent(true);

      let nextEditorHtml = "<p></p>";

      try {
        // Check for fileContent (base64 DOCX) in the response
        if (data.fileContent) {
          console.log(
            "📦 Found base64 DOCX content, length:",
            data.fileContent.length
          );

          // Extract HTML content from the base64 DOCX
          const { content, variables } = await extractContentFromDocxBase64(
            data.fileContent
          );

          console.log(
            "✅ Extracted HTML for editor:",
            content.substring(0, 200)
          );
          console.log("🔍 Found variables in content:", variables);

          // Store original content for change detection
          setOriginalContent(content);
          nextEditorHtml = normalizeTableUpWrapTagsInHtmlString(content);

          // Map variables to bookmark IDs
          const variableIds = variables
            .map((variableName) => {
              const bookmark = bookmarks?.find(
                (b) =>
                  b.key === variableName ||
                  b.label.toLowerCase().includes(variableName.toLowerCase())
              );
              return bookmark?._id;
            })
            .filter(Boolean);

          setSelectedVariables(new Set(variableIds));
        } else {
          console.warn("⚠️ No fileContent found in API response");
          setOriginalContent("<p></p>");
        }
      } catch (error) {
        console.error("❌ Error loading template content:", error);
        nextEditorHtml =
          "<p>Error loading template content. Please check console for details.</p>";
        setOriginalContent(nextEditorHtml);

        notification.error({
          message: "Content Load Error",
          description: "Failed to extract content from DOCX file",
          duration: 5,
        });
      } finally {
        const safeHtml = normalizeTableUpWrapTagsInHtmlString(nextEditorHtml);
        pendingEditorHtmlRef.current = safeHtml;
        setValue("emailContent", safeHtml);
        setEditorSessionKey((k) => k + 1);
        setIsLoadingContent(false);
        setIsEditMode(true);
        console.log("✅ Form population complete");
      }
    },
    [reset, setValue, bookmarks]
  );

  // Template Type options - Email or Letter
  const templateTypeOptions = [
    { key: "email", label: "Email" },
    { key: "letter", label: "Letter" },
  ];

  // Category options based on template type
  const categoryOptions = {
    email: [
      { key: "welcome", label: "Welcome Email" },
      { key: "payment_reminder", label: "Payment Reminder" },
      { key: "notification", label: "Notification" },
      { key: "marketing", label: "Marketing" },
      { key: "support", label: "Support" },
    ],
    letter: [
      { key: "official", label: "Official Letter" },
      { key: "approval", label: "Approval Letter" },
      { key: "rejection", label: "Rejection Letter" },
      { key: "appointment", label: "Appointment Letter" },
      { key: "certificate", label: "Certificate" },
    ],
  };

  // Filter available variables based on search term
  const filteredAvailableVariables = useMemo(() => {
    if (!bookmarks) return [];

    const allVariables = bookmarks.map((bookmark) => ({
      id: bookmark._id,
      name: `{{${bookmark.key}}}`, // Changed to double braces
      label: bookmark.label,
      dataType: bookmark.dataType,
      key: bookmark.key,
    }));

    if (!searchTerm.trim()) return allVariables;

    const searchLower = searchTerm.toLowerCase();
    return allVariables.filter(
      (variable) =>
        variable.label.toLowerCase().includes(searchLower) ||
        variable.key.toLowerCase().includes(searchLower) ||
        variable.name.toLowerCase().includes(searchLower)
    );
  }, [bookmarks, searchTerm]);

  useEffect(() => {
    dispatch(getBookmarks());
  }, [dispatch]);

  // Refetch template after refresh: Redux is empty but `?id=` survives in the URL.
  useEffect(() => {
    if (templateIdFromUrl) {
      dispatch(loadtempletedetails(templateIdFromUrl));
    } else {
      dispatch(resetTemplateDetails());
      reset({
        emailContent: "<p></p>",
        templateName: "",
        description: "",
        category: "",
        tempolateType: "",
      });
      setOriginalContent("");
      setOriginalFormData(null);
      setSelectedVariables(new Set());
      setIsEditMode(false);
      setTempleteId(null);
      setGeneratedFile(null);
      pendingEditorHtmlRef.current = "<p></p>";
      setEditorSessionKey((k) => k + 1);
    }
  }, [templateIdFromUrl, dispatch, reset]);

  useEffect(() => {
    if (templeteData && !templetedetailsloading) {
      console.log("📥 Template data received from API, populating form");
      populateFormWithTemplateData(templeteData);
    }
  }, [templeteData, templetedetailsloading, populateFormWithTemplateData]);

  useEffect(() => {
    return () => {
      reset();
      dispatch(resetTemplateDetails());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clear Redux only when leaving this page
  }, []);

  // Validation rules
  const validationRules = {
    templateName: {
      required: "Template name is required",
      maxLength: {
        value: 200,
        message: "Template name must be less than 200 characters",
      },
    },
    tempolateType: {
      required: "Template type is required",
    },
    category: {
      required: "Category is required",
    },
    description: {
      maxLength: {
        value: 1000,
        message: "Description must be less than 1000 characters",
      },
    },
    emailContent: {
      required: "Template content is required",
      validate: (value) => {
        const strippedValue = value.replace(/<[^>]*>/g, "").trim();
        return (
          (strippedValue !== "" && strippedValue !== "<p><br></p>") ||
          "Template content is required"
        );
      },
    },
  };

  // Form submission handler
  const onSubmit = async (data) => {
    setSaving(true);
    const action = isEditMode ? "Updating" : "Creating";
    message.loading(`${action} template...`, 0);

    try {
      console.log("📤 Starting template submission process");
      console.log("📝 Template data:", {
        name: data.templateName,
        type: data.tempolateType,
        contentLength: data.emailContent?.length,
        isEditMode: isEditMode,
        templateId: templeteData?.template?._id,
      });

      // Extract variable names from selected variables with {{variable}} format
      const variableNames = Array.from(selectedVariables)
        .map((variableId) => {
          const variable = filteredAvailableVariables.find(
            (v) => v.id === variableId
          );
          return variable ? `{{${variable.key}}}` : null;
        })
        .filter(Boolean);

      console.log("📋 Variables to include in DOCX:", variableNames);

      // Check if content has changed (for update mode)
      let contentChanged = false;
      let metadataChanged = false;
      let docResult = null;

      if (isEditMode) {
        // In edit mode, check if content or metadata has changed
        contentChanged = hasContentChanged(data.emailContent);
        metadataChanged = hasMetadataChanged(data);
        console.log("🔍 Change detection:", {
          contentChanged,
          metadataChanged,
          hasChanges: contentChanged || metadataChanged,
        });
      }

      // Create DOCX file if:
      // 1. Creating new template, OR
      // 2. Updating template AND content has changed
      if (!isEditMode || contentChanged) {
        console.log("📄 Creating/updating DOCX file...");
        docResult = await createDocxFile({
          name: data.templateName.trim(),
          description: data.description.trim(),
          category: data.category.trim(),
          type: data.tempolateType,
          content: data.emailContent,
          variables: variableNames,
        });
        console.log("✅ DOCX created/updated:", docResult?.fileName);
      } else {
        console.log("📝 Content unchanged, skipping DOCX creation");
      }

      if (isEditMode) {
        // UPDATE EXISTING TEMPLATE
        const templateId = templeteId;
        if (!templateId) {
          throw new Error("Template ID not found for update");
        }

        console.log("🔄 Updating existing template:", templateId);

        await updateTemplateAPI(templateId, {
          file: docResult?.file,
          name: data.templateName.trim(),
          description: data.description.trim(),
          category: data.category.trim(),
          tempolateType: data.tempolateType,
          contentChanged: contentChanged || metadataChanged, // Send update if either changed
        });

        // Update state with generated file info if new file was created
        if (docResult) {
          setGeneratedFile({
            id: `template_${Date.now()}`,
            name: docResult.fileName,
            size: docResult.fileSize,
            metadata: docResult.metadata,
            action: "updated",
            fileIncluded: true,
          });
        } else if (metadataChanged) {
          setGeneratedFile({
            id: `template_${templateId}`,
            name: "Metadata updated",
            action: "metadata_updated_only",
            fileIncluded: false,
          });
        } else {
          setGeneratedFile({
            id: `template_${templateId}`,
            name: "No changes detected",
            action: "no_changes",
            fileIncluded: false,
          });
        }
      } else {
        // CREATE NEW TEMPLATE
        if (!docResult) {
          throw new Error("Failed to create DOCX file for new template");
        }

        console.log("🆕 Creating new template");

        await uploadTemplateAPI({
          file: docResult.file,
          name: data.templateName.trim(),
          description: data.description.trim(),
          category: data.category.trim(),
          tempolateType: data.tempolateType,
        });

        // Update state with generated file info
        setGeneratedFile({
          id: `template_${Date.now()}`,
          name: docResult.fileName,
          size: docResult.fileSize,
          metadata: docResult.metadata,
          action: "created",
          fileIncluded: true,
        });
      }

      // Success message
      message.destroy();
      message.success(
        isEditMode
          ? "Template updated successfully!"
          : "Template created successfully!"
      );
    } catch (error) {
      console.error("❌ Template operation error:", error);
      message.destroy();
      message.error(
        error.message ||
          (isEditMode
            ? "Failed to update template"
            : "Failed to create template")
      );

      notification.error({
        message: isEditMode ? "Update Failed" : "Creation Failed",
        description: error.message,
        duration: 5,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBackToSummary = () => {
    navigate("/templeteSummary");
  };

  // Handle save button click
  const handleSaveOrUpdateTemplate = async () => {
    const isValid = await trigger();

    if (!isValid) {
      const firstError = Object.values(errors)[0];
      if (firstError) {
        message.error(firstError.message);
      }
      return;
    }

    handleSubmit(onSubmit)();
  };

  // Template type change handler
  const handleTemplateTypeChange = (value) => {
    setValue("tempolateType", value);
    setValue("category", "");
    trigger("tempolateType");
  };

  // Find variables in text
  const findVariablesInText = (text) => {
    const foundVariables = new Set();
    // Match both {{variable}} and {variable} formats
    const variableRegex = /\{\{(\w+)\}\}|\{(\w+)\}/g;
    let match;

    while ((match = variableRegex.exec(text)) !== null) {
      const variableName = match[1] || match[2]; // Get either {{variable}} or {variable}
      if (variableName) {
        const variable = filteredAvailableVariables.find(
          (v) => v.key === variableName
        );
        if (variable) {
          foundVariables.add(variable.id);
        }
      }
    }

    return foundVariables;
  };

  // Insert variable into editor with {{variable}} format (ReactQuill / Quill)
  const insertVariable = (variableName, variableId) => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill || isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      quill.focus();
      const formattedVariable = `{{${variableName}}}`;
      const range = quill.getSelection(true);
      const index = range ? range.index : quill.getLength();
      quill.insertText(index, formattedVariable, "user");
      quill.setSelection(index + formattedVariable.length, 0, "silent");

      const html = quill.root.innerHTML;
      setSelectedVariables((prev) => new Set([...prev, variableId]));
      previousContentRef.current = html;
      setValue("emailContent", html);

      console.log("✅ Variable inserted:", variableName);
    } catch (error) {
      console.error("❌ Error inserting variable:", error);
    } finally {
      isProcessingRef.current = false;
    }
  };

  // Remove variable
  const removeVariable = (variableId) => {
    setSelectedVariables((prev) => {
      const newSet = new Set(prev);
      newSet.delete(variableId);
      return newSet;
    });
    console.log("🗑️ Variable removed:", variableId);
  };

  // Drag & drop handlers
  const handleDragStart = (e, variableName, variableId) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ variableName, variableId })
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    try {
      const { variableName, variableId } = JSON.parse(data);
      insertVariable(variableName, variableId);
    } catch (error) {
      console.error("❌ Error parsing drag data:", error);
    }
  };

  const handleVariableClick = (variableName, variableId) => {
    insertVariable(variableName, variableId);
  };

  // Email content change handler (RHF value is updated via field.onChange; keep bookmark chips in sync)
  const handleEmailContentChange = (htmlContent) => {
    const plainText = htmlToPlainText(htmlContent);
    const currentlyPresentVariables = findVariablesInText(plainText);
    setSelectedVariables(currentlyPresentVariables);
  };

  // Preview handlers
  const handlePreview = () => {
    setIsPreviewModalVisible(true);
  };

  const handleClosePreview = () => {
    setIsPreviewModalVisible(false);
  };

  const getCategoryOptions = () => {
    return watchedTemplateType
      ? categoryOptions[watchedTemplateType] || []
      : [];
  };

  return (
    <div className="px-4 template-configuration-root">
      {/* Header with Save Button */}
      <div
        style={{
          marginTop: "1px",
          marginBottom: "5px",
          display: "flex",
          gap: "12px",
          justifyContent: "flex-end",
          flexShrink: 0,
        }}
      >
        <Button
          onClick={handleBackToSummary}
          className="butn secoundry-btn"
          icon={<ArrowLeftOutlined />}
          disabled={saving}
        >
          Back to summary
        </Button>
        <Button
          onClick={handleSaveOrUpdateTemplate}
          className="butn primary-btn"
          icon={<SaveOutlined />}
          loading={saving}
          disabled={saving}
          type="primary"
        >
          {saving
            ? isEditMode
              ? "Updating Template..."
              : "Saving Template..."
            : isEditMode
            ? "Update Template"
            : "Save Template"}
        </Button>
      </div>

      {/* Loading State */}
      {isLoadingContent && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: "#e6f7ff",
            border: "1px solid #91d5ff",
            borderRadius: "6px",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          <Text strong style={{ color: "#1890ff" }}>
            ⏳ Loading template content from DOCX...
          </Text>
          <Text type="secondary" style={{ display: "block", marginTop: "4px" }}>
            Extracting HTML from base64 DOCX file. This may take a moment.
          </Text>
        </div>
      )}

      {/* File Status */}
      {generatedFile && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            backgroundColor:
              generatedFile.action === "no_changes" ? "#f6f6f6" : "#f6ffed",
            border:
              generatedFile.action === "no_changes"
                ? "1px solid #d9d9d9"
                : "1px solid #b7eb8f",
            borderRadius: "6px",
            flexShrink: 0,
          }}
        >
          <Text
            strong
            style={{
              color:
                generatedFile.action === "no_changes"
                  ? "#8c8c8c"
                  : generatedFile.action === "metadata_updated_only"
                  ? "#faad14"
                  : "#389e0d",
            }}
          >
            {generatedFile.action === "created" &&
              "✅ Template created and uploaded: "}
            {generatedFile.action === "updated" && "✅ Template updated: "}
            {generatedFile.action === "metadata_updated_only" &&
              "📝 Template metadata updated: "}
            {generatedFile.action === "no_changes" &&
              "📋 No changes detected: "}
            {generatedFile.name}
          </Text>
          {generatedFile.size && (
            <>
              <br />
              <Text type="secondary">
                Size: {Math.round(generatedFile.size / 1024)}KB • Type: DOCX
                with HTML content
              </Text>
            </>
          )}
          {generatedFile.fileIncluded !== undefined && (
            <Text
              type="secondary"
              style={{ display: "block", marginTop: "4px" }}
            >
              File included: {generatedFile.fileIncluded ? "Yes" : "No"}
            </Text>
          )}
        </div>
      )}

      {/* Three columns: fill remaining viewport; scroll only inside cards / editor */}
      <Row
        gutter={24}
        align="stretch"
        style={{
          flex: 1,
          minHeight: 0,
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Left Column - Template Information */}
        <Col
          span={5}
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
          }}
        >
          <Card
            title="Template Information"
            styles={{
              header: {
                backgroundColor: "#eef4ff",
                color: "#215e97",
                minHeight: "36px",
                padding: "6px 16px",
              },
              body: {
                flex: 1,
                minHeight: 0,
                overflow: "auto",
              },
            }}
            style={{
              flex: 1,
              width: "100%",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <Controller
                name="tempolateType"
                control={control}
                rules={validationRules.tempolateType}
                render={({ field }) => (
                  <CustomSelect
                    label="Template Type"
                    name="tempolateType"
                    value={field.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);
                      handleTemplateTypeChange(value);
                    }}
                    onBlur={field.onBlur}
                    options={templateTypeOptions}
                    placeholder="Select template type"
                    isIDs={true}
                    hasError={!!errors.tempolateType}
                    errorMessage={errors.tempolateType?.message}
                    required={true}
                  />
                )}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <Controller
                name="category"
                control={control}
                rules={validationRules.category}
                render={({ field }) => (
                  <CustomSelect
                    label="Template Category"
                    name="category"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={getCategoryOptions()}
                    placeholder={
                      watchedTemplateType
                        ? "Select category"
                        : "Select template type first"
                    }
                    disabled={!watchedTemplateType}
                    isIDs={true}
                    hasError={!!errors.category}
                    errorMessage={errors.category?.message}
                    required={true}
                  />
                )}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <Controller
                name="templateName"
                control={control}
                rules={validationRules.templateName}
                render={({ field }) => (
                  <MyInput
                    label="Template Name"
                    name="templateName"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={
                      watchedTemplateType === "letter"
                        ? "Enter letter title"
                        : "Enter email subject"
                    }
                    required={true}
                    hasError={!!errors.templateName}
                    errorMessage={errors.templateName?.message}
                  />
                )}
              />
            </div>

            <div style={{ marginBottom: "0px" }}>
              <Controller
                name="description"
                control={control}
                rules={validationRules.description}
                render={({ field }) => (
                  <MyInput
                    label="Description"
                    name="description"
                    value={field.value}
                    onChange={field.onChange}
                    type="textarea"
                    onBlur={field.onBlur}
                    placeholder="Enter template description"
                    hasError={!!errors.description}
                    errorMessage={errors.description?.message}
                  />
                )}
              />
            </div>
          </Card>
        </Col>

        {/* Middle column = A4 width (210mm); remaining space goes to bookmark fields */}
        <Col
          flex="0 0 210mm"
          style={{
            maxWidth: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            minWidth: 0,
          }}
        >
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <span>Template Content Builder</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  {isLoadingContent && (
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Loading content...
                    </Text>
                  )}
                  <Button
                    icon={<EyeOutlined />}
                    onClick={handlePreview}
                    size="small"
                    disabled={isLoadingContent}
                  >
                    Preview
                  </Button>
                </div>
              </div>
            }
            styles={{
              header: {
                backgroundColor: "#eef4ff",
                color: "#215e97",
                borderBottom: "1px solid #f0f0f0",
                minHeight: "36px",
                padding: "6px 16px",
              },
              body: {
                padding: "0",
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              },
            }}
            style={{
              flex: 1,
              width: "100%",
              minHeight: 0,
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "0 0 16px",
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {errors.emailContent && (
                <Text
                  type="danger"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    marginLeft: "12px",
                    marginRight: "12px",
                    fontSize: "12px",
                    flexShrink: 0,
                  }}
                >
                  {errors.emailContent.message}
                </Text>
              )}

              {/* React Quill Editor with Drop Zone */}
              <Controller
                name="emailContent"
                control={control}
                rules={validationRules.emailContent}
                render={({ field }) => (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onBlur={field.onBlur}
                    className="template-config-quill-wrap"
                    style={{
                      border: errors.emailContent ? "2px solid #ff4d4f" : "none",
                      borderRadius: errors.emailContent ? "6px" : 0,
                      marginBottom: 0,
                      opacity: isLoadingContent ? 0.5 : 1,
                    }}
                  >
                    {isLoadingContent ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          flex: 1,
                          minHeight: "200px",
                          background: "#fff",
                          color: "#666",
                        }}
                      >
                        <Text>Loading content from DOCX file...</Text>
                      </div>
                    ) : (
                      <ReactQuill
                        key={editorSessionKey}
                        ref={quillRef}
                        theme="snow"
                        defaultValue={pendingEditorHtmlRef.current}
                        useSemanticHTML={false}
                        onChange={(html) => {
                          field.onChange(html);
                          handleEmailContentChange(html);
                        }}
                        onBlur={() => field.onBlur()}
                        modules={TEMPLATE_QUILL_MODULES}
                        formats={TEMPLATE_QUILL_FORMATS}
                      />
                    )}
                  </div>
                )}
              />
            </div>
          </Card>
        </Col>

        {/* Right column fills remaining row width */}
        <Col
          flex="1 1 0"
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
            minWidth: 0,
          }}
        >
          <Card
            title="Bookmark Fields"
            styles={{
              header: {
                backgroundColor: "#eef4ff",
                color: "#215e97",
                minHeight: "36px",
                padding: "6px 16px",
              },
              body: {
                flex: 1,
                minHeight: 0,
                padding: "0",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              },
            }}
            style={{
              flex: 1,
              width: "100%",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {/* Search Section - Fixed height */}
            <div
              style={{
                padding: "16px",
                borderBottom: "1px solid #f0f0f0",
                backgroundColor: "white",
              }}
            >
              <div style={{ marginBottom: "8px" }}>
                <MyInput
                  label=""
                  name="bookmarkFieldSearch"
                  type="search"
                  placeholder="Search bookmark fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Bookmark fields list — takes remaining space */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Selected bookmark fields — compact strip */}
              {selectedVariables.size > 0 && (
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f9f9f9",
                    borderBottom: "1px solid #e8e8e8",
                  }}
                >
                  <Text
                    strong
                    style={{
                      fontSize: "12px",
                      color: "#215e97",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Selected bookmark fields ({selectedVariables.size})
                  </Text>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      alignContent: "flex-start",
                      /* ~28px/row + 6px gap; cap allows ~3 full rows before scroll */
                      maxHeight: "104px",
                      overflowY: "auto",
                    }}
                  >
                    {Array.from(selectedVariables).map((variableId) => {
                      const variable = filteredAvailableVariables.find(
                        (v) => v.id === variableId
                      );
                      return variable ? (
                        <div
                          key={variable.id}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#eef4ff",
                            border: "1px solid #215e97",
                            borderRadius: "4px",
                            fontSize: "11px",
                            color: "#215e97",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          {variable.name}
                          <CloseOutlined
                            style={{
                              fontSize: "10px",
                              cursor: "pointer",
                              color: "#ff4d4f",
                            }}
                            onClick={() => removeVariable(variable.id)}
                          />
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Available bookmark fields — scrollable */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                  overflow: "hidden",
                }}
              >
                {/* Loading/Error States */}
                {bookmarksLoading && (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#666",
                    }}
                  >
                    Loading bookmark fields...
                  </div>
                )}

                {bookmarksError && (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ff4d4f",
                    }}
                  >
                    Error loading bookmark fields
                  </div>
                )}

                {/* Available bookmark fields list */}
                {bookmarks && !bookmarksLoading && !bookmarksError && (
                  <>
                    <div
                      style={{
                        padding: "16px 16px 8px 16px",
                        backgroundColor: "white",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Text
                          strong
                          style={{ fontSize: "12px", color: "#215e97" }}
                        >
                          Bookmark fields ({filteredAvailableVariables.length})
                        </Text>
                        <Tooltip title="Drag or click bookmark fields to insert them into the template.">
                          <InfoCircleOutlined
                            style={{
                              color: "#215e97",
                              cursor: "default",
                              fontSize: "14px",
                            }}
                          />
                        </Tooltip>
                      </div>
                    </div>

                    <div
                      style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "0 16px 16px 16px",
                        minHeight: 0,
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                          gap: "8px",
                        }}
                      >
                        {filteredAvailableVariables.map((variable) => (
                          <div
                            key={variable.id}
                            draggable
                            onDragStart={(e) =>
                              handleDragStart(e, variable.key, variable.id)
                            }
                            onClick={() =>
                              handleVariableClick(variable.key, variable.id)
                            }
                            style={{
                              padding: "8px 6px",
                              backgroundColor: selectedVariables.has(
                                variable.id
                              )
                                ? "#eef4ff"
                                : "#f8f9fa",
                              border: selectedVariables.has(variable.id)
                                ? "2px solid #215e97"
                                : "1px solid #d9d9d9",
                              borderRadius: "6px",
                              cursor: "grab",
                              fontSize: "11px",
                              textAlign: "center",
                              minHeight: "32px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title={`Click or drag to insert bookmark field ${variable.name}`}
                          >
                            {variable.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Preview Modal */}
      <Modal
        className="template-preview-modal"
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FileTextOutlined style={{ color: "white", fontSize: "18px" }} />
              <Text strong style={{ fontSize: "16px", color: "white" }}>
                Preview
              </Text>
            </div>
          </div>
        }
        open={isPreviewModalVisible}
        onCancel={handleClosePreview}
        footer={null}
        width={"45%"}
        style={{ top: 5 }}
        styles={{
          header: {
            background: "#2f6bff",
            borderBottom: "none",
            padding: "16px 24px",
            borderRadius: "8px 8px 0 0",
          },
          body: {
            padding: "0",
            maxHeight: "calc(100vh - 120px)",
            overflowY: "auto",
            overflowX: "auto",
          },
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(45deg, #f8f9fa 25%, transparent 25%), linear-gradient(-45deg, #f8f9fa 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8f9fa 75%), linear-gradient(-45deg, transparent 75%, #f8f9fa 75%)",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
            padding: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "210mm",
              maxWidth: "100%",
              minHeight: "297mm",
              backgroundColor: "white",
              padding: "25mm",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              border: "1px solid #e8e8e8",
              position: "relative",
              fontFamily: "'Times New Roman', Times, serif",
              lineHeight: "1.2",
              fontSize: "12pt",
              boxSizing: "border-box",
              flexShrink: 0,
            }}
          >
            {/* Template body only — no synthetic letterhead */}
            <div
              className="template-preview-body"
              style={{
                lineHeight: "1.5", // VERY TIGHT line height
                textAlign: "justify",
                margin: 0,
                marginBottom: "2px",
                padding: 0,
              }}
              dangerouslySetInnerHTML={{
                __html: replacePlaceholdersWithData(
                  getValues("emailContent") || "<p>No content available</p>"
                ),
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TemplateConfiguration;
