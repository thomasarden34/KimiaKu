// ============================================================
// KIMIA KU v2.0 — script_new.js
// ============================================================

// ===== THEME =====
const themeBtn = document.getElementById('themeBtn');
const html = document.documentElement;
function applyTheme(t) {
  html.setAttribute('data-theme', t);
  if (themeBtn) themeBtn.textContent = t === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('kimiaku_theme', t);
}
const savedTheme = localStorage.getItem('kimiaku_theme') || 'dark';
applyTheme(savedTheme);
if (themeBtn) themeBtn.addEventListener('click', () => {
  applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// ===== NAVBAR MOBILE =====
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
  document.querySelectorAll('.nav-menu a').forEach(a => a.addEventListener('click', () => navMenu.classList.remove('open')));
}

// ===== XP SYSTEM =====
const XP_KEY = 'kimiaku_xp';
const BADGES_KEY = 'kimiaku_badges';
let xp = parseInt(localStorage.getItem(XP_KEY) || '0');
let earnedBadges = JSON.parse(localStorage.getItem(BADGES_KEY) || '[]');

function saveXP() { localStorage.setItem(XP_KEY, xp); }
function saveBadges() { localStorage.setItem(BADGES_KEY, JSON.stringify(earnedBadges)); }
function updateXPDisplay() {
  document.querySelectorAll('#xpDisplay').forEach(el => el.textContent = xp + ' XP');
}
updateXPDisplay();

let toastTimeout;
function showXPToast(msg, amount) {
  const toast = document.getElementById('xpToast');
  if (!toast) return;
  toast.textContent = `⚡ +${amount} XP — ${msg}`;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2400);
}

function addXP(amount, reason) {
  xp += amount;
  saveXP();
  updateXPDisplay();
  showXPToast(reason, amount);
  checkBadges();
}

// ===== BADGES =====
const BADGES = [
  { id: 'first_visit', emoji: '👋', name: 'Pendatang Baru', desc: 'Pertama kali membuka KimiaKu', xpNeeded: 0, check: () => true },
  { id: 'xp10',  emoji: '⚡', name: 'Percikan Pertama', desc: 'Kumpulkan 10 XP', xpNeeded: 10, check: () => xp >= 10 },
  { id: 'xp50',  emoji: '🔥', name: 'On Fire!', desc: 'Kumpulkan 50 XP', xpNeeded: 50, check: () => xp >= 50 },
  { id: 'xp100', emoji: '💎', name: 'Kimiawan Muda', desc: 'Kumpulkan 100 XP', xpNeeded: 100, check: () => xp >= 100 },
  { id: 'xp200', emoji: '🏆', name: 'Ahli Kimia', desc: 'Kumpulkan 200 XP', xpNeeded: 200, check: () => xp >= 200 },
  { id: 'quiz1', emoji: '🎯', name: 'Coba-coba', desc: 'Selesaikan kuis pertama', xpNeeded: 0, check: () => xp >= 15 },
  { id: 'perfect', emoji: '⭐', name: 'Sempurna!', desc: 'Nilai 100% di kuis manapun', xpNeeded: 0, manual: true },
  { id: 'data1', emoji: '🔬', name: 'Ilmuwan Cilik', desc: 'Tambahkan 5 data monitoring', xpNeeded: 0, manual: true },
  { id: 'explorer', emoji: '🗺️', name: 'Penjelajah', desc: 'Buka 5 topik berbeda', xpNeeded: 0, manual: true },
];

function checkBadges() {
  BADGES.forEach(b => {
    if (!b.manual && !earnedBadges.includes(b.id) && b.check()) {
      earnedBadges.push(b.id);
      saveBadges();
    }
  });
  renderBadges();
}
checkBadges(); // give first_visit badge

function renderBadges() {
  const grid = document.getElementById('badgesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  BADGES.forEach(b => {
    const earned = earnedBadges.includes(b.id);
    const div = document.createElement('div');
    div.className = 'badge-card' + (earned ? ' earned' : '');
    div.innerHTML = `
      <div class="badge-emoji">${b.emoji}</div>
      <div class="badge-name">${b.name}</div>
      <div class="badge-desc">${b.desc}</div>
      ${!earned ? `<div class="badge-locked">🔒 Terkunci</div>` : '<div style="font-size:.72rem;color:var(--lime);margin-top:4px">✓ Diraih!</div>'}
    `;
    grid.appendChild(div);
  });
}
renderBadges();

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== PARTICLE CANVAS (hero) =====
const particleCanvas = document.getElementById('particleCanvas');
if (particleCanvas) {
  const pc = particleCanvas.getContext('2d');
  let particles = [];
  function resizePC() { particleCanvas.width = particleCanvas.offsetWidth; particleCanvas.height = particleCanvas.offsetHeight; }
  resizePC();
  window.addEventListener('resize', resizePC);
  const SYMBOLS = ['H', 'O', 'C', 'N', 'Na', 'Cl', 'Ca', 'Fe', '+', '−'];
  for (let i = 0; i < 35; i++) {
    particles.push({
      x: Math.random() * particleCanvas.width,
      y: Math.random() * particleCanvas.height,
      vx: (Math.random() - .5) * .4,
      vy: (Math.random() - .5) * .4,
      sym: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      alpha: Math.random() * .35 + .05,
      size: Math.random() * 8 + 9
    });
  }
  function drawParticles() {
    pc.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -20) p.x = particleCanvas.width + 20;
      if (p.x > particleCanvas.width + 20) p.x = -20;
      if (p.y < -20) p.y = particleCanvas.height + 20;
      if (p.y > particleCanvas.height + 20) p.y = -20;
      pc.save();
      pc.globalAlpha = p.alpha;
      pc.fillStyle = '#a3e635';
      pc.font = `700 ${p.size}px monospace`;
      pc.fillText(p.sym, p.x, p.y);
      pc.restore();
    });
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
}

