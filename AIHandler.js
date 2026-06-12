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

    // Saat hasil suara diterima → kirim ke Cloudflare Workers
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
            'not-allowed' : '❌ Izin mikrofon ditolak. Klik ikon kunci di dekat URL → izinkan mic.',
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
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        recognition.start();
    }
}

// -------------------------------------------------------------
//  3. Kirim Teks ke Cloudflare Workers
// -------------------------------------------------------------
async function askGemini(userText) {
    updateMicStatus('⏳ IMO sedang berpikir...');

    const sb = document.getElementById('sb');
    if (sb) sb.textContent = `Kamu: "${userText}"`;

    try {
        // GANTI URL DI BAWAH INI SESUAI NAMA WORKER BARU KAMU TANPA GIT!
        const response = await fetch('https://aged-moon-5cc2.thomasarden34.workers.dev/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userText: userText })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {throw new Error(`Google API: ${data.error.message}`);}
        
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log('Gemini Raw:', rawText);

        let parsed;
        try {
            const cleaned = rawText.replace(/```json|```/g, '').trim();
            parsed = JSON.parse(cleaned);
        } catch {
            parsed = { mood: 'normal', text: rawText };
        }

        const mood = parsed.mood || 'normal';
        const text = parsed.text || 'Maaf, aku tidak mengerti pertanyaanmu.';

        console.log('Gemini Respons:', { mood, text });
        updateMicStatus('✅ Siap');

        if (typeof window.setMood === 'function') {
            window.setMood(mood, null, text);
        } else {
            console.warn('setMood() tidak ditemukan.');
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
