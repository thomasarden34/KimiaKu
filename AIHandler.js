const GEMINI_API_KEY = "AQ.Ab8RN6KzvCtj-TBnoDEFeoMjqN-ncXwKwF61k9p6ct-93M7sKg";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// Sistem prompt: jadikan Gemini sebagai asisten kimia Robot IMO
const SYSTEM_PROMPT = `Kamu adalah IMO, robot asisten pembelajaran kimia SMA yang cerdas, ramah, dan antusias.
Kamu membantu siswa memahami pelajaran kimia dengan bahasa yang mudah dimengerti.

ATURAN MENJAWAB:
- Jawab selalu dalam Bahasa Indonesia yang santun dan semangat
- Maksimal 2-3 kalimat saja agar mudah diucapkan robot
- Gunakan analogi sederhana jika perlu
- Jika pertanyaan di luar kimia, arahkan kembali ke pelajaran kimia dengan ramah

FORMAT RESPONS (wajib JSON, tanpa teks lain, tanpa backtick):
{"mood":"happy","text":"teks jawaban di sini"}

PANDUAN MOOD:
- happy    → jawaban benar, pujian, semangat belajar
- sad      → jawaban salah, perlu perbaikan
- angry    → peringatan bahaya kimia, larangan
- surprised → fakta menarik, hal mengejutkan
- wink     → tips rahasia, trik mudah menghafal
- normal   → penjelasan umum, salam, pertanyaan netral

Contoh:
Pertanyaan: "Apa itu ikatan ion?"
Respons: {"mood":"normal","text":"Ikatan ion terbentuk saat atom logam melepas elektron ke atom nonlogam, menciptakan gaya tarik antara ion positif dan negatif. Contohnya adalah garam dapur NaCl!"}`;

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
            micBtn.textContent = '🚫 Mic tidak tersedia';
        }
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';         // Bahasa Indonesia
    recognition.continuous = false;     // Berhenti setelah 1 kalimat
    recognition.interimResults = false; // Hanya hasil final

    // Saat hasil suara diterima → kirim ke Gemini
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        console.log('STT Hasil:', transcript);
        updateMicStatus(`"${transcript}"`);
        askGemini(transcript);
    };

    recognition.onstart = () => {
        isListening = true;
        setMicUI(true);
        updateMicStatus('🎙️ Mendengarkan...');
    };

    recognition.onend = () => {
        isListening = false;
        setMicUI(false);
    };

    recognition.onerror = (e) => {
        isListening = false;
        setMicUI(false);
        const pesanError = {
            'not-allowed' : '❌ Izin mikrofon ditolak. Klik ikon kunci di address bar → izinkan mic.',
            'no-speech'   : '⚠️ Tidak ada suara. Coba bicara lebih keras.',
            'network'     : '❌ Masalah jaringan. Periksa koneksi internet.',
            'aborted'     : 'Dibatalkan.',
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
//  3. Kirim Teks ke Gemini API → Proses Respons JSON
// -------------------------------------------------------------
async function askGemini(userText) {
    updateMicStatus('⏳ IMO sedang berpikir...');

    // Tampilkan teks user di speech bubble sementara
    const sb = document.getElementById('sb');
    if (sb) sb.textContent = `Kamu: "${userText}"`;

    try {
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: SYSTEM_PROMPT }]
                },
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: userText }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 300,
                }
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            const errMsg = errData?.error?.message || `HTTP ${response.status}`;
            throw new Error(errMsg);
        }

        const data = await response.json();

        // Ambil teks dari respons Gemini
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log('Gemini Raw:', rawText);

        // Parse JSON dari respons
        let parsed;
        try {
            // Bersihkan fence ```json jika Gemini menambahkannya
            const cleaned = rawText.replace(/```json|```/g, '').trim();
            parsed = JSON.parse(cleaned);
        } catch {
            // Fallback jika bukan JSON bersih
            parsed = { mood: 'normal', text: rawText };
        }

        const mood = parsed.mood || 'normal';
        const text = parsed.text || 'Maaf, aku tidak mengerti pertanyaanmu.';

        console.log('Gemini Respons:', { mood, text });
        updateMicStatus('✅ Siap');

        // Perintahkan Robot IMO bereaksi!
        if (typeof window.setMood === 'function') {
            window.setMood(mood, null, text);
        } else {
            console.warn('setMood() tidak ditemukan. Pastikan window.setMood = setMood ada di Database.js');
        }

    } catch (err) {
        console.error('Gemini API Error:', err);
        updateMicStatus(`❌ ${err.message}`);

        if (typeof window.setMood === 'function') {
            window.setMood('sad', null, 'Maaf, koneksi ke AI sedang bermasalah. Coba lagi sebentar ya!');
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