// ===== QUIZ DATA =====
const HOME_QUIZ = [
  { q: 'Partikel terkecil penyusun unsur kimia disebut...', opts: ['Molekul','Atom','Ion','Elektron'], ans: 1, exp: 'Atom adalah partikel terkecil suatu unsur yang masih memiliki sifat unsur tersebut.' },
  { q: 'Berapa pH larutan netral pada suhu 25°C?', opts: ['0','1','7','14'], ans: 2, exp: 'Larutan netral memiliki pH = 7. Asam < 7, basa > 7.' },
  { q: 'Reaksi yang melepaskan kalor ke lingkungan disebut...', opts: ['Endoterm','Eksoterm','Spontan','Reversibel'], ans: 1, exp: 'Reaksi eksoterm melepaskan kalor (ΔH negatif). Contoh: pembakaran.' },
  { q: 'Apa yang terjadi pada laju reaksi jika suhu dinaikkan?', opts: ['Turun','Tetap','Naik','Tidak bisa ditentukan'], ans: 2, exp: 'Kenaikan suhu meningkatkan energi kinetik partikel sehingga tumbukan lebih sering dan efektif → laju naik.' },
  { q: 'Sifat larutan buffer adalah...', opts: ['pH berubah drastis jika ditambah air','pH stabil walau ditambah sedikit asam/basa','Tidak bisa dibuat di lab','Selalu bersifat netral'], ans: 1, exp: 'Buffer mempertahankan pH terhadap penambahan sedikit asam atau basa.' },
];

