const { DateTime } = require("luxon");
const path = require("path");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const { feedPlugin } = require("@11ty/eleventy-plugin-rss");

// PREVIEW=1 builds a flat, relative-link copy of the site (used for the
// claude.ai artifact preview). Normal builds use clean directory URLs.
const PREVIEW = !!process.env.PREVIEW;

module.exports = function (eleventyConfig) {
  eleventyConfig.addGlobalData("ext", PREVIEW ? ".html" : "/");
  eleventyConfig.addGlobalData("preview", PREVIEW);
  eleventyConfig.addGlobalData("buildTime", () => new Date());

  // Static files
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.ignores.add("src/admin/**");
  eleventyConfig.addWatchTarget("src/assets");

  // Markdown
  const md = markdownIt({ html: true, linkify: true, typographer: true })
    .use(markdownItAnchor, { level: [2, 3] });
  eleventyConfig.setLibrary("md", md);
  eleventyConfig.addFilter("md", (s) => (s ? md.render(String(s)) : ""));
  eleventyConfig.addFilter("mdInline", (s) => (s ? md.renderInline(String(s)) : ""));

  // Internal links: identity in normal builds, relative flat links in PREVIEW builds.
  eleventyConfig.addFilter("link", function (url) {
    if (!url) return url;
    if (/^(https?:|mailto:|tel:|#|\/\/)/.test(url)) return url;
    if (!PREVIEW) return url;
    let target = String(url);
    let hash = "";
    const hi = target.indexOf("#");
    if (hi >= 0) { hash = target.slice(hi); target = target.slice(0, hi); }
    if (target === "/") target = "/index.html";
    else if (target.endsWith("/")) target = target.slice(0, -1) + ".html";
    const current = (this.page && this.page.url) || "/";
    const curFile = current === "/" ? "/index.html" : current.endsWith("/") ? current + "index.html" : current;
    const rel = path.posix.relative(path.posix.dirname(curFile), target);
    return (rel || "index.html") + hash;
  });

  // Active-nav helper (works for both clean URLs and PREVIEW .html URLs)
  const norm = (u) => String(u || "").replace(/index\.html$/, "").replace(/\.html$/, "/").replace(/\/+$/, "/") || "/";
  eleventyConfig.addFilter("isCurrent", (pageUrl, itemUrl) => {
    const a = norm(pageUrl), b = norm(itemUrl);
    if (b === "/") return a === "/";
    return a === b || a.startsWith(b);
  });

  // Dates
  const toDT = (d) => (d instanceof Date ? DateTime.fromJSDate(d, { zone: "utc" }) : DateTime.fromISO(String(d), { zone: "utc" }));
  eleventyConfig.addFilter("readableDate", (d, fmt = "LLLL d, yyyy") => toDT(d).toFormat(fmt));
  eleventyConfig.addFilter("isoDate", (d) => toDT(d).toISODate());
  eleventyConfig.addFilter("year", (d) => toDT(d).toFormat("yyyy"));

  // Collections helpers
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("featured", (arr) => (arr || []).filter((i) => i.data && i.data.featured));
  eleventyConfig.addFilter("where", (arr, key, val) => (arr || []).filter((i) => (i.data ? i.data[key] : i[key]) === val));
  eleventyConfig.addFilter("whereNot", (arr, key, val) => (arr || []).filter((i) => (i.data ? i.data[key] : i[key]) !== val));
  eleventyConfig.addFilter("find", (arr, key, val) => (arr || []).find((i) => (i.data ? i.data[key] : i[key]) === val));
  eleventyConfig.addFilter("excerpt", (html, n = 160) => {
    const t = String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return t.length > n ? t.slice(0, n).replace(/\s\S*$/, "") + "…" : t;
  });
  eleventyConfig.addFilter("readingTime", (html) => {
    const words = String(html || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 220));
  });
  eleventyConfig.addFilter("allTopics", (coll) => {
    const s = new Set();
    (coll || []).forEach((i) => (i.data.topics || []).forEach((t) => s.add(t)));
    return [...s].sort();
  });
  eleventyConfig.addFilter("allKinds", (coll) => {
    const s = new Set();
    (coll || []).forEach((i) => { if (i.data.kind) s.add(i.data.kind); });
    return [...s];
  });
  eleventyConfig.addFilter("slugify2", (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  eleventyConfig.addFilter("jsonify", (v) => JSON.stringify(v));
  eleventyConfig.addFilter("absUrl", (u, base) => new URL(u, base).href);
  eleventyConfig.addFilter("initials", (name) => String(name || "").replace(/^Rev\.\s*/, "").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase());

  const byDate = (a, b) => b.date - a.date;
  const byOrder = (a, b) => (a.data.order ?? 999) - (b.data.order ?? 999);
  const notDraft = (p) => !p.data.draft;
  eleventyConfig.addCollection("labnotes", (api) => api.getFilteredByTag("labnote").filter(notDraft).sort(byDate));
  eleventyConfig.addCollection("news", (api) => api.getFilteredByTag("news").filter(notDraft).sort(byDate));
  eleventyConfig.addCollection("press", (api) => api.getFilteredByTag("press").filter(notDraft).sort(byDate));
  eleventyConfig.addCollection("work", (api) => api.getFilteredByTag("work").filter(notDraft).sort(byOrder));
  eleventyConfig.addCollection("team", (api) => api.getFilteredByTag("team").filter(notDraft).sort(byOrder));
  eleventyConfig.addCollection("sitemap", (api) => api.getAll().filter((p) => p.url && !p.data.noindex && !p.data.eleventyExcludeFromCollections));

  // Atom feed for Lab Notes
  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: { name: "labnotes", limit: 20 },
    metadata: {
      language: "en",
      title: "The Hope Group · Lab Notes",
      subtitle: "Notes from an ethical AI lab in Boston.",
      base: "https://hopegroup.ai/",
      author: { name: "The Hope Group", email: "hello@hopegroup.ai" },
    },
  });

  eleventyConfig.addShortcode("thisYear", () => String(new Date().getFullYear()));
  eleventyConfig.setServerOptions({ showAllHosts: false, port: 8080 });

  return {
    dir: { input: "src", output: PREVIEW ? "_site_preview" : "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html", "11ty.js"],
  };
};
