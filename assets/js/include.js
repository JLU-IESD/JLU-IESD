const BASE = "/JLU-IESD/"; // GitHub Pages 子路径（仓库名）

function absPath(rel) {
  return BASE + String(rel || "").replace(/^\/+/, "");
}

function stripBase(pathname) {
  const p = pathname || "/";
  if (p.startsWith(BASE)) return p.slice(BASE.length);
  return p.replace(/^\//, "");
}

function isZh() {
  return stripBase(location.pathname).startsWith("zh/");
}
function lang() {
  return isZh() ? "zh" : "en";
}

function ensureIndex(p) {
  // p: "en/" or "en/people/" or "en/people/index.html"
  if (!p) return "index.html";
  if (p.endsWith(".html")) return p;
  if (p.endsWith("/")) return p + "index.html";
  return p + "/index.html";
}

function pairPath(toLang) {
  // 返回不带 BASE 的路径（尽量保持目录形态），最后交给 ensureIndex()
  const p = stripBase(location.pathname);

  if (p.startsWith("en/")) return (toLang === "zh") ? p.replace(/^en\//, "zh/") : p;
  if (p.startsWith("zh/")) return (toLang === "en") ? p.replace(/^zh\//, "en/") : p;

  return `${toLang}/`;
}

async function inject(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;
  const res = await fetch(url, { cache: "no-cache" });
  el.innerHTML = await res.text();
}

function setNav() {
  const L = lang();
  const labels = {
    en: { news: "News", people: "People", publications: "Publications", join: "Join Us", toggle: "中文" },
    zh: { news: "新闻", people: "成员", publications: "论文", join: "加入我们", toggle: "EN" }
  };

  // 1) 左上角 Brand：明确指向“实验室主页”
  const brand = document.getElementById("brand-link");
  if (brand) brand.href = absPath(`${L}/index.html`);

  // 2) 顶部导航：明确指向各栏目 index.html
  document.querySelectorAll(".nav-link").forEach(a => {
    const key = a.getAttribute("data-key");
    if (!key) return;
    a.textContent = labels[L][key] ?? a.textContent;
    a.href = absPath(`${L}/${key}/index.html`);
  });

  // 3) 语言切换：保持当前栏目路径，并落到 index.html
  const t = document.getElementById("lang-toggle");
  if (t) {
    t.textContent = labels[L].toggle;
    const targetLang = (L === "en") ? "zh" : "en";
    t.href = absPath(ensureIndex(pairPath(targetLang)));
  }

  // 4) 高亮当前页
  const p = stripBase(location.pathname);
  let active = "";
  if (p.includes("news/")) active = "news";
  else if (p.includes("people/")) active = "people";
  else if (p.includes("publications/")) active = "publications";
  else if (p.includes("join/")) active = "join";
  if (active) document.querySelector(`.nav-link[data-key="${active}"]`)?.classList.add("active");
}

(async function () {
  await inject("#site-header", "partials/header.html");
  await inject("#site-footer", "partials/footer.html");
  setNav();
})();