const TOPIC_QUIZZES = {
  Stoikiometri: [
    { q: 'Mol adalah satuan untuk...', opts: ['Massa','Jumlah partikel','Volume','Energi'], ans: 1, exp: '1 mol = 6,02×10²³ partikel (bilangan Avogadro).' },
    { q: '2 gram H₂ (Mr=2) setara dengan berapa mol?', opts: ['0,5','1','2','4'], ans: 1, exp: 'n = massa/Mr = 2/2 = 1 mol.' },
    { q: 'Reaktan pembatas adalah...', opts: ['Reaktan yang tersisa','Reaktan yang habis duluan','Reaktan yang paling banyak','Reaktan yang tidak bereaksi'], ans: 1, exp: 'Reaktan pembatas adalah reaktan yang habis lebih dahulu, menentukan jumlah produk.' },
    { q: 'Persen yield = (hasil aktual / hasil teoritis) × ...', opts: ['10','100','1000','1'], ans: 1, exp: 'Persen yield = (hasil aktual / hasil teoritis) × 100%.' },
    { q: 'Koefisien reaksi menunjukkan...', opts: ['Massa zat','Perbandingan mol zat','Energi reaksi','Kecepatan reaksi'], ans: 1, exp: 'Koefisien reaksi menunjukkan perbandingan jumlah mol tiap zat dalam reaksi.' },
  ],
  'Ikatan Kimia': [
    { q: 'Ikatan yang terbentuk akibat serah terima elektron disebut...', opts: ['Kovalen','Ionik','Logam','Hidrogen'], ans: 1, exp: 'Ikatan ionik: atom melepas/menerima elektron membentuk ion positif dan negatif.' },
    { q: 'Bentuk molekul H₂O adalah...', opts: ['Linear','Trigonal planar','Bengkok (V-shape)','Tetrahedral'], ans: 2, exp: 'H₂O bengkok karena ada 2 pasang elektron bebas pada O, mendorong H–O–H lebih kecil dari 109,5°.' },
    { q: 'Gaya antarmolekul paling kuat adalah...', opts: ['Van der Waals','Dipol-dipol','Ikatan hidrogen','Dispersi London'], ans: 2, exp: 'Ikatan hidrogen paling kuat di antara gaya antarmolekul, terjadi pada N–H, O–H, F–H.' },
    { q: 'Senyawa kovalen nonpolar memiliki...', opts: ['Perbedaan elektronegativitas besar','Muatan dipol nol','Ikatan ion','Titik didih tinggi'], ans: 1, exp: 'Senyawa kovalen nonpolar: distribusi muatan simetris, momen dipol = 0.' },
  ],
  Termokimia: [
    { q: 'ΔH reaksi eksoterm bernilai...', opts: ['Positif','Nol','Negatif','Bergantung tekanan'], ans: 2, exp: 'Eksoterm: kalor dilepaskan ke lingkungan → ΔH < 0 (negatif).' },
    { q: 'Kalorimeter digunakan untuk mengukur...', opts: ['Laju reaksi','Kalor reaksi','pH larutan','Titik lebur'], ans: 1, exp: 'Kalorimeter mengukur kalor yang diserap/dilepaskan selama reaksi.' },
    { q: 'Hukum Hess menyatakan bahwa...', opts: ['Energi tidak dapat diciptakan','ΔH tidak bergantung jalur reaksi','Entropi selalu bertambah','Kesetimbangan selalu tercapai'], ans: 1, exp: 'Hukum Hess: ΔH total reaksi tidak bergantung jalur, hanya keadaan awal dan akhir.' },
    { q: 'Entalpi pembentukan standar (ΔHf°) unsur bebas bernilai...', opts: ['+1','−1','Bergantung suhu','0'], ans: 3, exp: 'ΔHf° unsur dalam bentuk standarnya = 0 (misalnya ΔHf° O₂ = 0).' },
  ],
  'Laju Reaksi': [
    { q: 'Katalis memengaruhi reaksi dengan...', opts: ['Meningkatkan suhu','Menurunkan energi aktivasi','Menambah reaktan','Mengurangi produk'], ans: 1, exp: 'Katalis menyediakan jalur reaksi berbeda dengan energi aktivasi lebih rendah.' },
    { q: 'Orde reaksi total ditentukan dari...', opts: ['Koefisien reaksi','Hasil eksperimen','Massa reaktan','Suhu reaksi'], ans: 1, exp: 'Orde reaksi ditentukan secara eksperimental, bukan dari koefisien stoikiometri.' },
    { q: 'Laju reaksi meningkat jika luas permukaan...', opts: ['Berkurang','Bertambah','Tetap','Tidak berpengaruh'], ans: 1, exp: 'Luas permukaan lebih besar → lebih banyak tumbukan efektif → laju meningkat.' },
    { q: 'Satuan laju reaksi adalah...', opts: ['mol','L/s','mol/L·s','kJ/mol'], ans: 2, exp: 'Laju reaksi = perubahan konsentrasi per satuan waktu: mol/L·s atau M/s.' },
  ],
  Kesetimbangan: [
    { q: 'Jika Kc > 1, reaksi lebih condong ke...', opts: ['Reaktan','Produk','Tidak bisa ditentukan','Kiri'], ans: 1, exp: 'Kc > 1: konsentrasi produk lebih besar dari reaktan pada kesetimbangan.' },
    { q: 'Prinsip Le Chatelier menyatakan bahwa sistem akan...', opts: ['Diam jika diganggu','Bergeser mengurangi gangguan','Meledak jika tekanan naik','Membentuk katalis'], ans: 1, exp: 'Sistem dalam kesetimbangan akan bergeser untuk mengurangi efek gangguan dari luar.' },
    { q: 'Pada reaksi N₂ + 3H₂ ⇌ 2NH₃, penambahan N₂ akan menggeser kesetimbangan ke...', opts: ['Kiri','Kanan','Tidak bergeser','Bergantung suhu'], ans: 1, exp: 'Penambahan N₂ (reaktan) → sistem bergeser kanan untuk mengurangi kelebihan N₂.' },
  ],
  'Asam Basa': [
    { q: 'Teori asam-basa Bronsted-Lowry: asam adalah...', opts: ['Pendonor proton (H⁺)','Penerima elektron','Pendonor OH⁻','Zat yang ionisasi sempurna'], ans: 0, exp: 'Bronsted-Lowry: asam = donor proton (H⁺), basa = akseptor proton.' },
    { q: '[H⁺] = 10⁻³ mol/L berarti pH = ...', opts: ['3','−3','11','0,001'], ans: 0, exp: 'pH = −log[H⁺] = −log(10⁻³) = 3.' },
    { q: 'Asam kuat terionisasi...', opts: ['Sebagian','Sempurna','Tidak sama sekali','Bergantung suhu'], ans: 1, exp: 'Asam kuat (HCl, H₂SO₄, HNO₃, dsb.) terionisasi sempurna dalam air.' },
    { q: 'pOH = 4 berarti pH = ...', opts: ['4','10','−4','0,4'], ans: 1, exp: 'pH + pOH = 14 → pH = 14 − 4 = 10 (larutan basa).' },
  ],
  Hidrolisis: [
    { q: 'Garam CH₃COONa dalam air bersifat...', opts: ['Asam','Basa','Netral','Tergantung konsentrasi'], ans: 1, exp: 'CH₃COO⁻ (dari asam lemah) terhidrolisis → larutan bersifat basa.' },
    { q: 'Garam dari asam kuat dan basa kuat bersifat...', opts: ['Asam','Basa','Netral','Bergantung suhu'], ans: 2, exp: 'Contoh: NaCl. Kation Na⁺ dan anion Cl⁻ tidak terhidrolisis → pH = 7.' },
    { q: 'Hidrolisis garam terjadi pada garam yang berasal dari...', opts: ['Asam kuat + basa kuat saja','Asam/basa lemah','Semua garam','Hanya asam kuat'], ans: 1, exp: 'Hidrolisis terjadi jika garam berasal dari asam lemah dan/atau basa lemah.' },
  ],
  Buffer: [
    { q: 'Buffer asam terdiri dari...', opts: ['Basa kuat + garamnya','Asam lemah + garamnya','Dua asam kuat','Air + garam'], ans: 1, exp: 'Buffer asam: asam lemah (misal CH₃COOH) + garamnya (misal CH₃COONa).' },
    { q: 'Persamaan Henderson-Hasselbalch: pH = pKa + log...', opts: ['[asam]/[basa]','[basa]/[asam]','[H⁺]','[OH⁻]'], ans: 1, exp: 'pH = pKa + log([basa konjugat]/[asam lemah]).' },
    { q: 'Buffer darah menggunakan pasangan...', opts: ['NaCl/HCl','H₂CO₃/HCO₃⁻','NaOH/Na₂O','HNO₃/NO₃⁻'], ans: 1, exp: 'Buffer darah: H₂CO₃ (asam lemah) dan HCO₃⁻ (basa konjugatnya). pH ≈ 7,4.' },
  ],
  Titrasi: [
    { q: 'Titik ekuivalen adalah saat...', opts: ['Indikator berubah warna','Mol asam = mol basa','Larutan berwarna merah','pH = 7'], ans: 1, exp: 'Titik ekuivalen: mol asam tepat sama dengan mol basa (sesuai stoikiometri).' },
    { q: 'Rumus titrasi sederhana: M₁V₁ = M₂V₂. M adalah...', opts: ['Massa (gram)','Molaritas (mol/L)','Mol total','Suhu'], ans: 1, exp: 'M = molaritas = konsentrasi dalam mol/L. V = volume larutan.' },
    { q: 'Indikator fenolftalein berubah dari tidak berwarna menjadi merah muda pada...', opts: ['pH < 7','pH 7–9','pH > 8','pH = 0'], ans: 2, exp: 'Fenolftalein berubah warna pada pH 8,2–10,0 (merah muda/ungu di suasana basa).' },
  ],
  'Kelarutan & Koloid': [
    { q: 'Ksp AgCl kecil berarti AgCl...', opts: ['Mudah larut','Sulit larut','Tidak ada','Netral'], ans: 1, exp: 'Ksp kecil → kelarutan kecil → zat sulit larut (seperti AgCl berwarna putih).' },
    { q: 'Efek Tyndall adalah...', opts: ['Pemantulan cahaya oleh ion','Hamburan cahaya oleh partikel koloid','Penyerapan panas','Pengendapan koloid'], ans: 1, exp: 'Efek Tyndall: berkas cahaya terlihat saat melewati koloid, karena partikel koloid menghamburkan cahaya.' },
    { q: 'Gerak Brown pada koloid disebabkan oleh...', opts: ['Gravitasi','Tumbukan molekul medium dengan partikel koloid','Arus listrik','Suhu tinggi'], ans: 1, exp: 'Gerak Brown: gerakan acak partikel koloid akibat tumbukan molekul-molekul medium dari segala arah.' },
  ],
};

