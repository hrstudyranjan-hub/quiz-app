const API_KEY = "Put the API key here to use the quiz app, actually I tried putting mine due to being publlic it was blocked."; 
const el = id => document.getElementById(id);
let qs = [], i = 0, score = 0;

async function start() {
    const topic = el("topic").value.trim();
    const n = el("num-questions").value;
    if (!topic) return alert("Enter a topic");

    el("start-btn").innerText = "Generating...";
    
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    try {
        const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: `Create a ${n} question quiz about ${topic}. Return ONLY JSON: {"questions":[{"q":"question","options":["a","b","c","d"],"ans":0}]}` }]
                }],
                
                generationConfig: { 
                    temperature: 0.7 
                }
            })
        });

        const data = await r.json();

        if (data.error) {
            throw new Error(`${data.error.status}: ${data.error.message}`);
        }

        let rawText = data.candidates[0].content.parts[0].text;
        
        rawText = rawText.replace(/```json|```/g, "").trim();
        
        qs = JSON.parse(rawText).questions;

        el("setup").style.display = "none";
        el("quiz-area").style.display = "block";
        render();
    } catch (e) { 
        console.error("Debug Info:", e);
        alert("Setup Error: " + e.message); 
    } finally {
        el("start-btn").innerText = "Generate & Start Quiz";
    }
}

function render() {
    const q = qs[i];
    el("question-text").innerText = q.q;
    el("options").innerHTML = q.opts.map((o, idx) => 
        `<button class="option-btn" onclick="check(${idx})">${o}</button>`).join("");
}

window.check = (idx) => {
    if (idx === qs[i].ans) score++;
    if (++i < qs.length) return render();
    alert(`Quiz Over! Score: ${score}/${qs.length}`);
    location.reload();
};


el("start-btn").onclick = start;
