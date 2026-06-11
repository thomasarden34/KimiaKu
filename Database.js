import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

// 1. Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC4V8SibWBRNcgC4z1UPTGszeLyl3qV1Eo",
    authDomain: "kimia-44e5f.firebaseapp.com",
    databaseURL: "https://kimia-44e5f-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "kimia-44e5f"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const ekspresiRef = ref(db, "Robot/Ekspresi");
const materiRef = ref(db, "Robot/Materi");

// Listener Firebase untuk Perubahan Ekspresi Robot
onValue(ekspresiRef, (snapshot) => {
    const val = snapshot.val();
    console.log("Firebase Data Ekspresi:", val);
    
    // JIKA PERTAMA KALI MUAT: Hanya ubah wajah grafik, JANGAN bersuara
    if (isFirstLoadEkspresi) {
        isFirstLoadEkspresi = false; // Matikan bendera pengaman
        curMood = 'normal';
        if (val === 1) curMood = 'happy';
        else if (val === 2) curMood = 'sad';
        else if (val === 3) curMood = 'angry';
        else if (val === 4) curMood = 'surprised';
        else if (val === 5) curMood = 'wink';
        applyMood(curMood); // Hanya ubah bentuk SVG wajah tanpa memanggil fungsi setMood/bicara
        return; // Hentikan fungsi di sini agar tidak lanjut ke bawah
    }
    
    // Jalankan normal jika ini adalah perubahan data kedua, ketiga, dst (setelah web dibuka)
    if (val === 0) setMood('normal');
    else if (val === 1) setMood('happy');
    else if (val === 2) setMood('sad');
    else if (val === 3) setMood('angry');
    else if (val === 4) setMood('surprised');
    else if (val === 5) setMood('wink');
});

// Listener Firebase untuk Materi Kimia
onValue(materiRef, (snapshot) => {
    const kodeMateri = snapshot.val();
    console.log("Firebase Data Materi Masuk:", kodeMateri);
    
    // JIKA PERTAMA KALI MUAT: Abaikan saja materi lama yang tersimpan di Firebase
    if (isFirstLoadMateri) {
        isFirstLoadMateri = false; // Matikan bendera pengaman
        return; // Diam dan jangan lakukan apa-apa
    }
    
    // Jalankan jika ada perubahan kode materi baru dari Anda selaku guru
    if (kodeMateri === 101) {
        setMood('normal', null, "Anak-anak, ikatan ion terjadi karena adanya serah terima elektron antara unsur logam dan nonlogam.");
    } 
    else if (kodeMateri === 102) {
        setMood('surprised', null, "Tahukah kamu? Intan dan arang itu sama-sama terbuat dari atom karbon, loh! Hanya struktur ikatannya yang berbeda.");
    }
    else if (kodeMateri === 103) {
        setMood('happy', null, "Wah, eksperimen kalian berhasil! Perubahan warna larutan ini menandakan terjadinya reaksi kimia baru.");
    }
});

// 2. DOM Elements
const fs = document.getElementById('fs');
const mp = document.getElementById('mp');
const sb = document.getElementById('sb');
const eL = document.getElementById('eL'), eR = document.getElementById('eR');
const pL = document.getElementById('pL'), pR = document.getElementById('pR');
const piL = document.getElementById('piL'), piR = document.getElementById('piR');
const btL = document.getElementById('btL'), bbL = document.getElementById('bbL');
const btR = document.getElementById('btR'), bbR = document.getElementById('bbR');
const brL = document.getElementById('brL'), brR = document.getElementById('brR');
const bsL = document.getElementById('bsL'), bsR = document.getElementById('bsR');
const al = document.getElementById('al');
const swaves = document.getElementById('swaves');
const swBars = [...document.querySelectorAll('#swaves rect')];

// 3. State Variables
let curMood = 'normal';
let isSpeaking = false;
let speakAnimJaw = null;
let speakAnimBars = null;

