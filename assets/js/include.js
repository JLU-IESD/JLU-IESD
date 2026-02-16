const BASE = "/JLU-IESD/"; // GitHub Pages 子路径（仓库名）

function absPath(rel) {
  // 把 "en/people/" 这种相对站点根目录的路径，变成 "/JLU-IESD/en/people/"
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

function pairPath(toLang) {
  // 返回“不带 BASE 的路径”，例如 "zh/people/"、"en/"
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

  // 实验室主页（英文/中文各自主页）
  const brand = document.getElementById("brand-link");
  if (brand) brand.href = absPath(`${L}/`);

  // 顶部导航链接（用绝对路径，避免在子目录里相对跳转出错）
  document.querySelectorAll(".nav-link").forEach(a => {
    const key = a.getAttribute("data-key");
    if (!key) return;
    a.textContent = labels[L][key] ?? a.textContent;
    a.href = absPath(`${L}/${key}/`);
  });

  // 中英文切换
  const t = document.getElementById("lang-toggle");
  if (t) {
    t.textContent = labels[L].toggle;
    const targetLang = (L === "en") ? "zh" : "en";
    t.href = absPath(pairPath(targetLang));
  }

  // 高亮当前页
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