// ===== HOME QUIZ =====
let hqIndex = 0, hqScore = 0, hqAnswered = false;
const hqQ = document.getElementById('hqQ');
const hqOptions = document.getElementById('hqOptions');
const hqFeedback = document.getElementById('hqFeedback');
const hqNext = document.getElementById('hqNext');
const hqLabel = document.getElementById('hqLabel');
const hqScoreEl = document.getElementById('hqScore');
const hqProgressFill = document.getElementById('hqProgressFill');
const hqScoreScreen = document.getElementById('hqScore-screen');

function renderHQ() {
  if (!hqQ) return;
  if (hqIndex >= HOME_QUIZ.length) { showHQResult(); return; }
  const q = HOME_QUIZ[hqIndex];
  hqQ.textContent = q.q;
  hqOptions.innerHTML = '';
  hqFeedback.style.display = 'none';
  if (hqNext) hqNext.style.display = 'none';
  hqAnswered = false;
  if (hqLabel) hqLabel.textContent = `Soal ${hqIndex + 1} / ${HOME_QUIZ.length}`;
  if (hqProgressFill) hqProgressFill.style.width = (hqIndex / HOME_QUIZ.length * 100) + '%';
  q.opts.forEach((o, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option'; btn.textContent = o;
    btn.addEventListener('click', () => answerHQ(i, btn, q));
    hqOptions.appendChild(btn);
  });
}

function answerHQ(i, btn, q) {
  if (hqAnswered) return;
  hqAnswered = true;
  document.querySelectorAll('#hqOptions .quiz-option').forEach(b => b.disabled = true);
  if (i === q.ans) {
    btn.classList.add('correct');
    hqScore++;
    hqFeedback.textContent = '✓ Benar! ' + q.exp;
    hqFeedback.className = 'quiz-feedback correct';
    addXP(5, 'Jawaban benar!');
  } else {
    btn.classList.add('wrong');
    hqOptions.querySelectorAll('.quiz-option')[q.ans].classList.add('correct');
    hqFeedback.textContent = '✗ Kurang tepat. ' + q.exp;
    hqFeedback.className = 'quiz-feedback wrong';
  }
  hqFeedback.style.display = 'block';
  if (hqScoreEl) hqScoreEl.textContent = 'Skor: ' + hqScore;
  if (hqNext) hqNext.style.display = 'flex';
}

function showHQResult() {
  if (hqScoreScreen) {
    document.getElementById('hqBody').style.display = 'none';
    hqScoreScreen.style.display = 'block';
    const final = document.getElementById('hqFinalScore');
    if (final) final.textContent = hqScore;
    const verdict = document.getElementById('hqVerdict');
    const verdicts = ['Terus semangat belajar! 💪', 'Lumayan, tambah latihan yuk!', 'Bagus! Hampir sempurna 👍', 'Hebat! Nilai sempurna 🌟'];
    if (verdict) verdict.textContent = verdicts[Math.min(Math.floor(hqScore / HOME_QUIZ.length * 3.99), 3)];
    const xpEarned = hqScore * 5 + (hqScore === HOME_QUIZ.length ? 20 : 0);
    const xpEl = document.getElementById('hqXpEarned');
    if (xpEl) xpEl.textContent = xpEarned + ' XP';
    if (hqScore === HOME_QUIZ.length) {
      if (!earnedBadges.includes('perfect')) { earnedBadges.push('perfect'); saveBadges(); }
    }
    if (hqProgressFill) hqProgressFill.style.width = '100%';
  }
}

if (hqNext) hqNext.addEventListener('click', () => { hqIndex++; renderHQ(); });
const hqRestart = document.getElementById('hqRestart');
if (hqRestart) hqRestart.addEventListener('click', () => {
  hqIndex = 0; hqScore = 0;
  if (hqScoreScreen) hqScoreScreen.style.display = 'none';
  const hqBody = document.getElementById('hqBody');
  if (hqBody) hqBody.style.display = 'block';
  if (hqScoreEl) hqScoreEl.textContent = 'Skor: 0';
  renderHQ();
});
renderHQ();

