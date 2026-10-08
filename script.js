const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};

/* ---------- data ---------- */
const LAB = [
  {
    n: '01', name: 'Ubuntu Server', what: 'The foundation · installed manually',
    body: 'I set up the Ubuntu server by hand and I am responsible for the whole local server that hosts the company\'s internal CRM — OS, updates, users, networking, and everything running on top.',
    points: ['Manual install & configuration, no managed hosting involved', 'Single in-house box hosting the CRM and its supporting services', 'Owner of uptime, patching and troubleshooting'],
    code: '$ lsb_release -d\nDescription: Ubuntu Server (self-managed)',
  },
  {
    n: '02', name: 'Coolify', what: 'Self-hosted deployment platform',
    body: 'Coolify gives the server a Heroku/Vercel-style workflow on my own hardware: deploy apps and databases, manage environments and keep services running without hand-written scripts for each one.',
    points: ['Deploys and manages the CRM and supporting services', 'Repeatable deployments instead of one-off server edits', 'Everything stays on infrastructure I control'],
    code: '# apps managed through Coolify\ncrm  ·  garage  ·  garage-ui',
  },
  {
    n: '03', name: 'Garage S3', what: 'S3-compatible object storage',
    body: 'Garage provides S3 buckets on the same server, so the CRM can store files with the same S3 API I use on AWS — without sending data to a third-party cloud.',
    points: ['S3-compatible buckets for CRM files', 'Same SDKs and patterns as AWS S3', 'Data stays on the in-house server'],
    code: '$ aws s3 ls --endpoint-url https://s3.<internal-domain>\n# lists Garage buckets',
  },
  {
    n: '04', name: 'Cloudflare Tunnel', what: 'Secure public routes, no open ports',
    body: 'A Cloudflare Tunnel connects the server outward to Cloudflare, and tunnel routes map hostnames to internal services. The server never needs inbound ports opened to the internet.',
    points: ['Tunnel routes → CRM, Garage UI and other services', 'No port-forwarding or public IP exposure', 'TLS and DNS handled at the Cloudflare edge'],
    code: 'ingress:\n  - hostname: crm.<domain>      → crm\n  - hostname: storage.<domain>  → garage-ui\n  - service: http_status:404',
  },
  {
    n: '05', name: 'Access policies', what: 'Validation at every access point',
    body: 'Every route sits behind a Cloudflare Access application. Requests are validated before they reach the server — humans through an email allow-list, machines through service authentication.',
    points: ['Access points validated per route', 'Service Auth policy for non-human clients', 'Email Allow policy for staff', 'Used an access code to authenticate an AI model for CRM testing'],
    code: 'policy "email-allow"   → include: emails\npolicy "service-auth"  → include: service token',
  },
  {
    n: '06', name: 'Custom Garage UI', what: 'Built by me · SSO-style login',
    body: 'I built my own management UI for Garage with a Cloudflare-SSO-like login experience. It is protected by the same two Access policies, so only approved people and services can manage buckets.',
    points: ['Custom UI for managing Garage buckets', 'Cloudflare SSO-style sign-in flow', 'Service Authentication policy + Email Allow policy'],
    code: 'Garage UI ── Access ──▶ [service-auth | email-allow]',
  },
];

