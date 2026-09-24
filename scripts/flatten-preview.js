// Post-processes the PREVIEW build so the home page can be published as a
// claude.ai artifact: the artifact publisher wraps the page in its own
// <html>/<head>/<body>, so index.html must be a fragment.
const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "_site_preview", "index.html");
let html = fs.readFileSync(file, "utf8");
const head = (html.match(/<head[^>]*>([\s\S]*?)<\/head>/i) || [, ""])[1];
const body = (html.match(/<body[^>]*>([\s\S]*?)<\/body>/i) || [, html])[1];
const bodyAttrs = (html.match(/<body([^>]*)>/i) || [, ""])[1];
const keep = head
  .replace(/<meta[^>]*(charset|viewport)[^>]*>\s*/gi, "")
  .replace(/<title>[^<]*<\/title>/i, "<title>The Hope Group</title>")
  .trim();
fs.writeFileSync(file, `${keep}\n<div${bodyAttrs}>\n${body}\n</div>\n`);
console.log("flattened", file);