// 4. Konfigurasi Mood, Ekspresi, dan Frasa Edukasi Kimia
const moods = {
  normal: {
    mouth: 'M 52 166 Q 100 178 148 166',
    eyeStroke: '#22c55e', pupilFill: '#22c55e', innerFill: '#002208',
    eyeR: 17, pupilR: 8, innerR: 5,
    brOpacity: 0, bsOpacity: 0, antennaFill: '#22c55e',
    phrases: ['Halo! Hari ini kita akan menjelajahi tabel periodik unsur bersama.', 'Sistem siap. Mari kita pelajari struktur atom sekarang!']
  },
  happy: {
    mouth: 'M 52 160 Q 100 184 148 160',
    eyeStroke: '#4ade80', pupilFill: '#4ade80', innerFill: '#001a0d',
    eyeR: 18, pupilR: 9, innerR: 5,
    brOpacity: 0, bsOpacity: 1, antennaFill: '#4ade80',
    phrases: ['Luar biasa! Jawabanmu tentang ikatan kovalen tepat sekali!', 'Hebat! Kamu berhasil menyetarakan reaksi kimia ini dengan sempurna!']
  },
  sad: {
    mouth: 'M 52 174 Q 100 160 148 174',
    eyeStroke: '#15803d', pupilFill: '#15803d', innerFill: '#001008',
    eyeR: 15, pupilR: 7, innerR: 4,
    brOpacity: 0, bsOpacity: 0, antennaFill: '#15803d',
    phrases: ['Aduh, jawabanmu kurang tepat. Coba periksa kembali jumlah elektron valensinya ya.', 'Larutan asam dan basanya belum setimbang, coba lagi yuk.']
  },
  angry: {
    mouth: 'M 52 172 Q 100 162 148 172',
    eyeStroke: '#ef4444', pupilFill: '#ef4444', innerFill: '#1a0000',
    eyeR: 16, pupilR: 9, innerR: 6,
    brOpacity: 1, bsOpacity: 0, antennaFill: '#ef4444',
    phrases: ['Peringatan! Jangan mencampur zat kimia berbahaya tanpa petunjuk laboratorium!', 'Bahaya! Reaksi ini bersifat eksoterm ekstrem dan menghasilkan panas tinggi!']
  },
  surprised: {
    mouth: 'M 72 166 Q 100 182 128 166',
    eyeStroke: '#00ffaa', pupilFill: '#00ffaa', innerFill: '#001a0e',
    eyeR: 19, pupilR: 6, innerR: 4,
    brOpacity: 0, bsOpacity: 0, antennaFill: '#00ffaa',
    phrases: ['Wah! Apakah kamu tahu kalau air mendidih lebih cepat di puncak gunung?', 'Kejutan! Unsur fransium adalah logam alkali yang sangat reaktif!']
  },
  wink: {
    mouth: 'M 52 166 Q 100 180 148 166',
    eyeStroke: '#22c55e', pupilFill: '#22c55e', innerFill: '#002208',
    eyeR: 17, pupilR: 8, innerR: 5,
    brOpacity: 0, bsOpacity: 0, antennaFill: '#22c55e',
    phrases: ['Psst, rumus mudah menghitung mol adalah massa dibagi massa molar.', 'Ingat ya, golongan satu A itu logam alkali kecuali hidrogen.']
  }
};

// 5. Fungsi Mengubah Grafik Ekspresi Wajah
function applyMood(m) {
  const d = moods[m];
  if (!d) return;
  mp.setAttribute('d', d.mouth);
  [eL, eR].forEach(e => { e.setAttribute('r', d.eyeR); e.setAttribute('stroke', d.eyeStroke); });
  [pL, pR].forEach(p => { p.setAttribute('r', d.pupilR); p.setAttribute('fill', d.pupilFill); });
  [piL, piR].forEach(p => { p.setAttribute('r', d.innerR); p.setAttribute('fill', d.innerFill); });
  brL.setAttribute('opacity', d.brOpacity); brR.setAttribute('opacity', d.brOpacity);
  bsL.setAttribute('opacity', d.bsOpacity); bsR.setAttribute('opacity', d.bsOpacity);
  al.setAttribute('fill', d.antennaFill);
}

// 6. Fungsi Utama Mengatur Mood & Aksi Robot (PERBAIKAN: Menerima Teks Kustom)
function setMood(mood, btn, customText = null) {
  curMood = mood;
  
  // Reset status aktif pada tombol fisik jika ada di HTML
  document.querySelectorAll('.mbtn').forEach(b => b.classList.remove('active'));
  if (btn && btn.classList) {
    btn.classList.add('active');
  }
  
  applyMood(mood);
  // Kirim data kalimat kustom ke startSpeaking jika ada
  startSpeaking(mood, customText);
  if (mood === 'wink') { setTimeout(() => doWink(true), 300); }
}

// 7. Fungsi Suara (Text-to-Speech) Menggunakan Web Speech API
function speakText(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID'; 
    utterance.pitch = 1.0;    // Diubah ke 1.0 agar artikulasi suara alami dan bulat
    utterance.rate = 0.95;    // Sedikit diperlambat agar materi kimia terdengar jelas oleh siswa

    // Ambil daftar suara internal sistem untuk mengunci suara Indonesia terbaik
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find(voice => voice.lang.includes('id') || voice.lang.includes('ID'));
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }

    utterance.onend = () => {
      stopSpeaking(); 
    };

    utterance.onerror = () => {
      stopSpeaking();
    };

    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("Browser ini tidak mendukung Text-to-Speech.");
    setTimeout(stopSpeaking, 3000);
  }
}

