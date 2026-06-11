// =============================================================
//  AIHandler.js — Speech-to-Text + Claude LLM untuk Robot IMO
//  Alur: Mic → Web Speech API → Claude API → setMood() + bicara
// =============================================================

// ⚠️  GANTI dengan API key Claude kamu dari console.anthropic.com
const ANTHROPIC_API_KEY = 'sk-ant-XXXXXXXXXXXXXXXXXXXXXXXXXX';

// Sistem prompt: jadikan Claude sebagai asisten kimia Robot IMO
const SYSTEM_PROMPT = `Kamu adalah IMO, robot asisten pembelajaran kimia SMA yang cerdas, ramah, dan antusias.
Kamu membantu siswa memahami pelajaran kimia dengan bahasa yang mudah dimengerti.

ATURAN MENJAWAB:
- Jawab selalu dalam Bahasa Indonesia yang santun dan semangat
- Maksimal 2-3 kalimat saja agar mudah diucapkan
- Gunakan analogi sederhana jika perlu
- Jika pertanyaan di luar kimia, arahkan kembali ke pelajaran kimia dengan ramah

FORMAT RESPONS (wajib JSON):
{
  "mood": "happy|sad|angry|surprised|normal|wink",
  "text": "teks jawaban di sini"
}

PANDUAN MOOD:
- happy    → jawaban benar, pujian, semangat belajar
- sad      → jawaban salah, perlu perbaikan
- angry    → peringatan bahaya kimia, larangan
- surprised → fakta menarik, hal mengejutkan
- wink     → tips rahasia, trik mudah menghafal
- normal   → penjelasan umum, salam, pertanyaan netral

Contoh:
Pertanyaan: "Apa itu ikatan ion?"
Respons: {"mood":"normal","text":"Ikatan ion terbentuk saat atom logam melepas elektron ke atom nonlogam, menciptakan gaya tarik antara ion positif dan negatif. Contohnya adalah garam dapur, NaCl!"}`;

// -------------------------------------------------------------
//  1. Inisialisasi Web Speech Recognition
// -------------------------------------------------------------
let recognition = null;
let isListening = false;

function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.warn('Browser tidak mendukung Speech Recognition.');
        const micBtn = document.getElementById('micBtn');
        if (micBtn) {
            micBtn.disabled = true;
            micBtn.title = 'Browser tidak mendukung mikrofon';
            micBtn.textContent = '🚫';
        }
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';         // Bahasa Indonesia
    recognition.continuous = false;     // Berhenti setelah 1 kalimat
    recognition.interimResults = false; // Hanya hasil final

    // Saat hasil suara diterima → kirim ke Claude
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        console.log('STT Hasil:', transcript);
        updateMicStatus(`"${transcript}"`);
        askClaude(transcript);
    };

    recognition.onstart = () => {
        isListening = true;
        setMicUI(true);
        updateMicStatus('Mendengarkan...');
    };

    recognition.onend = () => {
        isListening = false;
        setMicUI(false);
    };

    recognition.onerror = (e) => {
        isListening = false;
        setMicUI(false);
        const pesanError = {
            'not-allowed'  : 'Izin mikrofon ditolak. Izinkan akses mic di browser.',
            'no-speech'    : 'Tidak ada suara terdeteksi. Coba lagi.',
            'network'      : 'Masalah jaringan. Periksa koneksi internet.',
        };
        updateMicStatus(pesanError[e.error] || `Error: ${e.error}`);
        console.error('STT Error:', e.error);
    };
}

// -------------------------------------------------------------
//  2. Toggle Mic ON / OFF
// -------------------------------------------------------------
function toggleMic() {
    if (!recognition) {
        alert('Speech Recognition tidak tersedia di browser ini.\nGunakan Chrome atau Edge terbaru.');
        return;
    }

    if (isListening) {
        recognition.stop();
    } else {
        // Hentikan TTS robot jika sedang bicara
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        recognition.start();
    }
}

// -------------------------------------------------------------
//  3. Kirim Teks ke Claude API → Proses Respons JSON
// -------------------------------------------------------------
async function askClaude(userText) {
    updateMicStatus('⏳ IMO sedang berpikir...');

    // Tampilkan teks user di speech bubble sementara
    const sb = document.getElementById('sb');
    if (sb) sb.textContent = `Kamu: "${userText}"`;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type'      : 'application/json',
                'x-api-key'         : ANTHROPIC_API_KEY,
                'anthropic-version' : '2023-06-01',
                // CORS proxy diperlukan jika dijalankan lokal (tanpa server)
                // Jika deploy ke server, hapus header ini
            },
            body: JSON.stringify({
                model      : 'claude-sonnet-4-20250514',
                max_tokens : 300,
                system     : SYSTEM_PROMPT,
                messages   : [
                    { role: 'user', content: userText }
                ]
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData?.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const rawText = data.content?.[0]?.text || '';

        // Parse JSON dari respons Claude
        let parsed;
        try {
            // Bersihkan fence ```json jika ada
            const cleaned = rawText.replace(/```json|```/g, '').trim();
            parsed = JSON.parse(cleaned);
        } catch {
            // Fallback: jika bukan JSON, pakai teks mentah dengan mood normal
            parsed = { mood: 'normal', text: rawText };
        }

        const mood = parsed.mood || 'normal';
        const text = parsed.text || 'Maaf, aku tidak mengerti pertanyaanmu.';

        console.log('Claude Respons:', { mood, text });
        updateMicStatus('✅ Siap');

        // Perintahkan Robot IMO bereaksi!
        // Fungsi setMood() ada di Database.js (sudah ter-import di imo.html)
        if (typeof setMood === 'function') {
            setMood(mood, null, text);
        } else {
            console.warn('setMood() tidak ditemukan. Pastikan Database.js dimuat sebelum AIHandler.js');
        }

    } catch (err) {
        console.error('Claude API Error:', err);
        updateMicStatus(`❌ Error: ${err.message}`);

        // Robot menunjukkan ekspresi sad jika ada error
        if (typeof setMood === 'function') {
            setMood('sad', null, 'Maaf, koneksi ke AI sedang bermasalah. Coba lagi sebentar ya!');
        }
    }
}

// -------------------------------------------------------------
//  4. Update UI Tombol Mic & Status
// -------------------------------------------------------------
function setMicUI(active) {
    const micBtn = document.getElementById('micBtn');
    if (!micBtn) return;

    if (active) {
        micBtn.classList.add('mic-active');
        micBtn.innerHTML = '🔴 Stop';
        micBtn.title = 'Klik untuk berhenti';
    } else {
        micBtn.classList.remove('mic-active');
        micBtn.innerHTML = '🎤 Tanya IMO';
        micBtn.title = 'Klik dan tanya soal kimia';
    }
}

function updateMicStatus(msg) {
    const statusEl = document.getElementById('micStatus');
    if (statusEl) statusEl.textContent = msg;
}

// -------------------------------------------------------------
//  5. Jalankan saat DOM siap
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initSpeechRecognition();

    const micBtn = document.getElementById('micBtn');
    if (micBtn) {
        micBtn.addEventListener('click', toggleMic);
    }
});
