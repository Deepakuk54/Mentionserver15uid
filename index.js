const express = require('express');
const wiegine = require('fca-mafiya');
const axios = require('axios');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.json());

const DB_FILE = 'drb_master_db.json';
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ locks: [] }));

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DEEPAK RAJPUT BRAND | MASTER V3</title>
    <style>
        :root {
            --bg: #0b0e14;
            --card-bg: #151921;
            --border: #2d333b;
            --accent: #58a6ff;
            --success: #238636;
            --danger: #da3633;
            --text-main: #adbac7;
            --text-bright: #ffffff;
        }

        body {
            background-color: var(--bg);
            color: var(--text-main);
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
        }

        .header h1 {
            color: var(--accent);
            letter-spacing: 2px;
            text-transform: uppercase;
            font-size: 28px;
            margin: 0;
        }

        .header p {
            color: #768390;
            font-size: 14px;
        }

        .grid-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            width: 100%;
            max-width: 500px;
        }

        .tool-card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 30px 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .tool-card:hover {
            border-color: var(--accent);
            transform: translateY(-8px);
            box-shadow: 0 8px 30px rgba(88, 166, 255, 0.2);
        }

        .icon-box {
            font-size: 40px;
            margin-bottom: 15px;
            filter: drop-shadow(0 0 5px rgba(88,166,255,0.4));
        }

        .tool-card h3 {
            margin: 0;
            color: var(--text-bright);
            font-size: 16px;
        }

        /* Modal Overlay */
        .modal {
            display: none;
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            z-index: 999;
            padding: 15px;
            box-sizing: border-box;
            overflow-y: auto;
        }

        .modal-content {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 20px;
            max-width: 480px;
            margin: 40px auto;
            padding: 25px;
            position: relative;
        }

        textarea, input {
            width: 100%;
            background: #0d1117;
            border: 1px solid var(--border);
            color: var(--accent);
            padding: 14px;
            border-radius: 10px;
            margin: 12px 0;
            box-sizing: border-box;
            font-family: 'Consolas', monospace;
        }

        .main-btn {
            width: 100%;
            padding: 16px;
            background: var(--success);
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            transition: 0.2s;
        }

        .main-btn:active { transform: scale(0.98); }

        .close-btn {
            background: transparent;
            color: var(--danger);
            border: 1px solid var(--danger);
            margin-top: 15px;
        }

        /* Result Cards */
        .res-box {
            background: #0d1117;
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 15px;
            margin-top: 15px;
            text-align: left;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>Deepak Rajput Brand</h1>
        <p>Premium Cloud Infrastructure V3</p>
    </div>

    <div class="grid-container">
        <div class="tool-card" onclick="openTool('lock')">
            <div class="icon-box">🛡️</div>
            <h3>Stealth Lock</h3>
        </div>
        <div class="tool-card" onclick="openTool('extractor')">
            <div class="icon-box">📡</div>
            <h3>Pro Extractor</h3>
        </div>
        <div class="tool-card" onclick="openTool('checker')">
            <div class="icon-box">💎</div>
            <h3>Cookie Checker</h3>
        </div>
        <div class="tool-card" onclick="alert('Bhai, message sender ka code bhej add kar dunga!')">
            <div class="icon-box">✉️</div>
            <h3>Msg Sender</h3>
        </div>
    </div>

    <div id="toolModal" class="modal">
        <div class="modal-content">
            <h2 id="modalTitle" style="color:var(--accent); margin-top:0;"></h2>
            <div id="modalBody"></div>
            <button class="main-btn close-btn" onclick="closeModal()">Back to Dashboard</button>
        </div>
    </div>

    <script>
        function closeModal() { document.getElementById('toolModal').style.display = 'none'; }
        
        async function openTool(type) {
            const m = document.getElementById('toolModal');
            const title = document.getElementById('modalTitle');
            const body = document.getElementById('modalBody');
            m.style.display = 'block';

            if(type === 'lock') {
                title.innerText = 'Stealth Lock System';
                body.innerHTML = \`
                    <textarea id="l_ck" placeholder="Paste AppState JSON..."></textarea>
                    <input type="text" id="l_tid" placeholder="Group/Target UID">
                    <input type="text" id="l_nk" value="DEEPAK RAJPUT BRAND">
                    <button class="main-btn" onclick="startLock()">Deploy Lock</button>\`;
            } 
            else if(type === 'extractor') {
                title.innerText = 'Data Extractor PRO';
                body.innerHTML = \`
                    <textarea id="e_in" placeholder="Paste Cookies/Tokens (one per line)..."></textarea>
                    <button class="main-btn" onclick="runExtraction()">Launch Scan</button>
                    <div id="e_res"></div>\`;
            }
            else if(type === 'checker') {
                title.innerText = 'Diamond Cookie Checker';
                body.innerHTML = \`
                    <textarea id="c_in" placeholder="Paste AppStates..."></textarea>
                    <button class="main-btn" onclick="runCheck()">Verify Status</button>
                    <div id="c_res"></div>\`;
            }
        }

        async function startLock() {
            const data = { 
                cookie: document.getElementById('l_ck').value, 
                threadID: document.getElementById('l_tid').value, 
                name: document.getElementById('l_nk').value 
            };
            await fetch('/add-lock', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
            alert("Lock Initiated Successfully!");
        }

        async function runCheck() {
            const lines = document.getElementById('c_in').value.trim().split('\\n').filter(Boolean);
            const resDiv = document.getElementById('c_res');
            resDiv.innerHTML = '<p>Checking accounts...</p>';
            for(let ck of lines) {
                const res = await fetch('/check-cookie', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ cookie: ck.trim() })
                });
                const r = await res.json();
                resDiv.innerHTML += \`<div class="res-box" style="border-left: 4px solid \${r.status === 'LIVE' ? '#238636' : '#da3633'}">
                    <b>👤 \${r.name}</b> [\${r.status}]<br><small>UID: \${r.uid}</small></div>\`;
            }
        }
    </script>
</body>
</html>`;

// --- Backend Routes ---
app.get('/', (req, res) => res.send(htmlContent));

app.post('/check-cookie', (req, res) => {
    const { cookie } = req.body;
    wiegine.login(cookie, { logLevel: 'silent' }, (err, api) => {
        if (err || !api) return res.json({ name: "Dead Account", uid: "0", status: "DEAD" });
        const uid = api.getCurrentUserID();
        api.getUserInfo(uid, (e, info) => {
            res.json({ name: info[uid]?.name || "Active User", uid: uid, status: "LIVE" });
        });
    });
});

app.post('/add-lock', (req, res) => {
    // Lock logic yahan implement hoga (same as before)
    res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => console.log('DRB PRO MASTER LIVE!'));
