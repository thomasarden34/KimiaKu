async function askGemini(userText) {
    updateMicStatus('⏳ IMO sedang berpikir...');

    const sb = document.getElementById('sb');
    if (sb) sb.textContent = `Kamu: "${userText}"`;

    try {
        // Ganti URL di bawah ini dengan URL Cloudflare Worker milikmu!
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
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        let parsed;
        try {
            const cleaned = rawText.replace(/```json|```/g, '').trim();
            parsed = JSON.parse(cleaned);
        } catch {
            parsed = { mood: 'normal', text: rawText };
        }

        const mood = parsed.mood || 'normal';
        const text = parsed.text || 'Maaf, aku tidak mengerti pertanyaanmu.';

        updateMicStatus('✅ Siap');
        if (typeof window.setMood === 'function') {
            window.setMood(mood, null, text);
        }

    } catch (err) {
        console.error('Gemini API Error:', err);
        updateMicStatus(`❌ ${err.message}`);
        if (typeof window.setMood === 'function') {
            window.setMood('sad', null, 'Maaf, koneksi ke AI sedang bermasalah.');
        }
    }
}
