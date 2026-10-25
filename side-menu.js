/* side-menu.js: a drop-in phone menu (menu button + slide-out side drawer).
   Configure it with data-* attributes on its own <script> tag:
     data-mount       where the menu button goes (selector, button is appended)
     data-links       the links to list in the drawer (selector for <a> elements)
     data-hide        what to hide on phones (selector, optional)
     data-brand       drawer title          data-brand-href  link for the title
     data-cta-text / data-cta-href         main button at the bottom (optional)
     data-cta2-text / data-cta2-href       second button (optional)
     data-accent / data-bg / data-text     drawer colours
     data-cta-color   text colour on the main button (default white)
     data-burger-color / data-burger-bg    menu button colours
     data-breakpoint  width in px below which the menu is used (default 768) */
(function () {
    const s = document.currentScript;
    const cfg = (k, d) => (s && s.dataset[k]) || d;

    const BP = parseInt(cfg("breakpoint", "768"), 10);
    const ACCENT = cfg("accent", "#ff6600");
    const BG = cfg("bg", "#111111");
    const TEXT = cfg("text", "#ffffff");
    const BURGER_COLOR = cfg("burgerColor", "currentColor");
    const BURGER_BG = cfg("burgerBg", "transparent");
    const CTA_COLOR = cfg("ctaColor", "#fff");

    const css = `
@media (max-width: ${BP}px) {
  ${cfg("hide", "") ? cfg("hide", "") + " { display: none !important; }" : ""}
  .sm-burger { display: inline-flex !important; }
}
.sm-burger {
  display: none; flex-direction: column; justify-content: center; gap: 5px;
  width: 44px; height: 44px; padding: 0 12px; margin-left: 8px; flex-shrink: 0;
  border: 1px solid color-mix(in srgb, ${BURGER_COLOR === "currentColor" ? TEXT : BURGER_COLOR} 22%, transparent);
  border-radius: 12px; background: ${BURGER_BG}; color: ${BURGER_COLOR}; cursor: pointer;
}
.sm-burger span { display: block; height: 2px; border-radius: 2px; background: currentColor; }
.sm-burger span:nth-child(2) { width: 70%; margin-left: auto; }
.sm-burger:focus-visible, .sm-close:focus-visible, .sm-drawer a:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 2px; }
.sm-backdrop {
  position: fixed; inset: 0; z-index: 9998; background: rgba(0,0,0,.55);
  -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
  opacity: 0; visibility: hidden; transition: opacity .25s ease, visibility .25s;
}
.sm-drawer {
  position: fixed; top: 0; right: 0; bottom: 0; z-index: 9999;
  width: min(84vw, 330px); display: flex; flex-direction: column;
  padding: 18px 18px calc(18px + env(safe-area-inset-bottom));
  background: radial-gradient(ellipse at 100% 0%, color-mix(in srgb, ${ACCENT} 22%, transparent) 0%, transparent 55%), ${BG};
  color: ${TEXT}; box-shadow: -20px 0 60px rgba(0,0,0,.35);
  transform: translateX(105%); visibility: hidden; overflow-y: auto;
  transition: transform .3s cubic-bezier(.22,1,.36,1), visibility 0s linear .3s;
  text-align: left;
}
html.sm-open, html.sm-open body { overflow: hidden; }
html.sm-open .sm-backdrop { opacity: 1; visibility: visible; }
html.sm-open .sm-drawer { transform: none; visibility: visible; transition: transform .3s cubic-bezier(.22,1,.36,1), visibility 0s; }
.sm-head { display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding-bottom: 16px; margin-bottom: 10px; border-bottom: 1px solid color-mix(in srgb, ${TEXT} 12%, transparent); }
.sm-brand { color: inherit; font-size: 18px; font-weight: 800; text-decoration: none; letter-spacing: -.2px; }
.sm-close { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 10px; cursor: pointer;
  border: 1px solid color-mix(in srgb, ${TEXT} 18%, transparent); background: color-mix(in srgb, ${TEXT} 6%, transparent); color: inherit; }
.sm-links { display: flex; flex-direction: column; gap: 4px; }
.sm-links a { display: flex; align-items: center; justify-content: space-between; min-height: 50px; padding: 0 14px;
  border-radius: 12px; color: color-mix(in srgb, ${TEXT} 85%, transparent); font-size: 16px; font-weight: 600;
  text-decoration: none; transition: background .2s, color .2s; }
.sm-links a:hover { background: color-mix(in srgb, ${TEXT} 7%, transparent); color: ${TEXT}; }
.sm-links a.sm-active { background: color-mix(in srgb, ${ACCENT} 16%, transparent); color: ${TEXT}; }
.sm-links a svg { opacity: .35; flex-shrink: 0; }
.sm-links a.sm-active svg { opacity: 1; color: ${ACCENT}; }
.sm-actions { display: flex; flex-direction: column; gap: 10px; margin-top: auto; padding-top: 24px; }
.sm-btn { display: flex; align-items: center; justify-content: center; min-height: 48px; border-radius: 999px;
  font-size: 15px; font-weight: 700; text-decoration: none; }
.sm-btn-primary { background: ${ACCENT}; color: ${CTA_COLOR}; }
.sm-btn-ghost { border: 1px solid color-mix(in srgb, ${TEXT} 22%, transparent); color: inherit; }
@media (min-width: ${BP + 1}px) { .sm-burger, .sm-backdrop, .sm-drawer { display: none !important; } }
@media (prefers-reduced-motion: reduce) { .sm-drawer, .sm-backdrop { transition: none !important; } }`;

    const CHEV = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
    const CLOSE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    function isActive(a) {
        if (a.classList.contains("is-active") || a.classList.contains("active") || a.getAttribute("aria-current") === "page") return true;
        const href = a.getAttribute("href") || "";
        if (href.startsWith("#")) return false;
        const file = p => p.split("#")[0].split("?")[0].split("/").pop() || "index.html";
        return file(new URL(a.href, location.href).pathname) === file(location.pathname);
    }

    function build() {
        const mount = document.querySelector(cfg("mount", "nav"));
        const links = [...document.querySelectorAll(cfg("links", "nav a"))];
        if (!mount || !links.length || document.querySelector(".sm-burger")) return;

        const style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);

        const burger = document.createElement("button");
        burger.type = "button";
        burger.className = "sm-burger";
        burger.setAttribute("aria-label", "Open menu");
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-controls", "sm-drawer");
        burger.innerHTML = "<span></span><span></span><span></span>";
        mount.appendChild(burger);

        const cta = cfg("ctaText", "") && `<a class="sm-btn sm-btn-primary" href="${esc(cfg("ctaHref", "#"))}">${esc(cfg("ctaText", ""))}</a>`;
        const cta2 = cfg("cta2Text", "") && `<a class="sm-btn sm-btn-ghost" href="${esc(cfg("cta2Href", "#"))}">${esc(cfg("cta2Text", ""))}</a>`;

        const backdrop = document.createElement("div");
        backdrop.className = "sm-backdrop";
        const drawer = document.createElement("aside");
        drawer.className = "sm-drawer";
        drawer.id = "sm-drawer";
        drawer.setAttribute("role", "dialog");
        drawer.setAttribute("aria-modal", "true");
        drawer.setAttribute("aria-label", "Site menu");
        drawer.innerHTML = `
          <div class="sm-head">
            <a class="sm-brand" href="${esc(cfg("brandHref", "index.html"))}">${esc(cfg("brand", document.title.split(/[—|-]/)[0].trim()))}</a>
            <button type="button" class="sm-close" aria-label="Close menu">${CLOSE}</button>
          </div>
          <nav class="sm-links" aria-label="Pages">
            ${links.map(a => `<a href="${esc(a.getAttribute("href"))}"${isActive(a) ? ' class="sm-active" aria-current="page"' : ""}><span>${esc(a.textContent.trim())}</span>${CHEV}</a>`).join("")}
          </nav>
          ${cta || cta2 ? `<div class="sm-actions">${cta || ""}${cta2 || ""}</div>` : ""}`;
        document.body.appendChild(backdrop);
        document.body.appendChild(drawer);

        const root = document.documentElement;
        const closeBtn = drawer.querySelector(".sm-close");
        const open = () => { root.classList.add("sm-open"); burger.setAttribute("aria-expanded", "true"); closeBtn.focus(); };
        const close = (refocus = true) => { root.classList.remove("sm-open"); burger.setAttribute("aria-expanded", "false"); if (refocus) burger.focus(); };

        burger.addEventListener("click", open);
        closeBtn.addEventListener("click", () => close());
        backdrop.addEventListener("click", () => close());
        drawer.querySelectorAll("a").forEach(a => a.addEventListener("click", () => close(false)));
        document.addEventListener("keydown", e => { if (e.key === "Escape" && root.classList.contains("sm-open")) close(); });
        window.addEventListener("resize", () => { if (window.innerWidth > BP) close(false); });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
    else build();
})();