// ===== MATERI PAGE =====
const TOPICS_S1 = [
  { id: 'Stoikiometri', icon: '⚖️', sem: 'Semester 1', desc: 'Perhitungan kuantitatif reaktan dan produk.', body: `
    <div class="pill">Yang Dipelajari</div>
    <ul><li>Konsep mol, massa molar, bilangan Avogadro</li><li>Reaktan pembatas &amp; persen yield</li><li>Perbandingan koefisien reaksi</li></ul>
    <div class="formula-box">n = m / Mr&nbsp;&nbsp;|&nbsp;&nbsp;N = n × 6,02×10²³</div>
    <p style="font-size:.9rem;color:var(--sub)">Stoikiometri adalah "timbangan" dalam kimia — mengukur berapa banyak zat yang bereaksi dan terbentuk.</p>
  ` },
  { id: 'Ikatan Kimia', icon: '🔗', sem: 'Semester 1', desc: 'Kovalen, ionik, logam, dan gaya antarmolekul.', body: `
    <div class="pill">Yang Dipelajari</div>
    <ul><li>Ikatan ionik vs kovalen (polar/nonpolar)</li><li>Struktur Lewis &amp; bentuk molekul (VSEPR)</li><li>Gaya antarmolekul &amp; pengaruh titik didih</li></ul>
    <div class="formula-box">ΔEN besar → ikatan ionik&nbsp;|&nbsp;ΔEN kecil → kovalen</div>
  ` },
  { id: 'Termokimia', icon: '🔥', sem: 'Semester 1', desc: 'Energi dalam reaksi: entalpi, kalor, Hukum Hess.', body: `
    <div class="pill">Yang Dipelajari</div>
    <ul><li>Eksoterm (ΔH < 0) vs endoterm (ΔH > 0)</li><li>Kalorimetri sederhana</li><li>Hukum Hess &amp; diagram energi</li></ul>
    <div class="formula-box">q = m × c × ΔT&nbsp;&nbsp;|&nbsp;&nbsp;ΔH = H_produk − H_reaktan</div>
  ` },
  { id: 'Laju Reaksi', icon: '⏱️', sem: 'Semester 1', desc: 'Faktor laju reaksi, hukum laju, mekanisme.', body: `
    <div class="pill">Yang Dipelajari</div>
    <ul><li>Faktor: konsentrasi, suhu, luas permukaan, katalis</li><li>Orde reaksi &amp; grafik laju</li><li>Energi aktivasi &amp; teori tumbukan</li></ul>
    <div class="formula-box">v = k[A]ᵐ[B]ⁿ</div>
  ` },
  { id: 'Kesetimbangan', icon: '⚖️', sem: 'Semester 1', desc: 'Kc, Kp, prinsip Le Chatelier.', body: `
    <div class="pill">Yang Dipelajari</div>
    <ul><li>Menghitung Kc/Kp</li><li>Q vs K: arah pergeseran reaksi</li><li>Le Chatelier: tekanan, suhu, konsentrasi</li></ul>
    <div class="formula-box">Kc = [produk]^koef / [reaktan]^koef</div>
  ` },
];
const TOPICS_S2 = [
  { id: 'Asam Basa', icon: '🧪', sem: 'Semester 2', desc: 'pH, pOH, Ka, Kb, asam kuat vs lemah.', body: `
    <div class="pill">Yang Dipelajari</div>
    <ul><li>Skala pH/pOH &amp; Kw</li><li>Asam/basa kuat vs lemah (Ka/Kb)</li><li>Perhitungan pH larutan</li></ul>
    <div class="formula-box">pH = −log[H⁺]&nbsp;&nbsp;|&nbsp;&nbsp;pH + pOH = 14</div>
  ` },
  { id: 'Hidrolisis', icon: '💧', sem: 'Semester 2', desc: 'Perilaku garam dalam air, sifat asam/basa garam.', body: `
    <div class="pill">Yang Dipelajari</div>
    <ul><li>Mengapa larutan garam bisa asam/basa</li><li>Garam dari asam lemah/basa lemah</li><li>Perkiraan pH larutan garam</li></ul>
    <div class="formula-box">Garam asam lemah + basa kuat → larutan basa</div>
  ` },
  { id: 'Buffer', icon: '🛡️', sem: 'Semester 2', desc: 'Henderson-Hasselbalch, kapasitas buffer.', body: `
    <div class="pill">Yang Dipelajari</div>
    <ul><li>Komponen buffer: asam lemah + garamnya</li><li>Henderson–Hasselbalch</li><li>Respons buffer terhadap asam/basa</li></ul>
    <div class="formula-box">pH = pKa + log([A⁻]/[HA])</div>
  ` },
  { id: 'Titrasi', icon: '🔬', sem: 'Semester 2', desc: 'Titik ekuivalen, indikator, kurva titrasi.', body: `
    <div class="pill">Yang Dipelajari</div>
    <ul><li>Titik ekuivalen vs titik akhir</li><li>Kurva titrasi asam-basa</li><li>Perhitungan M₁V₁ = M₂V₂</li></ul>
    <div class="formula-box">M₁V₁ = M₂V₂</div>
  ` },
  { id: 'Kelarutan & Koloid', icon: '🌊', sem: 'Semester 2', desc: 'Ksp, efek ion sejenis, sifat koloid.', body: `
    <div class="pill">Yang Dipelajari</div>
    <ul><li>Konsep Ksp &amp; hubungan dengan kelarutan</li><li>Pengaruh ion sejenis &amp; pH</li><li>Efek Tyndall, gerak Brown, koagulasi</li></ul>
    <div class="formula-box">Ksp = [A⁺]ⁿ × [B⁻]ᵐ</div>
  ` },
];

let openedTopics = JSON.parse(localStorage.getItem('kimiaku_opened') || '[]');

function renderTopics(topics, gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = '';
  topics.forEach(t => {
    const done = openedTopics.includes(t.id);
    const card = document.createElement('article');
    card.className = 'topic-card reveal' + (done ? ' done' : '');
    card.innerHTML = `
      <span class="topic-badge ${done ? 'done-badge' : ''}">${done ? '✓ Dibuka' : '+10 XP'}</span>
      <div class="topic-icon">${t.icon}</div>
      <h3>${t.id}</h3>
      <p>${t.desc}</p>
      <div class="topic-xp">⚡ ${done ? 'Selesai' : '10 XP'}</div>
      <div class="topic-progress"><div class="topic-progress-fill" style="width:${done ? 100 : 0}%"></div></div>
    `;
    card.addEventListener('click', () => openTopicModal(t));
    revealObserver.observe(card);
    grid.appendChild(card);
  });
}