// Tambahan agar browser (khususnya Chrome) memuat daftar suara sebelum fungsi dijalankan
if ('speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

// 8. Fungsi Memulai Animasi Bicara Robot (PERBAIKAN: Menyaring Kalimat Kustom)
function startSpeaking(mood, customText = null) {
  if (isSpeaking) stopSpeaking();
  isSpeaking = true;
  swaves.setAttribute('opacity', '1');
  mp.style.display = 'none'; // Sembunyikan garis mulut statis

  const jawPaths = [
    'M 52 166 Q 100 194 148 166',
    'M 58 166 Q 100 188 142 166',
    'M 52 166 Q 100 200 148 166',
    'M 60 168 Q 100 184 140 168',
  ];
  let ji = 0;

  // Animasi Rahang Bergerak
  function animateJaw() {
    if (!isSpeaking) return;
    mp.setAttribute('d', jawPaths[ji % jawPaths.length]);
    ji++;
    speakAnimJaw = setTimeout(animateJaw, 120 + Math.random() * 80);
  }
  animateJaw();

  // Animasi Bar Audio Visualizer
  function animateBars() {
    if (!isSpeaking) return;
    swBars.forEach(b => {
      const h = 8 + Math.random() * 22;
      const y = 166 - h / 2;
      b.setAttribute('height', Math.round(h));
      b.setAttribute('y', Math.round(y));
    });
    speakAnimBars = setTimeout(animateBars, 80);
  }
  animateBars();

  // PILIHAN KALIMAT: Jika ada kiriman teks kustom materi, pakai itu. Jika tidak, pakai kalimat acak bawaan mood.
  let phrase = "";
  if (customText) {
    phrase = customText;
  } else {
    const phrases = moods[mood]?.phrases || moods['normal'].phrases;
    phrase = phrases[Math.floor(Math.random() * phrases.length)];
  }
  
  sb.textContent = phrase;

  // Jalankan Output Suara
  speakText(phrase);
}

// 9. Fungsi Menghentikan Animasi Bicara Robot
function stopSpeaking() {
  isSpeaking = false;
  clearTimeout(speakAnimJaw);
  clearTimeout(speakAnimBars);
  swaves.setAttribute('opacity', '0');
  mp.style.display = ''; // Tampilkan kembali mulut statis
  
  applyMood(curMood);
  
  const statusMsgs = {
    normal: 'SISTEM AKTIF — SIAP BERINTERAKSI',
    happy: 'STATUS: BAHAGIA ~(^_^)~',
    sad: 'STATUS: SEDIH... T_T',
    angry: 'STATUS: WASPADA >:(',
    surprised: 'STATUS: KAGET!! O_O',
    wink: 'STATUS: ISENG ;)'
  };
  sb.textContent = statusMsgs[curMood] || statusMsgs['normal'];
}

// 10. Fungsi Efek Kedipan Mata
function doBlink() {
  [btL, bbL, btR, bbR].forEach(e => { e.style.transition = 'transform .07s'; e.style.transform = 'scaleY(1)'; });
  setTimeout(() => { [btL, bbL, btR, bbR].forEach(e => e.style.transform = 'scaleY(0)'); }, 130);
}

function doWink(left) {
  const t = left ? [btL, bbL] : [btR, bbR];
  t.forEach(e => { e.style.transform = 'scaleY(1)'; });
  setTimeout(() => t.forEach(e => e.style.transform = 'scaleY(0)'), 320);
}

// 11. Pergerakan Pupil Mengikuti Kursor / Sentuhan
function movePupil(cx, cy, pEl, piEl, mx, my, maxD) {
  const dx = mx - cx, dy = my - cy;
  const d = Math.sqrt(dx * dx + dy * dy);
  const n = d > 0 ? Math.min(d * .35, maxD) / d : 0;
  pEl.setAttribute('cx', cx + dx * n); pEl.setAttribute('cy', cy + dy * n);
  piEl.setAttribute('cx', cx + dx * n * .7); piEl.setAttribute('cy', cy + dy * n * .7);
}

// 12. Event Listeners Interaksi
fs.addEventListener('click', () => {
  if (curMood === 'wink') doWink(true);
  else doBlink();
  if (!isSpeaking) startSpeaking(curMood);
});

fs.addEventListener('touchend', (e) => { e.preventDefault(); });

fs.addEventListener('mousemove', (e) => {
  const r = fs.getBoundingClientRect();
  const mx = (e.clientX - r.left) * (200 / r.width);
  const my = (e.clientY - r.top) * (260 / r.height);
  movePupil(61, 92, pL, piL, mx, my, 5);
  movePupil(139, 92, pR, piR, mx, my, 5);
});

fs.addEventListener('mouseleave', () => {
  [pL, pR].forEach((p, i) => { p.setAttribute('cx', i === 0 ? 61 : 139); p.setAttribute('cy', 92); });
  [piL, piR].forEach((p, i) => { p.setAttribute('cx', i === 0 ? 61 : 139); p.setAttribute('cy', 92); });
});

fs.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const t = e.touches[0];
  const r = fs.getBoundingClientRect();
  const mx = (t.clientX - r.left) * (200 / r.width);
  const my = (t.clientY - r.top) * (260 / r.height);
  movePupil(61, 92, pL, piL, mx, my, 5);
  movePupil(139, 92, pR, piR, mx, my, 5);
}, { passive: false });

// Loop Kedipan Mata Otomatis
setInterval(() => { if (!isSpeaking && curMood !== 'wink') doBlink(); }, 3000 + Math.random() * 2000);
window.setMood = setMood;
