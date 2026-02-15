const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];

function esc(str=""){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

async function loadJSON(path){
  const res = await fetch(path, { cache: "no-store" });
  if(!res.ok) throw new Error(`Failed to load ${path}`);
  return await res.json();
}

// mobile nav
function initNav(){
  const btn = $(".nav__toggle");
  const nav = $(".nav");
  btn?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  $$(".nav a").forEach(a => a.addEventListener("click", ()=>{
    nav.classList.remove("is-open");
    btn.setAttribute("aria-expanded","false");
  }));
}

function renderNews(items){
  const el = $("#newsList");
  if(!el) return;
  el.innerHTML = items.map(n => `
    <div class="newsItem">
      <div class="badge">${esc(n.date)}</div>
      <div class="newsItem__body">
        <div class="newsItem__title">${esc(n.title)}</div>
        <div class="newsItem__meta">${esc(n.desc || "")}</div>
      </div>
    </div>
  `).join("");
}

function renderPeople(people, group="all"){
  const el = $("#peopleGrid");
  if(!el) return;
  const filtered = group === "all" ? people : people.filter(p => p.group === group);

  el.innerHTML = filtered.map(p => `
    <div class="card person">
      <img class="person__avatar" src="${esc(p.photo || "assets/img/people/placeholder.jpg")}" alt="${esc(p.name)}" loading="lazy" />
      <div class="person__name">${esc(p.name)}</div>
      <div class="person__role">${esc(p.role || "")}</div>
      <div class="person__links">
        ${p.email ? `<a href="mailto:${esc(p.email)}">Email</a>` : ""}
        ${p.homepage ? `<a href="${esc(p.homepage)}" target="_blank" rel="noreferrer">Homepage</a>` : ""}
        ${p.scholar ? `<a href="${esc(p.scholar)}" target="_blank" rel="noreferrer">Scholar</a>` : ""}
        ${p.github ? `<a href="${esc(p.github)}" target="_blank" rel="noreferrer">GitHub</a>` : ""}
      </div>
    </div>
  `).join("");
}

function initPeopleTabs(people){
  const tabs = $$(".tab");
  tabs.forEach(t => t.addEventListener("click", () => {
    tabs.forEach(x => x.classList.remove("is-active"));
    t.classList.add("is-active");
    renderPeople(people, t.dataset.group);
  }));
}

function uniq(arr){ return [...new Set(arr)]; }

function renderPubTools(pubs){
  const yearSel = $("#pubYear");
  if(!yearSel) return;

  const years = uniq(pubs.map(p => p.year).filter(Boolean)).sort((a,b)=>b-a);
  yearSel.innerHTML = `<option value="all">全部年份</option>` + years.map(y => `<option value="${y}">${y}</option>`).join("");
}

function renderPubs(pubs){
  const list = $("#pubList");
  const q = ($("#pubSearch")?.value || "").trim().toLowerCase();
  const y = ($("#pubYear")?.value || "all");

  let filtered = pubs;

  if(y !== "all") filtered = filtered.filter(p => String(p.year) === String(y));
  if(q){
    filtered = filtered.filter(p => {
      const blob = `${p.title||""} ${p.authors||""} ${p.venue||""}`.toLowerCase();
      return blob.includes(q);
    });
  }

  list.innerHTML = filtered.map(p => `
    <div class="pub">
      <p class="pub__title">${esc(p.title)}</p>
      <p class="pub__authors">${esc(p.authors || "")}</p>
      <p class="pub__venue">${esc(p.venue || "")} ${p.year ? `· ${esc(p.year)}` : ""}</p>
      <div class="pub__links">
        ${p.paper ? `<a href="${esc(p.paper)}" target="_blank" rel="noreferrer">Paper</a>` : ""}
        ${p.code ? `<a href="${esc(p.code)}" target="_blank" rel="noreferrer">Code</a>` : ""}
        ${p.project ? `<a href="${esc(p.project)}" target="_blank" rel="noreferrer">Project</a>` : ""}
        ${p.bibtex ? `<a href="${esc(p.bibtex)}" target="_blank" rel="noreferrer">BibTeX</a>` : ""}
      </div>
    </div>
  `).join("");
}

function initPubFilters(pubs){
  $("#pubSearch")?.addEventListener("input", () => renderPubs(pubs));
  $("#pubYear")?.addEventListener("change", () => renderPubs(pubs));
}

(async function main(){
  initNav();
  $("#year").textContent = new Date().getFullYear();

  try{
    const [news, people, pubs] = await Promise.all([
      loadJSON("data/news.json"),
      loadJSON("data/people.json"),
      loadJSON("data/publications.json"),
    ]);

    renderNews(news);
    renderPeople(people, "all");
    initPeopleTabs(people);

    renderPubTools(pubs);
    renderPubs(pubs);
    initPubFilters(pubs);
  }catch(err){
    console.error(err);
  }
})();