function openTopicModal(t) {
  const modal = document.getElementById('topicModal');
  if (!modal) return;
  document.getElementById('modalTag').textContent = t.sem;
  document.getElementById('modalTitle').textContent = t.id;
  document.getElementById('modalDesc').textContent = t.desc;
  document.getElementById('modalBody').innerHTML = t.body;
  const extLink = document.getElementById('modalExtLink');
  if (extLink) extLink.href = 'https://drive.google.com/drive/folders/1ct5vHU8MVCa3RY3gP8UdF1XVIxuZIq5L';
  const quizBtn = document.getElementById('modalQuizBtn');
  if (quizBtn) {
    quizBtn.onclick = () => {
      closeModal('topicModal');
      openQuizModal(t.id);
    };
  }
  modal.classList.add('open');
  // XP for opening
  if (!openedTopics.includes(t.id)) {
    openedTopics.push(t.id);
    localStorage.setItem('kimiaku_opened', JSON.stringify(openedTopics));
    addXP(10, 'Topik baru dibuka!');
    if (openedTopics.length >= 5 && !earnedBadges.includes('explorer')) {
      earnedBadges.push('explorer'); saveBadges();
    }
    renderTopics(TOPICS_S1, 'topicsGrid1');
    renderTopics(TOPICS_S2, 'topicsGrid2');
  }
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}

const modalClose = document.getElementById('modalClose');
if (modalClose) modalClose.addEventListener('click', () => closeModal('topicModal'));
document.getElementById('topicModal')?.addEventListener('click', e => { if (e.target.id === 'topicModal') closeModal('topicModal'); });

// Semester tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
    const panel = document.getElementById(btn.dataset.tab);
    if (panel) panel.style.display = 'block';
  });
});

renderTopics(TOPICS_S1, 'topicsGrid1');
renderTopics(TOPICS_S2, 'topicsGrid2');

// ===== TOPIC QUIZ MODAL =====
let qmIndex = 0, qmScore = 0, qmAnswered = false, qmQs = [];

function openQuizModal(topicId) {
  const qs = TOPIC_QUIZZES[topicId];
  if (!qs || !qs.length) { alert('Kuis untuk topik ini belum tersedia.'); return; }
  qmQs = qs; qmIndex = 0; qmScore = 0;
  const modal = document.getElementById('quizModal');
  if (!modal) return;
  document.getElementById('qmTag').textContent = 'Kuis';
  document.getElementById('qmTitle').textContent = topicId;
  document.getElementById('qmTotal').textContent = '/ ' + qs.length;
  document.getElementById('qmScoreScreen').style.display = 'none';
  document.getElementById('quizModalBody').style.display = 'block';
  document.getElementById('qmScore').textContent = 'Skor: 0';
  modal.classList.add('open');
  renderQM();
}

function renderQM() {
  if (qmIndex >= qmQs.length) { showQMResult(); return; }
  const q = qmQs[qmIndex];
  document.getElementById('qmQ').textContent = q.q;
  document.getElementById('qmLabel').textContent = `Soal ${qmIndex + 1} / ${qmQs.length}`;
  document.getElementById('qmProgress').style.width = (qmIndex / qmQs.length * 100) + '%';
  document.getElementById('qmFeedback').style.display = 'none';
  document.getElementById('qmNext').style.display = 'none';
  qmAnswered = false;
  const opts = document.getElementById('qmOptions');
  opts.innerHTML = '';
  q.opts.forEach((o, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option'; btn.textContent = o;
    btn.addEventListener('click', () => answerQM(i, btn, q));
    opts.appendChild(btn);
  });
}

function answerQM(i, btn, q) {
  if (qmAnswered) return;
  qmAnswered = true;
  document.querySelectorAll('#qmOptions .quiz-option').forEach(b => b.disabled = true);
  const fb = document.getElementById('qmFeedback');
  if (i === q.ans) {
    btn.classList.add('correct'); qmScore++;
    fb.textContent = '✓ Benar! ' + q.exp; fb.className = 'quiz-feedback correct';
    addXP(8, 'Jawaban benar!');
  } else {
    btn.classList.add('wrong');
    document.querySelectorAll('#qmOptions .quiz-option')[q.ans].classList.add('correct');
    fb.textContent = '✗ ' + q.exp; fb.className = 'quiz-feedback wrong';
  }
  fb.style.display = 'block';
  document.getElementById('qmScore').textContent = 'Skor: ' + qmScore;
  document.getElementById('qmNext').style.display = 'flex';
}

function showQMResult() {
  document.getElementById('quizModalBody').style.display = 'none';
  const ss = document.getElementById('qmScoreScreen');
  ss.style.display = 'block';
  document.getElementById('qmFinalScore').textContent = qmScore;
  const pct = qmScore / qmQs.length;
  const verdicts = ['Semangat belajar lagi! 💪','Cukup bagus, terus latihan!','Hampir sempurna! 👍','Nilai sempurna! 🌟'];
  document.getElementById('qmVerdict').textContent = verdicts[Math.min(Math.floor(pct * 3.99), 3)];
  const bonus = pct === 1 ? 30 : pct >= 0.8 ? 20 : pct >= 0.5 ? 10 : 0;
  document.getElementById('qmXp').textContent = (qmScore * 8 + bonus) + ' XP';
  if (pct === 1 && !earnedBadges.includes('perfect')) { earnedBadges.push('perfect'); saveBadges(); }
  document.getElementById('qmProgress').style.width = '100%';
}

document.getElementById('qmNext')?.addEventListener('click', () => { qmIndex++; renderQM(); });
document.getElementById('qmRestart')?.addEventListener('click', () => {
  qmIndex = 0; qmScore = 0;
  document.getElementById('qmScoreScreen').style.display = 'none';
  document.getElementById('quizModalBody').style.display = 'block';
  document.getElementById('qmScore').textContent = 'Skor: 0';
  renderQM();
});
document.getElementById('qmClose2')?.addEventListener('click', () => closeModal('quizModal'));
document.getElementById('quizModalClose')?.addEventListener('click', () => closeModal('quizModal'));
document.getElementById('quizModal')?.addEventListener('click', e => { if (e.target.id === 'quizModal') closeModal('quizModal'); });

// ===== CALCULATOR (monitoring page) =====
// Tabs
document.querySelectorAll('.calc-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.calc-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.calc-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(btn.dataset.panel);
    if (panel) panel.classList.add('active');
  });
});

