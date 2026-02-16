function isZh() { return location.pathname.startsWith("/zh/"); }
function lang() { return isZh() ? "zh" : "en"; }

function pairPath(toLang) {
  const p = location.pathname;
  if (toLang === "zh") return p.startsWith("/en/") ? p.replace("/en/", "/zh/") : "/zh/";
  return p.startsWith("/zh/") ? p.replace("/zh/", "/en/") : "/en/";
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
    en: { news:"News", people:"People", publications:"Publications", join:"Join Us", brand:"JLU-IESD", toggle:"中文" },
    zh: { news:"新闻", people:"成员", publications:"论文", join:"加入我们", brand:"JLU-IESD", toggle:"EN" }
  };

  // rewrite header links/labels
  const root = `/${L}/`;
  document.getElementById("brand-link").href = root;
  document.getElementById("brand-link").textContent = labels[L].brand;

  document.querySelectorAll(".nav-link").forEach(a => {
    const key = a.getAttribute("data-key");
    a.textContent = labels[L][key];
    a.href = `${root}${key}/`;
  });

  const t = document.getElementById("lang-toggle");
  t.textContent = labels[L].toggle;
  t.href = pairPath(L === "en" ? "zh" : "en");

  // active
  const p = location.pathname;
  let active = "";
  if (p.includes("/news/")) active = "news";
  else if (p.includes("/people/")) active = "people";
  else if (p.includes("/publications/")) active = "publications";
  else if (p.includes("/join/")) active = "join";
  if (active) document.querySelector(`.nav-link[data-key="${active}"]`)?.classList.add("active");
}

(async function () {
  await inject("#site-header", "/partials/header.html");
  await inject("#site-footer", "/partials/footer.html");
  setNav();
})();
