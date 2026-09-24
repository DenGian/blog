import sanitizeHtml from "sanitize-html";
const options: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "em",
    "s",
    "blockquote",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "pre",
    "code",
    "a",
    "img",
    "hr",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    code: ["class"],
  },
  allowedClasses: { code: [/^language-[a-z0-9-]+$/] },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  enforceHtmlBoundary: true,
  transformTags: {
    a: (_tag, attrs) => ({
      tagName: "a",
      attribs: {
        ...attrs,
        rel: "noopener noreferrer",
        ...(attrs.target === "_blank" ? { target: "_blank" } : {}),
      },
    }),
    img: (_tag, attrs) => ({
      tagName: "img",
      attribs: { ...attrs, loading: "lazy", alt: attrs.alt ?? "" },
    }),
  },
};
export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, options).trim();
}

export function hasVisiblePostText(html: string): boolean {
  return (
    sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim()
      .length > 0
  );
}
