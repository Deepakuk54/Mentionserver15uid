const express = require('express');
const axios = require('axios');
const wiegine = require('fca-mafiya');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Deepak Rajput Brand - Pro Extractor</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; background: #0d1117; color: #c9d1d9; padding: 20px; display: flex; flex-direction: column; align-items: center; }
                .container { width: 100%; max-width: 650px; background: #161b22; padding: 30px; border-radius: 15px; border: 1px solid #30363d; box-shadow: 0 15px 35px rgba(0,0,0,0.6); }
                h1 { text-align: center; color: #58a6ff; font-size: 26px; margin-bottom: 5px; text-transform: uppercase; }
                .brand-sub { text-align: center; color: #8b949e; margin-bottom: 20px; font-size: 13px; }
                .mode-selector { display: flex; gap: 10px; margin-bottom: 20px; }
                .mode-btn { flex: 1; padding: 12px; border: 1px solid #30363d; background: #21262d; color: white; cursor: pointer; border-radius: 8px; font-weight: bold; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; }
                .mode-btn.active { background: #1f6feb; border-color: #58a6ff; }
                textarea { width: 100%; height: 130px; background: #0d1117; color: #7ee787; border: 1px solid #30363d; border-radius: 8px; padding: 12px; font-family: monospace; box-sizing: border-box; margin-bottom: 15px; }
                .main-btn { width: 100%; padding: 15px; background: #238636; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px; }
                #status { margin-top: 20px; text-align: center; color: #ffa657; font-weight: 500; }
                .account-card { background: #010409; border: 1px solid #30363d; border-radius: 10px; padding: 15px; margin-top: 20px; border-left: 5px solid #58a6ff; }
                .group-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #21262d; font-size: 14px; }
                .uid-badge { background: #1f6feb; color: white; padding: 4px 8px; border-radius: 5px; font-family: monospace; cursor: pointer; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Deepak Rajput Brand</h1>
                <div class="brand-sub">Premium Multi-Mode Extractor</div>
                <div class="mode-selector">
                    <button id="cookieBtn" class="mode-btn active" onclick="setMode('cookie')">
                        <span>🍪</span> COOKIES CHECKER
                    </button>
                    <button id="uidBtn" class="mode-btn" onclick="setMode('cookie')">
                        <span>🆔</span> UID EXTRACTOR
                    </button>
                </div>
                <textarea id="userInput" placeholder="Paste data here..."></textarea>
                <button class="main-btn" onclick="startExtraction()">START EXTRACTION</button>
                <div id="status">Ready...</div>
                <div id="results"></div>
            </div>
            <script>
                let currentMode = 'cookie';
                function setMode(mode) {
                    currentMode = mode;
                    // Dono buttons cookies par hi kaam karenge jaisa aapne kaha
                    document.getElementById('cookieBtn').classList.toggle('active', true);
                    document.getElementById('uidBtn').classList.toggle('active', true);
                }
                async function startExtraction() {
                    const data = document.getElementById('userInput').value.trim().split('\\n').filter(Boolean);
                    const resultsDiv = document.getElementById('results');
                    const status = document.getElementById('status');
                    resultsDiv.innerHTML = '';
                    const endpoint = '/extract-cookie';
                    for(let i=0; i < data.length; i++) {
                        status.innerText = "Processing " + (i+1) + "/" + data.length;
                        try {
                            const res = await fetch(endpoint, {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({ input: data[i].trim() })
                            });
                            const result = await res.json();
                            let html = \`<div class="account-card">
                                <b>👤 \${result.name}</b><br>
                                <small style="color:#8b949e">ID UID: \${result.uid}</small>\`;
                            if(result.groups && result.groups.length > 0) {
                                result.groups.forEach(g => {
                                    html += \`<div class="group-item"><span>\${g.name}</span><span class="uid-badge" onclick="copyUID('\${g.id}')">\${g.id}</span></div>\`;
                                });
                            } else { html += '<p style="color:red">No Groups Found</p>'; }
                            html += '</div>';
                            resultsDiv.innerHTML += html;
                        } catch(e) {}
                    }
                    status.innerText = "✅ Done!";
                }
                function copyUID(uid) {
                    navigator.clipboard.writeText(uid);
                    alert("Copied: " + uid);
                }
            </script>
        </body>
        </html>
    `);
});

app.post('/extract-cookie', (req, res) => {
    const { input } = req.body;
    wiegine.login(input, { logLevel: 'silent' }, (err, api) => {
        if (err || !api) return res.json({ name: "Dead Cookie", uid: "---", groups: [] });
        
        const uid = api.getCurrentUserID();
        
        api.getThreadList(100, null, ["INBOX"], (err, list) => {
            const groups = (!err && list) ? list.filter(t => t.isGroup).map(g => ({ name: g.name || "Group", id: g.threadID })) : [];
            
            api.getUserInfo(uid, (e, info) => {
                const name = (!e && info[uid]) ? info[uid].name : "Account OK";
                res.json({ name: name, uid: uid, groups: groups });
            });
        });
    });
});

app.listen(PORT, '0.0.0.0', () => console.log('Live!'));
