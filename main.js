const RM = matchMedia('(prefers-reduced-motion:reduce)').matches,
    MOB = matchMedia('(max-width:700px)').matches;
// procedural "photographs" (troque por /images/*.jpg em produção)
function photo(i) {
    const c = document.createElement('canvas');
    c.width = 480;
    c.height = 600;
    const x = c.getContext('2d'),
        [a, b] = PAL[i % PAL.length];
    let g = x.createLinearGradient(0, 0, 0, 600);
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    x.fillStyle = g;
    x.fillRect(0, 0, 480, 600);
    let r = x.createRadialGradient(140 + i * 40, 190, 10, 140 + i * 40, 190, 260);
    r.addColorStop(0, 'rgba(255,240,210,.55)');
    r.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = r;
    x.fillRect(0, 0, 480, 600);
    x.fillStyle = 'rgba(8,8,8,.85)';
    x.beginPath();
    x.moveTo(0, 600);
    x.lineTo(0, 430 + i * 8);
    for (let k = 0; k <= 8; k++) x.lineTo(k * 60, 400 + Math.sin(k * 1.7 + i) * 50);
    x.lineTo(480, 600);
    x.fill();
    x.beginPath();
    x.ellipse(300 - i * 15, 360, 34, 44, 0, 0, 7);
    x.fillRect(268 - i * 15, 395, 64, 205);
    x.fill();
    const d = x.getImageData(0, 0, 480, 600);
    for (let p = 0; p < d.data.length; p += 4) { const n = (Math.random() - .5) * 26;
        d.data[p] += n;
        d.data[p + 1] += n;
        d.data[p + 2] += n }
    x.putImageData(d, 0, 0);
    return c
}
const pct = document.getElementById('pct');
let done = 0,
    total = IMAGES.length + 1;
const bump = () => { done++;
    pct.textContent = String(Math.round(done / total * 100)).padStart(3, '0') };
const tex = [],
    urls = [];
document.fonts.ready.then(bump);

function make(i) {
    return new Promise(r => {
        const im = new Image();
        im.crossOrigin = 'anonymous';
        const ok = el => { const t = new THREE.Texture(el);
            t.needsUpdate = true;
            tex[i] = t;
            bump();
            r() };
        im.onload = () => { urls[i] = IMAGES[i];
            ok(im) };
        im.onerror = () => { const c = photo(i);
            urls[i] = c.toDataURL('image/jpeg', .8);
            ok(c) }; // fallback se a imagem falhar
        im.src = IMAGES[i]
    })
}
Promise.all(IMAGES.map((_, i) => make(i))).then(start);

