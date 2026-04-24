const express = require('express');
const wiegine = require('fca-mafiya');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// Dashboard UI
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DRB | COOKIE & UID TOOL</title>
    <style>
        body { background: #0d1117; color: #c9d1d9; font-family: sans-serif; padding: 15px; text-align: center; }
        .card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 20px; max-width: 500px; margin: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        textarea { width: 100%; background: #0d1117; border: 1px solid #30363d; color: #58a6ff; padding: 12px; border-radius: 8px; margin-bottom: 12px; box-sizing: border-box; outline: none; font-family: monospace; resize: none; }
        .btn-group { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; }
        .btn { background: #238636; color: white; border: none; padding: 15px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .btn-uid { background: #1f6feb; }
        .btn:disabled { background: #444; cursor: not-allowed; }
        .result-box { background: #1c2128; border: 1px solid #30363d; padding: 15px; margin-top: 15px; border-radius: 8px; text-align: left; position: relative; }
        .copy-btn { position: absolute; right: 10px; top: 10px; background: #30363d; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; }
        h1 { color: #58a6ff; text-transform: uppercase; letter-spacing: 1px; }
        pre { white-space: pre-wrap; word-wrap: break-word; font-size: 13px; color: #7ee787; background: #0d1117; padding: 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>Deepak Rajput Brand</h1>
    <div class="card">
        <textarea id="cookiesInput" placeholder="Paste multiple cookies here (one per line)" rows="10"></textarea>
        
        <div class="btn-group">
            <button id="checkBtn" class="btn" onclick="process('check')">CHECK ALIVE ✅</button>
            <button id="uidBtn" class="btn btn-uid" onclick="process('uid')">EXTRACT UIDS 🆔</button>
        </div>

        <div id="resultArea"></div>
    </div>

    <script>
        async function process(type) {
            const cookies = document.getElementById('cookiesInput').value.trim();
            if(!cookies) return alert("Bhai, cookies toh daal!");
            
            const btn1 = document.getElementById('checkBtn');
            const btn2 = document.getElementById('uidBtn');
            btn1.disabled = true; btn2.disabled = true;
            document.getElementById('resultArea').innerHTML = "<p>Processing... Please wait...</p>";

            try {
                const res = await fetch('/process', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ cookies, type })
                });
                const data = await res.json();
                
                let label = type === 'check' ? 'Alive Cookies' : 'Group Names & UIDs';
                let id = type === 'check' ? 'aliveResults' : 'uidResults';

                document.getElementById('resultArea').innerHTML = \`
                <div class="result-box">
                    <button class="copy-btn" onclick="copyText('\${id}')">Copy Result</button>
                    <strong>\${label}:</strong>
                    <pre id="\${id}">\${data.results.join('\\n') || "No data found!"}</pre>
                </div>\`;
            } catch (e) {
                document.getElementById('resultArea').innerHTML = "<p style='color:red;'>Server Error! Check Logs.</p>";
            } finally {
                btn1.disabled = false; btn2.disabled = false;
            }
        }

        function copyText(id) {
            const text = document.getElementById(id).innerText;
            navigator.clipboard.writeText(text).then(() => alert("Copied!"));
        }
    </script>
</body>
</html>`;

app.get('/', (req, res) => res.send(htmlContent));

app.post('/process', async (req, res) => {
    const { cookies, type } = req.body;
    if (!cookies) return res.status(400).json({ results: ["No input"] });

    const cookieArray = cookies.split('\n').filter(c => c.trim() !== "");
    let finalResults = [];

    for (let ck of cookieArray) {
        try {
            await new Promise((resolve) => {
                let cleanCookie = ck.trim();
                let loginData = cleanCookie.startsWith('[') ? { appState: JSON.parse(cleanCookie) } : { appState: cleanCookie };
                
                wiegine.login(loginData, { 
                    logLevel: 'silent', 
                    forceLogin: true,
                    userAgent: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36"
                }, (err, api) => {
                    if (err || !api) {
                        resolve();
                    } else {
                        if (type === 'check') {
                            finalResults.push(cleanCookie);
                            resolve();
                        } else if (type === 'uid') {
                            api.getThreadList(25, null, ["INBOX"], (err, list) => {
                                if (!err && list) {
                                    list.forEach(t => {
                                        if (t.isGroup) finalResults.push(\`NAME: \${t.name || 'No Name'} | UID: \${t.threadID}\`);
                                    });
                                }
                                resolve();
                            });
                        } else {
                            resolve();
                        }
                    }
                });
            });
        } catch (e) {
            console.log("Error in single cookie loop");
        }
    }
    res.json({ results: [...new Set(finalResults)] });
});

app.listen(PORT, () => console.log(`DRB Server live on port ${PORT}`));
