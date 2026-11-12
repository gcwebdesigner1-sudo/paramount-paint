(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tabs = document.getElementById("tabs");
  const dock = document.getElementById("dock");
  const hero = document.querySelector(".hero");
  const quote = document.getElementById("quote");
  const rolls = [...document.querySelectorAll("[data-roll]")];
  const drifts = [...document.querySelectorAll("[data-drift]")];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  // Hero load reveal: the wall-colored panel rolls off, then leaves the DOM flow.
  const roll = document.getElementById("roll");
  const doneRoll = () => roll.classList.add("is-done");
  roll.addEventListener("animationend", doneRoll);
  setTimeout(doneRoll, 2000);

  // Quote form drafts a text message to Dylan.
  const form = document.getElementById("qform");
  const isPhone = /Android|iPhone|iPad|iPod/.test(navigator.userAgent);
  if (!isPhone) {
    form.querySelector("button").textContent = "Email my request to Dylan";
    document.getElementById("qnote").textContent = "Tell Dylan what you'd like painted. This drafts an email to him; you hit send.";
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const body = `Hi Dylan, this is ${d.get("name")}${d.get("town") ? " in " + d.get("town") : ""}. I'd like a free quote for: ${d.get("job")}`;
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const href = `sms:+12083560480${ios ? "&" : "?"}body=${encodeURIComponent(body)}`;
    if (isPhone) {
      location.href = href;
    } else {
      location.href = `mailto:paramountco@protonmail.com?subject=${encodeURIComponent("Free quote request")}&body=${encodeURIComponent(body)}`;
    }
  });

  // Highlight the current tab.
  const links = [...tabs.querySelectorAll("ul a")];
  const secs = links.map((a) => document.querySelector(a.getAttribute("href")));
  const io = new IntersectionObserver((ents) => {
    ents.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.removeAttribute("aria-current"));
      const a = links[secs.indexOf(en.target)];
      if (a) a.setAttribute("aria-current", "true");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  secs.forEach((s) => s && io.observe(s));

  // Services: swap the sticky photo on desktop.
  const svcs = [...document.querySelectorAll(".svc")];
  const stage = [...document.querySelectorAll(".services__stage img")];
  const sio = new IntersectionObserver((ents) => {
    ents.forEach((en) => {
      if (!en.isIntersecting) return;
      const k = en.target.dataset.key;
      svcs.forEach((s) => s.classList.toggle("is-on", s === en.target));
      stage.forEach((i) => i.classList.toggle("is-on", i.dataset.key === k));
    });
  }, { rootMargin: "-48% 0px -48% 0px" });
  svcs.forEach((s) => sio.observe(s));

  let ticking = false;
  const frame = () => {
    ticking = false;
    const vh = innerHeight;
    const y = scrollY;
    const hh = hero.offsetHeight;
    tabs.classList.toggle("is-solid", y > hh - 80);
    const q = quote.getBoundingClientRect().top;
    dock.classList.toggle("is-on", y > hh * 0.7 && q > vh * 0.85);
    if (reduce) return;

    if (y < hh * 1.2) hero.style.setProperty("--hp", clamp(y / hh).toFixed(4));

    // Roller reveal: 0 when the photo's top enters the bottom of the screen,
    // 1 once it has travelled ~45% of the viewport. Fully reversible.
    for (const el of rolls) {
      const r = el.getBoundingClientRect();
      if (r.top > vh + 50 || r.bottom < -50) continue;
      const p = clamp((vh - r.top) / (vh * 0.48));
      el.style.setProperty("--p", p.toFixed(4));
    }
    for (const el of drifts) {
      const r = el.parentElement.getBoundingClientRect();
      const c = r.top + r.height / 2 - vh / 2;
      el.style.setProperty("--dp", (c * parseFloat(el.dataset.drift)).toFixed(1));
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  if (!reduce) rolls.forEach((el) => el.style.setProperty("--p", 0));
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  frame();
})();
