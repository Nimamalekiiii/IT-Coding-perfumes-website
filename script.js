/* ============================================================
   OUD ROYALE: funksjoner
   Innholdet (produkter, priser, kontaktinfo) ligger i products.js
   ============================================================ */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  const kr = (n) => n.toLocaleString("nb-NO") + " " + SHOP.valuta;
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const img = (p, small) => "images/" + p.id + (small ? "-s" : "") + ".webp";
  const url = (p) => "produkt.html?p=" + encodeURIComponent(p.id);

  /* ================= HANDLEKURV (lagres i nettleseren) ================= */

  const CART_KEY = "oudroyale-kurv";
  let cart = {};

  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
    Object.keys(saved).forEach((id) => {
      const qty = parseInt(saved[id], 10);
      if (byId(id) && qty > 0) cart[id] = Math.min(qty, 20);
    });
  } catch (e) {
    cart = {};
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      /* privat modus: kurven varer da bare til siden lukkes */
    }
    renderCartEverywhere();
  }

  const cartLines = () => Object.keys(cart).map((id) => ({ p: byId(id), qty: cart[id] }));
  const cartCount = () => cartLines().reduce((n, l) => n + l.qty, 0);
  const cartTotal = () => cartLines().reduce((n, l) => n + l.qty * l.p.pris, 0);

  function setQty(id, qty) {
    if (qty <= 0) delete cart[id];
    else cart[id] = Math.min(qty, 20);
    saveCart();
  }

  function addToCart(id, qty, fromEl) {
    setQty(id, (cart[id] || 0) + (qty || 1));
    flyToCart(byId(id), fromEl);
    const count = $(".cart-count");
    if (count) {
      count.classList.remove("is-bump");
      void count.offsetWidth;
      count.classList.add("is-bump");
    }
  }

  /* Flasken flyr fra knappen til handlekurv-ikonet */
  function flyToCart(p, fromEl) {
    const target = $(".cart-btn");
    if (reduceMotion || !fromEl || !target || typeof document.body.animate !== "function") return;
    const a = fromEl.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const el = document.createElement("img");
    el.className = "fly";
    el.src = img(p, true);
    el.alt = "";
    el.style.left = a.left + a.width / 2 - 32 + "px";
    el.style.top = a.top + a.height / 2 - 40 + "px";
    document.body.appendChild(el);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    el.animate(
      [
        { transform: "translate(0px, 0px) scale(1)", opacity: 1 },
        { transform: `translate(${(dx * 0.5).toFixed(1)}px, ${(dy * 0.5 - 70).toFixed(1)}px) scale(0.8)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(0.15)`, opacity: 0.2 }
      ],
      { duration: 800, easing: "cubic-bezier(0.3, 0, 0.3, 1)" }
    ).onfinish = () => el.remove();
  }

  /* ================= SKUFF ================= */

  const scrim = document.createElement("div");
  scrim.className = "scrim";
  const drawer = document.createElement("aside");
  drawer.className = "drawer";
  drawer.setAttribute("aria-label", "Handlekurv");
  drawer.innerHTML = `
    <div class="drawer-head">
      <h2>Handlekurv</h2>
      <button type="button" class="icon-btn" data-close-cart aria-label="Lukk handlekurven">&times;</button>
    </div>
    <div class="drawer-body" data-cart-lines></div>
    <div class="drawer-foot" data-cart-foot></div>`;
  document.body.append(scrim, drawer);

  let lastFocus = null;

  function openCart() {
    closeMenu();
    lastFocus = document.activeElement;
    drawer.classList.add("is-open");
    scrim.classList.add("is-open");
    $("[data-close-cart]", drawer).focus({ preventScroll: true });
  }

  function closeCart() {
    drawer.classList.remove("is-open");
    scrim.classList.remove("is-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  scrim.addEventListener("click", closeCart);

  function linesHtml() {
    const lines = cartLines();
    if (!lines.length) {
      return `<div class="cart-empty"><p>Handlekurven er tom.</p><a class="btn btn-dark" href="parfymer.html">Se parfymene</a></div>`;
    }
    return lines
      .map(
        ({ p, qty }) => `
      <div class="line" data-line="${esc(p.id)}">
        <img src="${img(p, true)}" alt="" width="72" height="90" loading="lazy">
        <div>
          <a class="line-name" href="${url(p)}">${esc(p.navn)}</a>
          <div class="line-meta">${p.ml} ml, ${kr(p.pris)}</div>
          <div class="qty">
            <button type="button" data-dec aria-label="Én færre ${esc(p.navn)}">&minus;</button>
            <output aria-live="polite">${qty}</output>
            <button type="button" data-inc aria-label="Én til ${esc(p.navn)}">+</button>
          </div>
        </div>
        <div class="line-right">
          <div class="price">${kr(p.pris * qty)}</div>
          <button type="button" class="line-remove" data-remove>Fjern</button>
        </div>
      </div>`
      )
      .join("");
  }

  function renderCartEverywhere() {
    const count = cartCount();
    $$(".cart-count").forEach((el) => {
      el.textContent = count;
      el.classList.toggle("has-items", count > 0);
    });
    $$(".cart-btn").forEach((el) => el.setAttribute("aria-label", "Åpne handlekurven, " + count + (count === 1 ? " vare" : " varer")));

    $$("[data-cart-lines]").forEach((el) => (el.innerHTML = linesHtml()));
    $$("[data-cart-sum]").forEach((el) => (el.textContent = kr(cartTotal())));
    $$("[data-cart-foot]").forEach((el) => {
      el.innerHTML = count
        ? `<div class="sum-row"><span>Sum</span><span>${kr(cartTotal())}</span></div>
           <p class="sum-note">Frakt kommer i tillegg og bekreftes når vi svarer deg.</p>
           <a class="btn btn-dark btn-block" href="handlekurv.html">Gå til bestilling</a>`
        : "";
    });
    document.dispatchEvent(new CustomEvent("cart:change"));
  }

  /* Klikk i kurvlinjer, både i skuffen og på bestillingssiden */
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;

    if (t.closest("[data-open-cart]")) {
      e.preventDefault();
      openCart();
      return;
    }
    if (t.closest("[data-close-cart]")) {
      closeCart();
      return;
    }

    const line = t.closest("[data-line]");
    if (line) {
      const id = line.getAttribute("data-line");
      if (t.closest("[data-inc]")) setQty(id, (cart[id] || 0) + 1);
      else if (t.closest("[data-dec]")) setQty(id, (cart[id] || 0) - 1);
      else if (t.closest("[data-remove]")) setQty(id, 0);
      return;
    }

    const add = t.closest("[data-add]");
    if (add) {
      e.preventDefault();
      const id = add.getAttribute("data-add");
      const qtyEl = add.closest("[data-buy]") && $("[data-qty]", add.closest("[data-buy]"));
      addToCart(id, qtyEl ? parseInt(qtyEl.textContent, 10) : 1, add);
      const label = add.getAttribute("data-label") || add.textContent;
      add.setAttribute("data-label", label);
      add.classList.add("is-added");
      add.textContent = "Lagt i kurven";
      setTimeout(() => {
        add.classList.remove("is-added");
        add.textContent = label;
      }, 1600);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCart();
      closeMenu();
    }
  });

  /* ================= HEADER ================= */

  const header = $(".site-header");
  const menuBtn = $(".menu-btn");
  const nav = $(".site-nav");

  function onScroll() {
    if (header) header.classList.toggle("is-solid", window.scrollY > 24 || (nav && nav.classList.contains("is-open")));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    if (!nav || !menuBtn) return;
    nav.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    onScroll();
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
      onScroll();
    });
    $$("a", nav).forEach((a) => a.addEventListener("click", closeMenu));
  }

  /* ================= BUTIKKINFO ================= */

  $$("[data-shop]").forEach((el) => {
    const key = el.getAttribute("data-shop");
    const value = SHOP[key];
    const row = el.closest("[data-shop-row]");
    if (!value) {
      if (row) row.hidden = true;
      else el.hidden = true;
      return;
    }
    if (key === "epost") {
      el.textContent = value;
      if (el.tagName === "A") el.href = "mailto:" + value;
    } else if (key === "instagram") {
      el.textContent = "@" + value;
      if (el.tagName === "A") el.href = "https://www.instagram.com/" + encodeURIComponent(value) + "/";
    } else if (key === "telefon") {
      el.textContent = value;
      if (el.tagName === "A") el.href = "tel:" + value.replace(/\s+/g, "");
    } else {
      el.textContent = value;
    }
  });

  /* ================= PRODUKTKORT ================= */

  function cardHtml(p, i) {
    return `
      <article class="card reveal" style="--delay:${(i % 4) * 90}ms">
        <a class="card-media" href="${url(p)}" tabindex="-1" aria-hidden="true">
          <img src="${img(p, true)}" alt="" width="480" height="600" loading="lazy" decoding="async">
        </a>
        <div class="card-body">
          <p class="card-family">${esc(FAMILIES[p.familie] || "")}</p>
          <h3 class="card-name"><a href="${url(p)}">${esc(p.navn)}</a></h3>
          <p class="card-short">${esc(p.kort)}</p>
          <div class="card-foot">
            <span class="price">${kr(p.pris)} <small>/ ${p.ml} ml</small></span>
            <button type="button" class="add-btn" data-add="${esc(p.id)}">Legg i kurv</button>
          </div>
        </div>
      </article>`;
  }

  function fillGrid(el, list) {
    el.innerHTML = list.map(cardHtml).join("");
    observeReveals(el);
  }

  /* ================= SCROLL-AVSLØRING ================= */

  let revealObserver = null;
  if ("IntersectionObserver" in window && !reduceMotion) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
  }

  function observeReveals(root) {
    $$(".reveal, .pyramid", root).forEach((el) => {
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add("is-in");
    });
  }

  /* ================= FORSIDE ================= */

  const featured = $('[data-grid="featured"]');
  if (featured) fillGrid(featured, FEATURED.map(byId).filter(Boolean));

  const hero = $(".hero");
  if (hero) {
    const slides = $$(".hero-slide", hero);
    const caption = $(".hero-caption a", hero);
    const dots = $$(".hero-dots button", hero);
    let current = 0;
    let timer = null;

    function show(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle("is-active", n === current));
      dots.forEach((d, n) => d.setAttribute("aria-current", String(n === current)));
      const p = byId(slides[current].getAttribute("data-id"));
      if (caption && p) {
        caption.textContent = p.navn;
        caption.href = url(p);
      }
    }

    function play() {
      clearInterval(timer);
      if (!reduceMotion && slides.length > 1) timer = setInterval(() => show(current + 1), 5200);
    }

    dots.forEach((d, n) =>
      d.addEventListener("click", () => {
        show(n);
        play();
      })
    );
    show(0);
    play();
    document.addEventListener("visibilitychange", () => (document.hidden ? clearInterval(timer) : play()));
    requestAnimationFrame(() => hero.classList.add("is-ready"));

    /* Glør som stiger opp bak teksten */
    const canvas = $(".embers", hero);
    if (canvas && !reduceMotion) {
      const ctx = canvas.getContext("2d");
      let w = 0;
      let h = 0;
      let sparks = [];
      let running = true;
      let raf = null;

      const spawn = (anywhere) => ({
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 10,
        r: 0.6 + Math.random() * 1.8,
        vy: 0.18 + Math.random() * 0.5,
        sway: Math.random() * Math.PI * 2,
        life: 0.35 + Math.random() * 0.65
      });

      function size() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = canvas.clientWidth;
        h = canvas.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        sparks = Array.from({ length: Math.round(Math.min(60, w / 22)) }, () => spawn(true));
      }

      function frame() {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < sparks.length; i++) {
          const s = sparks[i];
          s.y -= s.vy;
          s.sway += 0.012;
          s.x += Math.sin(s.sway) * 0.25;
          const fade = Math.max(0, Math.min(1, s.y / (h * 0.75))) * s.life;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(240, 150, 60," + fade.toFixed(3) + ")";
          ctx.fill();
          if (s.y < -10) sparks[i] = spawn(false);
        }
        if (running) raf = requestAnimationFrame(frame);
      }

      size();
      raf = requestAnimationFrame(frame);
      window.addEventListener("resize", size);
      if ("IntersectionObserver" in window) {
        new IntersectionObserver((entries) => {
          const visible = entries[0].isIntersecting;
          if (visible && !running) {
            running = true;
            raf = requestAnimationFrame(frame);
          } else if (!visible) {
            running = false;
            cancelAnimationFrame(raf);
          }
        }).observe(hero);
      }
    }
  }

  /* ================= KOLLEKSJON ================= */

  const all = $('[data-grid="all"]');
  if (all) {
    const chips = $("[data-chips]");
    const sort = $("[data-sort]");
    const count = $("[data-count]");
    let family = new URLSearchParams(location.search).get("familie") || "alle";
    if (family !== "alle" && !FAMILIES[family]) family = "alle";

    chips.innerHTML =
      `<button type="button" class="chip" data-family="alle">Alle</button>` +
      Object.keys(FAMILIES)
        .map((f) => `<button type="button" class="chip" data-family="${f}">${esc(FAMILIES[f])}</button>`)
        .join("");

    function render() {
      let list = PRODUCTS.filter((p) => family === "alle" || p.familie === family);
      const mode = sort.value;
      if (mode === "pris-lav") list = list.slice().sort((a, b) => a.pris - b.pris);
      if (mode === "pris-hoy") list = list.slice().sort((a, b) => b.pris - a.pris);
      if (mode === "navn") list = list.slice().sort((a, b) => a.navn.localeCompare(b.navn, "nb"));
      if (mode === "styrke") list = list.slice().sort((a, b) => a.styrke - b.styrke);
      $$(".chip", chips).forEach((c) => c.setAttribute("aria-pressed", String(c.getAttribute("data-family") === family)));
      count.textContent = list.length + (list.length === 1 ? " parfyme" : " parfymer");
      if (list.length) fillGrid(all, list);
      else all.innerHTML = `<p class="empty">Ingen parfymer i denne duftfamilien ennå.</p>`;
    }

    chips.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      family = chip.getAttribute("data-family");
      render();
    });
    sort.addEventListener("change", render);
    render();
  }

  /* ================= PRODUKTSIDE ================= */

  const productRoot = $("#product");
  if (productRoot) {
    const p = byId(new URLSearchParams(location.search).get("p"));

    if (!p) {
      productRoot.innerHTML = `
        <div class="wrap page-head">
          <h1 class="h2">Vi fant ikke den parfymen</h1>
          <p class="lede">Lenken kan være gammel. Hele kolleksjonen finner du her:</p>
          <p style="margin-top:24px"><a class="btn" href="parfymer.html">Se alle parfymene</a></p>
        </div>`;
    } else {
      document.title = p.navn + " | " + SHOP.navn;
      const desc = $('meta[name="description"]');
      if (desc) desc.setAttribute("content", p.navn + ": " + p.kort);

      const rows = [
        ["Topp", p.noter.topp],
        ["Hjerte", p.noter.hjerte],
        ["Bunn", p.noter.bunn]
      ];
      let n = 0;
      const pyramid = rows
        .map(
          ([label, notes]) => `
          <div class="pyramid-row">
            <dt>${label}</dt>
            <dd>${notes.map((note) => `<span class="note-pill" style="--n:${n++}">${esc(note)}</span>`).join("")}</dd>
          </div>`
        )
        .join("");
      const strength = ["", "Diskret", "Lett", "Merkbar", "Tydelig", "Kraftig"][p.styrke] || "";
      const bruk = { hverdag: "Hverdag", kveld: "Kveld", fest: "Store anledninger" };

      productRoot.innerHTML = `
        <div class="wrap product">
          <div class="product-media" data-zoom>
            <img src="${img(p)}" alt="${esc(p.navn)}, flaske på ${p.ml} ml" width="880" height="1100">
          </div>
          <div class="product-info">
            <nav class="crumbs" aria-label="Brødsmuler">
              <a href="index.html">Hjem</a><span aria-hidden="true">/</span>
              <a href="parfymer.html">Parfymer</a><span aria-hidden="true">/</span>
              <span>${esc(p.navn)}</span>
            </nav>
            <h1 class="product-name">${esc(p.navn)}</h1>
            <p class="product-family">${esc(FAMILIES[p.familie] || "")}</p>
            <p class="product-text">${esc(p.tekst)}</p>

            <div class="buy" data-buy>
              <span class="price">${kr(p.pris)} <small>/ ${p.ml} ml</small></span>
              <div class="qty">
                <button type="button" data-qty-dec aria-label="Færre">&minus;</button>
                <output data-qty aria-live="polite">1</output>
                <button type="button" data-qty-inc aria-label="Flere">+</button>
              </div>
              <button type="button" class="btn" data-add="${esc(p.id)}">Legg i kurv</button>
            </div>

            <h2 class="h3" style="margin-top:34px">Duftnoter</h2>
            <dl class="pyramid" style="margin-top:8px">${pyramid}</dl>

            <dl class="facts">
              <div>
                <dt>Styrke</dt>
                <dd>${strength}</dd>
                <div class="meter" aria-hidden="true">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= p.styrke ? "on" : ""}"></i>`).join("")}</div>
              </div>
              <div><dt>Passer til</dt><dd>${p.bruk.map((b) => bruk[b] || b).join(", ")}</dd></div>
              <div><dt>Størrelse</dt><dd>${p.ml} ml</dd></div>
            </dl>
          </div>
        </div>

        <section class="section">
          <div class="wrap">
            <div class="section-head"><h2 class="h2">Du vil kanskje også like</h2></div>
            <div class="grid" data-related></div>
          </div>
        </section>`;

      const qty = $("[data-qty]", productRoot);
      $("[data-qty-inc]", productRoot).addEventListener("click", () => (qty.textContent = Math.min(20, parseInt(qty.textContent, 10) + 1)));
      $("[data-qty-dec]", productRoot).addEventListener("click", () => (qty.textContent = Math.max(1, parseInt(qty.textContent, 10) - 1)));

      /* Lignende: samme duftfamilie først, deretter nærmest i styrke */
      const related = PRODUCTS.filter((x) => x.id !== p.id)
        .sort((a, b) => (b.familie === p.familie) - (a.familie === p.familie) || Math.abs(a.styrke - p.styrke) - Math.abs(b.styrke - p.styrke))
        .slice(0, 4);
      fillGrid($("[data-related]", productRoot), related);
      observeReveals(productRoot);

      /* Forstørr der pekeren er */
      const zoom = $("[data-zoom]", productRoot);
      const zoomImg = $("img", zoom);
      zoom.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        const r = zoom.getBoundingClientRect();
        zoomImg.style.setProperty("--zx", ((e.clientX - r.left) / r.width) * 100 + "%");
        zoomImg.style.setProperty("--zy", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    }
  }

  /* ================= DUFTVELGER ================= */

  const finder = $("#finder");
  if (finder) {
    const questions = [
      {
        key: "bruk",
        title: "Når skal du bruke den?",
        options: [
          { value: "hverdag", label: "Hver dag", hint: "Jobb, skole og vanlige dager" },
          { value: "kveld", label: "På kvelden", hint: "Middag, date og sene kvelder" },
          { value: "fest", label: "Store anledninger", hint: "Bryllup, fest og høytid" }
        ]
      },
      {
        key: "styrke",
        title: "Hvor mye skal den merkes?",
        options: [
          { value: 2, label: "Diskret", hint: "Sitter tett på huden" },
          { value: 3.5, label: "Merkbar", hint: "Folk merker den når de er nær deg" },
          { value: 5, label: "Kraftig", hint: "Fyller rommet og varer lenge" }
        ]
      },
      {
        key: "familie",
        title: "Hva trekkes du mot?",
        options: [
          { value: "oud", label: "Røyk og tre", hint: "Oud, sedertre og røkelse" },
          { value: "amber", label: "Varmt og søtt", hint: "Amber, vanilje og tonkabønne" },
          { value: "krydret", label: "Krydret", hint: "Safran, kardemomme og pepper" },
          { value: "musk", label: "Rent og mykt", hint: "Hvit musk og iris" },
          { value: "frisk", label: "Friskt", hint: "Sitrus og lavendel" }
        ]
      }
    ];
    const near = { oud: ["krydret", "amber"], amber: ["oud", "krydret"], krydret: ["oud", "amber"], musk: ["frisk"], frisk: ["musk"] };
    const answers = {};
    let step = 0;

    function rank() {
      return PRODUCTS.map((p) => {
        let score = 0;
        if (p.bruk.indexOf(answers.bruk) !== -1) score += 3;
        score += 3 - Math.abs(p.styrke - answers.styrke) * 1.2;
        if (p.familie === answers.familie) score += 4;
        else if ((near[answers.familie] || []).indexOf(p.familie) !== -1) score += 1.5;
        return { p, score };
      }).sort((a, b) => b.score - a.score);
    }

    function render() {
      const bars = questions.map((_, i) => `<i class="${i <= step ? "on" : ""}"></i>`).join("");

      if (step < questions.length) {
        const q = questions[step];
        finder.innerHTML = `
          <div class="finder-progress" aria-hidden="true">${bars}</div>
          <div class="finder-step">
            <p class="card-family">Spørsmål ${step + 1} av ${questions.length}</p>
            <h2 class="q-title" tabindex="-1">${q.title}</h2>
            <div class="options">
              ${q.options
                .map((o, i) => `<button type="button" class="option" data-option="${i}"><strong>${o.label}</strong><span>${o.hint}</span></button>`)
                .join("")}
            </div>
            ${step > 0 ? `<button type="button" class="finder-back" data-back>Tilbake</button>` : ""}
          </div>`;
      } else {
        const ranked = rank();
        const best = ranked[0].p;
        finder.innerHTML = `
          <div class="finder-progress" aria-hidden="true">${bars}</div>
          <div class="finder-step">
            <p class="card-family">Vårt forslag til deg</p>
            <div class="result">
              <a class="arch" href="${url(best)}" style="display:block"><img src="${img(best)}" alt="${esc(best.navn)}" width="880" height="1100"></a>
              <div>
                <h2 class="product-name" tabindex="-1">${esc(best.navn)}</h2>
                <p class="product-family">${esc(FAMILIES[best.familie])}, ${kr(best.pris)} / ${best.ml} ml</p>
                <p class="product-text">${esc(best.tekst)}</p>
                <div class="hero-actions">
                  <button type="button" class="btn" data-add="${esc(best.id)}">Legg i kurv</button>
                  <a class="btn btn-ghost" href="${url(best)}">Les mer</a>
                </div>
                <button type="button" class="finder-back" data-restart>Start på nytt</button>
              </div>
            </div>
            <div class="result-also">
              <h3 class="h3" style="margin-bottom:24px">Disse passer også</h3>
              <div class="grid" data-also></div>
            </div>
          </div>`;
        fillGrid($("[data-also]", finder), [ranked[1].p, ranked[2].p, ranked[3].p]);
      }
      const heading = $("[tabindex='-1']", finder);
      if (heading && step > 0) heading.focus({ preventScroll: true });
      if (step > 0) finder.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
    }

    finder.addEventListener("click", (e) => {
      const option = e.target.closest("[data-option]");
      if (option) {
        const q = questions[step];
        answers[q.key] = q.options[parseInt(option.getAttribute("data-option"), 10)].value;
        step++;
        render();
      } else if (e.target.closest("[data-back]")) {
        step--;
        render();
      } else if (e.target.closest("[data-restart]")) {
        step = 0;
        render();
      }
    });
    render();
  }

  /* ================= BESTILLING PÅ MELDING ================= */

  function toast(text) {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = text;
    void el.offsetWidth;
    el.classList.add("is-on");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("is-on"), 2600);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy") ? resolve() : reject();
      } catch (err) {
        reject(err);
      }
      ta.remove();
    });
  }

  function validate(form) {
    let ok = true;
    let first = null;
    $$(".field", form).forEach((field) => {
      const input = $("input, textarea", field);
      if (!input) return;
      let bad = input.required && !input.value.trim();
      if (!bad && input.type === "email" && input.value.trim()) bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      field.classList.toggle("has-error", bad);
      input.setAttribute("aria-invalid", String(bad));
      if (bad) {
        ok = false;
        if (!first) first = input;
      }
    });
    if (first) first.focus();
    return ok;
  }

  const checkout = $("#checkout");
  if (checkout) {
    const form = $("#orderForm");
    const preview = $("#orderText");
    const sendArea = $("[data-send-area]");
    const emptyArea = $("[data-empty-area]");

    function orderText() {
      const v = (name) => (form.elements[name] ? form.elements[name].value.trim() : "");
      const lines = cartLines().map(({ p, qty }) => `- ${qty} x ${p.navn} (${p.ml} ml): ${kr(p.pris * qty)}`);
      const out = ["Hei " + SHOP.navn + "!", "", "Jeg vil gjerne bestille:", ...lines, "", "Sum: " + kr(cartTotal()) + " (frakt kommer i tillegg)", ""];
      out.push("Navn: " + v("navn"));
      if (v("telefon")) out.push("Telefon: " + v("telefon"));
      if (v("epost")) out.push("E-post: " + v("epost"));
      out.push("Leveringsadresse: " + [v("adresse"), [v("postnr"), v("sted")].filter(Boolean).join(" ")].filter(Boolean).join(", "));
      if (v("kommentar")) out.push("", "Kommentar: " + v("kommentar"));
      return out.join("\n").replace(/ /g, " ");
    }

    function refresh() {
      const has = cartCount() > 0;
      sendArea.hidden = !has;
      emptyArea.hidden = has;
      if (has) preview.value = orderText();
    }

    form.addEventListener("input", refresh);
    document.addEventListener("cart:change", refresh);
    refresh();

    $("[data-send-mail]").addEventListener("click", () => {
      if (!validate(form)) return;
      const subject = "Bestilling fra " + form.elements.navn.value.trim();
      window.location.href = "mailto:" + SHOP.epost + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(orderText());
      toast("E-postprogrammet ditt åpnes. Trykk send der.");
    });

    $("[data-copy]").addEventListener("click", () => {
      if (!validate(form)) return;
      copyText(orderText()).then(
        () => toast("Bestillingen er kopiert. Lim den inn i meldingen din."),
        () => toast("Kunne ikke kopiere. Marker teksten og kopier selv.")
      );
    });

    $("[data-clear]").addEventListener("click", () => {
      cart = {};
      saveCart();
    });
  }

  /* ================= KONTAKTSKJEMA ================= */

  const contact = $("#contactForm");
  if (contact) {
    contact.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate(contact)) return;
      const v = (name) => contact.elements[name].value.trim();
      const body = v("melding") + "\n\nHilsen " + v("navn") + (v("epost") ? "\n" + v("epost") : "");
      window.location.href = "mailto:" + SHOP.epost + "?subject=" + encodeURIComponent("Spørsmål fra " + v("navn")) + "&body=" + encodeURIComponent(body);
      toast("E-postprogrammet ditt åpnes. Trykk send der.");
    });
  }

  /* ================= START ================= */

  observeReveals(document);
  renderCartEverywhere();
})();