const PROJECTS = [
  {
    cat: ['frontend', 'fullstack'], tag: 'Media · Public site', name: 'Jio Creative Labs',
    sum: 'Immersive marketing site for a Tier 1 media brand.',
    role: 'Full stack developer — frontend animation and CMS-backed content layer.',
    built: 'Advanced GSAP scroll animations, integrated 3D elements and a dynamic CMS-driven content layer, built with UI/UX and Art teams.',
    why: 'Shows production-grade frontend animation craft at scale for a high-visibility brand.',
    stack: 'GSAP · 3D · React · Node.js · CMS', link: ['jiocreativelabs.com', 'https://jiocreativelabs.com'],
  },
  {
    cat: ['fullstack'], tag: 'Semi E-commerce', name: 'Federal App',
    sum: 'Admin and wholesaler platform with real-time order tracking.',
    role: 'Sole owner of development, deployment and the client relationship.',
    built: 'Admin and Wholesaler dashboards, product management, notification system and real-time order tracking using Pusher.',
    why: 'Full ownership from requirements to production on a real client project.',
    stack: 'TypeScript · React.js · Node.js · MySQL · Pusher',
  },
  {
    cat: ['fintech', 'fullstack'], tag: 'Fintech', name: 'Worldnest',
    sum: 'Unlisted shares transaction platform.',
    role: 'Led frontend architecture; co-designed scalable backend APIs.',
    built: 'A transaction platform for unlisted shares, prioritising transaction security, regulatory compliance and a smooth user experience.',
    why: 'Security- and compliance-first product work in a regulated domain.',
    stack: 'React · Node.js · REST APIs · MySQL/MongoDB',
  },
  {
    cat: ['fullstack'], tag: 'Government-linked E-commerce', name: 'Vendor Dashboard (Finnowski)',
    sum: 'Seller dashboard for an e-commerce enablement platform.',
    role: 'Solo full stack developer on a 6-month NDA contract.',
    built: 'Product catalogue management, real-time order tracking and core seller operations, end-to-end.',
    why: 'Delivered a complete platform alone, inside a strict NDA and a fixed timeline.',
    stack: 'Next.js · MUI · Node.js · Express · REST · MySQL',
  },
  {
    cat: ['fullstack'], tag: 'Enterprise · AMC', name: 'TotalEnergies India & ELF India',
    sum: 'Two enterprise Drupal websites on a maintenance retainer.',
    role: 'Independent maintainer working directly with client stakeholders.',
    built: 'Ongoing updates, fixes and technical support delivered promptly for two enterprise-grade sites.',
    why: 'Long-running client trust and responsive support.',
    stack: 'Drupal CMS',
  },
  {
    cat: ['infra'], tag: 'Infrastructure · Internal', name: 'Self-hosted CRM platform',
    sum: 'In-house Ubuntu server hosting the company\'s internal CRM.',
    role: 'Built and run the whole server; also test the CRM on it.',
    built: 'Ubuntu + Coolify + Garage S3 buckets + Cloudflare Tunnel routes, with Access validation, Service Auth and Email Allow policies, and a custom Garage UI with SSO-style login.',
    why: 'Shows I can take infrastructure from bare OS to secured, identity-gated production.',
    stack: 'Ubuntu · Coolify · Garage · Cloudflare Tunnel · Cloudflare Access', link: ['See the architecture', '#homelab'],
  },
  {
    cat: ['infra', 'fullstack'], tag: 'Security & Compliance', name: 'Encrypted data pipelines',
    sum: 'AES-encrypted pipelines with automated purging.',
    role: 'Engineer, Jio Creative Labs (2 NDA-bound apps).',
    built: 'Encrypted storage and automated purge jobs that met data-retention, privacy and regulatory requirements across multiple governance frameworks.',
    why: 'Compliance engineering delivered alongside Security and Compliance teams.',
    stack: 'Node.js · AES · AWS · GCP',
  },
];

/* ---------- basics ---------- */
$('#yr').textContent = new Date().getFullYear();
const nav = $('#nav'), bar = $('#progress');
addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', scrollY > 10);
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
}, { passive: true });

$('#themeBtn').onclick = () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  store.set('theme', next);
};
const burger = $('#burger'), menu = $('#menu');
burger.onclick = () => burger.setAttribute('aria-expanded', menu.classList.toggle('open'));
$$('#menu a').forEach((a) => a.addEventListener('click', () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }));

// active link on scroll
const links = $$('#menu a[href^="#"]');
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach((s) => io.observe(s));

// cursor glow
const glow = $('#glow');
addEventListener('pointermove', (e) => { glow.style.opacity = 1; glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }, { passive: true });

// copy email
$('#copyMail').onclick = async (e) => {
  try { await navigator.clipboard.writeText('sonivatsal3@gmail.com'); e.target.textContent = 'Copied ✓'; }
  catch { e.target.textContent = 'sonivatsal3@gmail.com'; }
  setTimeout(() => (e.target.textContent = 'Copy email'), 2000);
};

/* ---------- typed role ---------- */
const roles = ['immersive GSAP frontends.', 'secure Node.js backends.', 'cloud & self-hosted infra.', 'products, end to end.'];
const typed = $('#typed');
if (reduce) typed.textContent = roles[0];
else {
  let r = 0, c = 0, del = false;
  (function tick() {
    const w = roles[r];
    typed.textContent = w.slice(0, c);
    if (!del && c === w.length) { del = true; return setTimeout(tick, 1600); }
    if (del && c === 0) { del = false; r = (r + 1) % roles.length; }
    c += del ? -1 : 1;
    setTimeout(tick, del ? 28 : 55);
  })();
}

/* ---------- hero terminal ---------- */
const lines = [
  ['c', '$ whoami'], ['', 'vatsal soni — senior full stack developer'], ['m', ''],
  ['c', '$ cat stack.txt'], ['y', 'frontend  '], ['', 'React · Next.js · TypeScript · GSAP'],
  ['y', 'backend   '], ['', 'Node.js · Express · GraphQL · MySQL · MongoDB'],
  ['y', 'cloud     '], ['', 'AWS · GCP · Ubuntu · Coolify · Cloudflare'], ['m', ''],
  ['c', '$ status'], ['', 'running an in-house CRM server ✓'],
];
const out = $('#termOut');
if (reduce) {
  out.innerHTML = lines.map(([k, t]) => `<span class="${k}">${t}</span>`).join('\n');
} else {
  let i = 0, html = '';
  (function next() {
    if (i >= lines.length) return;
    const [k, t] = lines[i++];
    const sameLine = k === 'y';
    html += `<span class="${k}">${t}</span>` + (sameLine ? '' : '\n');
    out.innerHTML = html;
    setTimeout(next, k === 'c' ? 500 : 180);
  })();
}