// pH calc
document.getElementById('calcPHBtn')?.addEventListener('click', () => {
  const hVal = parseFloat(document.getElementById('calcHInput')?.value);
  const pVal = parseFloat(document.getElementById('calcPHInput')?.value);
  const res = document.getElementById('calcPHResult');
  const val = document.getElementById('calcPHVal');
  const det = document.getElementById('calcPHDetail');
  if (!res || !val || !det) return;
  res.style.display = 'block';
  if (!isNaN(hVal) && hVal > 0) {
    const pH = -Math.log10(hVal);
    val.textContent = 'pH = ' + pH.toFixed(2);
    det.textContent = `Dari [H⁺] = ${hVal} mol/L → pH = −log(${hVal}) = ${pH.toFixed(2)}. Larutan bersifat ${pH < 7 ? 'asam' : pH > 7 ? 'basa' : 'netral'}.`;
  } else if (!isNaN(pVal) && pVal >= 0 && pVal <= 14) {
    const h = Math.pow(10, -pVal);
    val.textContent = '[H⁺] = ' + h.toExponential(2) + ' mol/L';
    det.textContent = `Dari pH = ${pVal} → [H⁺] = 10^−${pVal} = ${h.toExponential(2)} mol/L.`;
  } else {
    val.textContent = 'Input tidak valid';
    det.textContent = 'Masukkan nilai [H⁺] > 0 atau pH antara 0–14.';
  }
  addXP(3, 'Kalkulator pH digunakan');
});

// Mol calc
document.getElementById('calcMolBtn')?.addEventListener('click', () => {
  const m = parseFloat(document.getElementById('massInput')?.value);
  const mr = parseFloat(document.getElementById('molarInput')?.value);
  const res = document.getElementById('calcMolResult');
  const val = document.getElementById('calcMolVal');
  const det = document.getElementById('calcMolDetail');
  if (!res || !val || !det) return;
  res.style.display = 'block';
  if (!isNaN(m) && !isNaN(mr) && mr > 0) {
    const mol = m / mr;
    val.textContent = mol.toFixed(4) + ' mol';
    det.textContent = `n = ${m} g ÷ ${mr} g/mol = ${mol.toFixed(4)} mol. Jumlah partikel = ${(mol * 6.022e23).toExponential(3)}.`;
  } else { val.textContent = 'Input tidak valid'; det.textContent = 'Pastikan massa dan massa molar terisi dan > 0.'; }
  addXP(3, 'Kalkulator mol digunakan');
});

// Stoikiometri/pengenceran calc
document.getElementById('calcStoiBtn')?.addEventListener('click', () => {
  const m1 = parseFloat(document.getElementById('m1Input')?.value);
  const v1 = parseFloat(document.getElementById('v1Input')?.value);
  const v2 = parseFloat(document.getElementById('v2Input')?.value);
  const res = document.getElementById('calcStoiResult');
  const val = document.getElementById('calcStoiVal');
  const det = document.getElementById('calcStoiDetail');
  if (!res || !val || !det) return;
  res.style.display = 'block';
  if (!isNaN(m1) && !isNaN(v1) && !isNaN(v2) && v2 > 0) {
    const m2 = (m1 * v1) / v2;
    val.textContent = m2.toFixed(4) + ' mol/L';
    det.textContent = `M₂ = (M₁ × V₁) / V₂ = (${m1} × ${v1}) / ${v2} = ${m2.toFixed(4)} mol/L.`;
  } else { val.textContent = 'Input tidak valid'; det.textContent = 'Pastikan semua nilai terisi dan V₂ > 0.'; }
  addXP(3, 'Kalkulator pengenceran digunakan');
});

