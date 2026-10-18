import DOMPurify from "isomorphic-dompurify";
import * as LinkifyModule from "linkify-it";

// Handle CJS/ESM module interop cleanly
const LinkifyClass = (LinkifyModule as any).LinkifyIt || (LinkifyModule as any).default || LinkifyModule;
const linkify = new LinkifyClass();

const KNOWN_URL_SHORTENERS = [
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "adf.ly",
  "bit.do",
  "cutt.ly",
];

export interface ExtractedUrlInfo {
  url: string;
  domain: string;
  isShortener: boolean;
}

/**
 * Sanitizes markdown/HTML strings on write and before render,
 * removing any executable JavaScript, iframes, or malicious attributes.
 */
export function sanitizeContent(dirty: string): string {
  if (!dirty) return "";
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "b",
      "i",
      "em",
      "strong",
      "a",
      "ul",
      "ol",
      "li",
      "code",
      "pre",
      "blockquote",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "title", "class"],
  });
}

/**
 * Extracts all URLs from raw text using linkify-it and flags known shorteners.
 */
export function extractUrls(text: string): ExtractedUrlInfo[] {
  if (!text) return [];

  const matches = linkify.match(text);
  if (!matches) return [];

  return matches.map((m: any) => {
    let domain = "";
    try {
      domain = new URL(m.url).hostname.toLowerCase();
    } catch {
      domain = "";
    }

    const isShortener = KNOWN_URL_SHORTENERS.includes(domain);

    return {
      url: m.url,
      domain,
      isShortener,
    };
  });
}