function start() {
    gsap.registerPlugin(ScrollTrigger);
    // smooth scroll
    let lenis = null;
    const L = { v: 0 };
    if (!RM) { lenis = new Lenis({ lerp: .09 });
        lenis.on('scroll', e => { ScrollTrigger.update();
            L.v = e.velocity });
        gsap.ticker.add(t => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0) }
    document.querySelectorAll('a[href^="#"]').forEach(a => a.onclick = e => { e.preventDefault(); const t = document.querySelector(a.getAttribute('href'));
        lenis ? lenis.scrollTo(t) : t.scrollIntoView() });
    // 3D world
    const cv = document.getElementById('gl'),
        R = new THREE.WebGLRenderer({ canvas: cv, antialias: !MOB, alpha: true });
    R.setPixelRatio(Math.min(devicePixelRatio, MOB ? 1.5 : 2));
    const S = new THREE.Scene(),
        cam = new THREE.PerspectiveCamera(50, 1, .1, 100);
    cam.position.z = 6;
    const Z = [0, -2.5, -5, -8, -11, -14, -17],
        X = [1.8, -2.2, 2.4, -1.5, 2, -2.4, 0],
        Y = [.2, -.4, .5, -.2, .3, -.5, 0];
    const meshes = Z.map((z, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.75), new THREE.MeshBasicMaterial({ map: tex[i], transparent: true, opacity: .9 }));
        m.position.set(X[i], Y[i], z);
        m.rotation.y = -X[i] * .08;
        S.add(m); return m });
    // poeira de filme
    const N = MOB ? 0 : 260;
    let pts = null;
    if (N) {
        const p = new Float32Array(N * 3).map((_, k) => k % 3 == 2 ? -Math.random() * 22 : (Math.random() - .5) * 12);
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(p, 3));
        pts = new THREE.Points(g, new THREE.PointsMaterial({ size: .025, color: 0xf5f3ee, transparent: true, opacity: .35 }));
        S.add(pts)
    }

    function size() { R.setSize(innerWidth, innerHeight, false);
        cam.aspect = innerWidth / innerHeight;
        cam.updateProjectionMatrix() }
    size();
    addEventListener('resize', size);
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    addEventListener('pointermove', e => { mouse.tx = e.clientX / innerWidth - .5;
        mouse.ty = e.clientY / innerHeight - .5 });
    let vis = true;
    new IntersectionObserver(e => vis = e[0].isIntersecting).observe(document.querySelector('.space'));
    const cs = { z: 0 };
    ScrollTrigger.create({ trigger: '.hero', start: 'top top', endTrigger: '.space', end: 'bottom top', scrub: 1, onUpdate: s => cs.z = s.progress });
    gsap.to(cv, { opacity: .12, scrollTrigger: { trigger: '.mani', start: 'top 80%', end: 'top 20%', scrub: true } });
    let raf;
    const loop = () => {
        raf = requestAnimationFrame(loop);
        if (!vis && cv.style.opacity < .2) return;
        mouse.x += (mouse.tx - mouse.x) * .05;
        mouse.y += (mouse.ty - mouse.y) * .05;
        cam.position.z += ((6 - cs.z * 19) - cam.position.z) * .08;
        cam.position.x = mouse.x * 1.2;
        cam.position.y = -mouse.y * .8;
        cam.lookAt(mouse.x * .5, -mouse.y * .3, cam.position.z - 6);
        meshes.forEach((m, i) => m.position.y = Y[i] + Math.sin(performance.now() / 2000 + i) * .06);
        if (pts) pts.rotation.z += .0003;
        R.render(S, cam)
    };
    loop();
    addEventListener('pagehide', () => { cancelAnimationFrame(raf);
        meshes.forEach(m => { m.geometry.dispose();
            m.material.dispose() });
        tex.forEach(t => t.dispose());
        R.dispose() });
    // conteúdo
    const sl = document.getElementById('sl'),
        pk = document.getElementById('peek');
    SERV.forEach((s, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>0${i+1}</span><b>${s}</b>`;
        li.onmouseenter = () => { pk.style.backgroundImage = `url(${urls[i]})`;
            pk.style.opacity = 1 };
        li.onmouseleave = () => pk.style.opacity = 0;
        sl.append(li)
    });
    const px = { x: 0, y: 0 };
    addEventListener('pointermove', e => { px.x = e.clientX;
        px.y = e.clientY });
    gsap.ticker.add(() => {
        const r = pk.getBoundingClientRect();
        const tx = px.x + 30,
            ty = px.y - 170;
        const cx = r.left + (tx - r.left) * .12,
            cy = r.top + (ty - r.top) * .12;
        pk.style.transform = `translate(${cx}px,${cy}px) rotate(${(tx-r.left)*.02}deg)`;
        pk.style.left = 0;
        pk.style.top = 0
    });
    const tr = document.getElementById('tr');
    PROJ.forEach((p, i) => { tr.insertAdjacentHTML('beforeend', `<article class="pj"><div class="im" style="background-image:url(${urls[i+2]})" role="img" aria-label="Projeto ${p[0]}"></div><h3 class="serif">0${i+1} ${p[0]}</h3><em>${p[1]} — ${p[2]}</em></article>`) });
    document.getElementById('fb').style.backgroundImage = `url(${urls[4]})`;
    // marquee reativo ao scroll
    const m1 = document.getElementById('m1');
    m1.textContent = ('PHOTOGRAPHY — FILM — STORIES — PEOPLE — MOMENTS — ').repeat(6);
    let mx = 0;
    gsap.ticker.add(() => { mx -= 1.2 + Math.abs(L.v) * 1.5; const w = m1.scrollWidth / 2; if (mx < -w) mx += w;
        m1.style.transform = `translateX(${mx}px)` });
    // manifesto palavra a palavra
    const mn = document.getElementById('mn');
    mn.innerHTML = mn.textContent.split(' ').map(w => `<span class="w">${w}</span>`).join('');
    if (!RM) {
        gsap.from('#ht span', { yPercent: 110, opacity: 0, filter: 'blur(12px)', duration: 1.6, stagger: .15, ease: 'power4.out', delay: .3 });
        gsap.to('#ht span', { y: (i) => -40 * (i + 1), letterSpacing: '.08em', opacity: 0, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 20%', scrub: true } });
        gsap.from('.w', { opacity: .05, y: 40, filter: 'blur(10px)', stagger: .12, scrollTrigger: { trigger: '.mani', start: 'top 70%', end: 'bottom 70%', scrub: true } });
        gsap.from('#fb', { scale: 1.3, scrollTrigger: { trigger: '.full', start: 'top bottom', end: 'bottom top', scrub: true } });
        // horizontal pinned
        ScrollTrigger.matchMedia ? .call;
        const dist = () => tr.scrollWidth - innerWidth;
        gsap.to(tr, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.hs', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true } });
        document.querySelectorAll('.pj .im').forEach(el => gsap.from(el, { clipPath: 'inset(0 0 100% 0)', duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
    }
    // reviews
    let ri = 0;
    const qt = document.getElementById('qt'),
        qn = document.getElementById('qn');
    const show = () => { const r = REV[ri];
        gsap.to('.quote>div', { opacity: 0, y: 20, duration: .5, onComplete: () => { qt.textContent = '★★★★★  “' + r[0] + '”';
                qn.textContent = (r[1] + ' — ' + r[2]).toUpperCase();
                gsap.to('.quote>div', { opacity: 1, y: 0, duration: .8 }) } });
        ri = (ri + 1) % REV.length };
    show();
    setInterval(show, 6000);
    // cursor
    const cu = document.getElementById('cur');
    let cx = 0,
        cy = 0,
        sc = 1,
        tsc = 1;
    document.addEventListener('pointerover', e => { const t = e.target;
        tsc = t.closest('.im') ? 4 : t.closest('a,button,li') ? 2.2 : 1 });
    gsap.ticker.add(() => { cx += (px.x - cx) * .2;
        cy += (px.y - cy) * .2;
        sc += (tsc - sc) * .15;
        cu.style.transform = `translate(${cx}px,${cy}px) scale(${sc})` });
    // booking
    const steps = [...document.querySelectorAll('.step')];
    let cur = 0,
        data = {};
    const go = n => { steps[cur].classList.remove('on');
        cur = n;
        steps[cur].classList.add('on');
        gsap.from(steps[cur], { opacity: 0, y: 30, duration: .8 }) };
    ['Portrait', 'Wedding', 'Couple', 'Event', 'Brand', 'Product'].forEach(t => { const b = document.createElement('button');
        b.className = 'opt';
        b.textContent = t.toUpperCase();
        b.onclick = () => { data.t = t;
            go(1) };
        document.getElementById('ty').append(b) });
    document.querySelectorAll('[data-next]').forEach(b => b.onclick = () => go(cur + 1));
    document.getElementById('go').onclick = () => {
        const v = id => document.getElementById(id).value.trim() || '-';
        const msg = `Olá! Gostaria de solicitar um orçamento.\n\nNome: ${v('nm')}\nTelefone: ${v('ph')}\nTipo de sessão: ${data.t||'-'}\nData: ${v('dt')}\nProjeto: ${v('ms')}`;
        window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
    };
    // abertura: sai o loader
    gsap.to('#loader', { opacity: 0, scale: 1.15, filter: 'blur(14px)', duration: 1.4, delay: .4, ease: 'power2.inOut', onComplete: () => document.getElementById('loader').remove() });
}