/* ---------- homelab tabs ---------- */
const tabs = $('#labTabs'), panel = $('#labPanel');
LAB.forEach((l, i) => {
  const li = document.createElement('li');
  li.innerHTML = `<button role="tab" aria-selected="${i === 0}" data-i="${i}"><span>${l.n}</span>${l.name}</button>`;
  tabs.append(li);
});
const showLab = (i) => {
  const l = LAB[i];
  $$('button', tabs).forEach((b, j) => b.setAttribute('aria-selected', j === i));
  panel.innerHTML = `<h3>${l.name}</h3><p class="what mono">${l.what}</p><p>${l.body}</p><ul>${l.points.map((p) => `<li>${p}</li>`).join('')}</ul><pre class="mono">${l.code.replace(/</g, '&lt;')}</pre>`;
  if (window.gsap && !reduce) gsap.from(panel.children, { y: 12, opacity: 0, duration: 0.4, stagger: 0.05 });
};
tabs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) showLab(+b.dataset.i); });
showLab(0);

/* ---------- projects ---------- */
const grid = $('#projGrid');
PROJECTS.forEach((p) => {
  const a = document.createElement('article');
  a.className = 'card proj reveal';
  a.dataset.cat = p.cat.join(' ');
  a.innerHTML = `
    <span class="tag">${p.tag}</span><h3>${p.name}</h3><p>${p.sum}</p>
    <p class="stack mono">${p.stack}</p>
    <div class="more"><div><dl>
      <div><dt>My role</dt><dd>${p.role}</dd></div>
      <div><dt>What I built</dt><dd>${p.built}</dd></div>
      <div><dt>Why it matters</dt><dd>${p.why}</dd></div></dl>
      ${p.link ? `<a class="ext" href="${p.link[1]}" ${p.link[1].startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${p.link[0]} ${p.link[1].startsWith('http') ? '↗' : '↑'}</a>` : ''}
    </div></div>
    <button class="toggle" type="button" aria-expanded="false">Read case study +</button>`;
  grid.append(a);
});
grid.addEventListener('click', (e) => {
  const b = e.target.closest('.toggle'); if (!b) return;
  const card = b.closest('.proj'), open = card.classList.toggle('open');
  b.textContent = open ? 'Close −' : 'Read case study +';
  b.setAttribute('aria-expanded', open);
});
$('#filters').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  $$('#filters button').forEach((x) => x.classList.toggle('on', x === b));
  $$('.proj', grid).forEach((c) => c.classList.toggle('hide', b.dataset.f !== 'all' && !c.dataset.cat.split(' ').includes(b.dataset.f)));
});

/* ---------- particle background ---------- */
(function () {
  const cv = $('#bg'); if (!cv || reduce) return;
  const ctx = cv.getContext('2d'); let w, h, pts;
  const fit = () => {
    w = cv.width = cv.offsetWidth; h = cv.height = cv.offsetHeight;
    pts = Array.from({ length: Math.min(70, Math.floor(w / 18)) }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3 }));
  };
  fit(); addEventListener('resize', fit);
  const col = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#5eead4';
  (function draw() {
    ctx.clearRect(0, 0, w, h); const c = col();
    pts.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.fillStyle = c; ctx.globalAlpha = .6; ctx.fillRect(p.x, p.y, 2, 2);
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 120) { ctx.globalAlpha = (1 - d / 120) * .25; ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
    });
    requestAnimationFrame(draw);
  })();
})();

/* ---------- GSAP (content is visible if it fails to load) ---------- */
if (window.gsap && window.ScrollTrigger && !reduce) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.from('.hero .reveal', { y: 40, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' });
  $$('section:not(.hero) .reveal').forEach((el) => gsap.from(el, {
    y: 36, opacity: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
  }));
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '', o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', onUpdate: () => (el.textContent = Math.round(o.v) + suf), scrollTrigger: { trigger: el, start: 'top 95%', once: true } });
  });
  gsap.from('.diagram .line path', { strokeDasharray: 60, strokeDashoffset: 60, duration: 1, stagger: 0.3, scrollTrigger: { trigger: '.diagram', start: 'top 80%', once: true } });
  gsap.to('.pulse', { attr: { cx: 636 }, duration: 2.4, repeat: -1, ease: 'none', repeatDelay: 0.4 });
}