// ===== MONITORING =====
if (document.getElementById('monitor-app')) {
  const STORAGE_KEY = 'kimia_readings_v2';
  let readings = [];
  try { readings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch(e) { readings = []; }

  const phInput = document.getElementById('phInput');
  const tempInput = document.getElementById('tempInput');
  const colorInput = document.getElementById('colorInput');
  const noteInput = document.getElementById('noteInput');
  const tableBody = document.querySelector('#readingsTable tbody');
  const chartCanvas = document.getElementById('chartCanvas');

  function escapeCSV(v) {
    const s = String(v ?? '');
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
  }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(readings)); }

  function addReading() {
    const ph = parseFloat(phInput?.value);
    const temp = parseFloat(tempInput?.value);
    if (isNaN(ph) || ph < 0 || ph > 14) { alert('pH harus antara 0 dan 14.'); return; }
    if (isNaN(temp)) { alert('Suhu harus diisi.'); return; }
    readings.push({ ts: new Date().toISOString(), ph, temp, color: colorInput?.value || '#22d3ee', note: noteInput?.value || '' });
    save(); render();
    if (phInput) phInput.value = '';
    if (tempInput) tempInput.value = '';
    if (noteInput) noteInput.value = '';
    if (colorInput) colorInput.value = '#22d3ee';
    addXP(5, 'Data monitoring ditambahkan!');
    if (readings.length >= 5 && !earnedBadges.includes('data1')) { earnedBadges.push('data1'); saveBadges(); }
  }

  function clearAll() {
    if (!confirm('Hapus semua data monitoring?')) return;
    readings = []; save(); render();
  }

  function exportCSV() {
    if (!readings.length) { alert('Tidak ada data.'); return; }
    const rows = [['waktu','pH','suhu_C','warna','catatan']];
    readings.forEach(r => rows.push([escapeCSV(r.ts),escapeCSV(r.ph),escapeCSV(r.temp),escapeCSV(r.color),escapeCSV(r.note)]));
    const blob = new Blob([rows.map(r=>r.join(',')).join('\n')], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'kimia_data.csv';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  function updateStats() {
    const tot = document.getElementById('statTotal');
    const avgPH = document.getElementById('statAvgPH');
    const avgTemp = document.getElementById('statAvgTemp');
    const maxPH = document.getElementById('statMaxPH');
    if (tot) tot.textContent = readings.length;
    if (!readings.length) {
      if (avgPH) avgPH.textContent = '–';
      if (avgTemp) avgTemp.textContent = '–';
      if (maxPH) maxPH.textContent = '–';
      return;
    }
    if (avgPH) avgPH.textContent = (readings.reduce((s,r)=>s+r.ph,0)/readings.length).toFixed(2);
    if (avgTemp) avgTemp.textContent = (readings.reduce((s,r)=>s+r.temp,0)/readings.length).toFixed(1) + '°C';
    if (maxPH) maxPH.textContent = Math.max(...readings.map(r=>r.ph)).toFixed(2);
  }

  function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = '';
    const empty = document.getElementById('emptyState');
    if (!readings.length) { if (empty) empty.style.display = 'block'; return; }
    if (empty) empty.style.display = 'none';
    readings.slice().reverse().forEach((r, i) => {
      const idx = readings.length - i;
      const tr = document.createElement('tr');
      const time = new Date(r.ts);
      const timeStr = time.toLocaleDateString('id-ID') + ' ' + time.toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'});
      tr.innerHTML = `<td>${idx}</td><td>${timeStr}</td><td>${r.ph}</td><td>${r.temp}°C</td><td><span class="color-swatch" style="background:${r.color}"></span></td><td>${r.note||'–'}</td>`;
      tableBody.appendChild(tr);
    });
  }

  function renderChart() {
    if (!chartCanvas) return;
    const ctx = chartCanvas.getContext('2d');
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssW = Math.max(300, chartCanvas.clientWidth || 600);
    const cssH = 260;
    chartCanvas.width = Math.floor(cssW * dpr);
    chartCanvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const W = cssW, H = cssH;

    // Colors from CSS vars (read computed)
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const gridColor = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.08)';
    const textColor = isDark ? '#8892b0' : '#4a5568';
    const bgCard = isDark ? '#151928' : '#ffffff';

    ctx.fillStyle = bgCard;
    ctx.fillRect(0, 0, W, H);

    if (!readings.length) {
      ctx.fillStyle = textColor;
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Tambahkan data untuk melihat grafik', W/2, H/2);
      return;
    }

    const data = readings.slice(-50);
    const margin = { top:24, right:20, bottom:36, left:44 };
    const plotW = W - margin.left - margin.right;
    const plotH = H - margin.top - margin.bottom;

    // Grid
    for (let i=0; i<=4; i++) {
      const y = margin.top + (i/4)*plotH;
      ctx.strokeStyle = gridColor; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(margin.left, y); ctx.lineTo(margin.left+plotW, y); ctx.stroke();
    }

    const phMin=0, phMax=14;
    const allTemps = data.map(d=>d.temp);
    const tMin = Math.min(...allTemps)-1, tMax = Math.max(...allTemps)+1;
    const xPos = i => margin.left + (data.length<2 ? plotW/2 : (i/(data.length-1))*plotW);
    const yPh = v => margin.top + plotH - ((v-phMin)/(phMax-phMin))*plotH;
    const yT  = v => margin.top + plotH - ((v-tMin)/(tMax-tMin))*plotH;

    // pH line
    ctx.beginPath(); ctx.lineWidth=2.5; ctx.strokeStyle='#a3e635';
    data.forEach((d,i)=>{ const px=xPos(i),py=yPh(d.ph); i===0?ctx.moveTo(px,py):ctx.lineTo(px,py); });
    ctx.stroke();

    // Temp line
    ctx.beginPath(); ctx.lineWidth=2.5; ctx.strokeStyle='#22d3ee';
    data.forEach((d,i)=>{ const px=xPos(i),py=yT(d.temp); i===0?ctx.moveTo(px,py):ctx.lineTo(px,py); });
    ctx.stroke();

    // Points
    data.forEach((d,i)=>{
      const px=xPos(i);
      ctx.fillStyle='#a3e635'; ctx.beginPath(); ctx.arc(px,yPh(d.ph),3.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#22d3ee'; ctx.beginPath(); ctx.arc(px,yT(d.temp),3.5,0,Math.PI*2); ctx.fill();
    });

    // X labels
    ctx.fillStyle=textColor; ctx.font='11px system-ui'; ctx.textAlign='center';
    const step = Math.max(1, Math.floor(data.length/6));
    data.forEach((d,i)=>{
      if (i%step===0 || i===data.length-1) {
        const t = new Date(d.ts);
        const lbl = t.getHours().toString().padStart(2,'0')+':'+t.getMinutes().toString().padStart(2,'0');
        ctx.fillText(lbl, xPos(i), H-8);
      }
    });

    // Y label pH
    ctx.fillStyle='#a3e635'; ctx.font='bold 11px system-ui'; ctx.textAlign='right';
    [0,7,14].forEach(v => { ctx.fillText(v, margin.left-6, yPh(v)+4); });
  }

  function render() { renderTable(); updateStats(); requestAnimationFrame(renderChart); }
  render();

  document.getElementById('addBtn')?.addEventListener('click', addReading);
  document.getElementById('clearBtn')?.addEventListener('click', clearAll);
  document.getElementById('exportBtn')?.addEventListener('click', exportCSV);

  let raf=0;
  window.addEventListener('resize', ()=>{ cancelAnimationFrame(raf); raf=requestAnimationFrame(renderChart); });
  // re-render chart on theme change
  if (themeBtn) themeBtn.addEventListener('click', ()=>{ setTimeout(renderChart, 320); });
}

// ===== KEYBOARD =====
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal('topicModal');
    closeModal('quizModal');
    const m = document.querySelector('.modal-overlay.open');
    if (m) m.classList.remove('open');
  }
});

// ===== FIRST VISIT XP =====
if (!localStorage.getItem('kimiaku_visited')) {
  localStorage.setItem('kimiaku_visited', '1');
  setTimeout(() => addXP(10, 'Selamat datang di KimiaKu!'), 1200);
}

console.log('✓ KimiaKu v2.0 loaded');
