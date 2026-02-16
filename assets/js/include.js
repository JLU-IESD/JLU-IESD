async function inject(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;
  const res = await fetch(url, { cache: "no-cache" });
  el.innerHTML = await res.text();
}

function detectLang() {
  return location.pathname.startsWith("/zh/") ? "zh" : "en";
}

function setActiveNav() {
  const p = location.pathname;
  let key = "";
  if (p.includes("/news/")) key = "news";
  else if (p.includes("/people/")) key = "people";
  else if (p.includes("/publications/")) key = "publications";
  else if (p.includes("/join/")) key = "join";

  if (!key) return;
  document.querySelectorAll('[data-nav]').forEach(a => {
    if (a.getAttribute("data-nav") === key) a.classList.add("active");
  });
}

(async function () {
  const lang = detectLang();
  await inject("#site-header", `/partials/header.${lang}.html`);
  await inject("#site-footer", `/partials/footer.${lang}.html`);
  setActiveNav();
})();
