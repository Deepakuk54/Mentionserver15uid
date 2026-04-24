const express = require('express');
const wiegine = require('fca-mafiya');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 10000;
app.use(express.json());

// Persistence & Database
let activeLocks = new Map();
const DB_FILE = path.join('/tmp', 'drb_master_v5.json');
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify([]));

// --- Fix: Tera Raw String Cookie System ---
function getLoginData(input) {
    input = input.trim();
    if (input.startsWith('[')) return { appState: JSON.parse(input) };
    
    // Raw String to AppState Array conversion
    const parsed = input.split(';').map(i => {
        const [name, ...value] = i.split('=');
        if (!name || !value.length) return null;
        return {
            key: name.trim(),
            value: value.join('=').trim(),
            domain: "facebook.com",
            path: "/",
            hostOnly: false
        };
    }).filter(Boolean);
    return { appState: parsed };
}

// --- PROFESSIONAL UI DASHBOARD ---
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DRB MASTER - PRO PANEL</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root { --bg: #080a0f; --card: #11141d; --border: #1f2633; --accent: #00d2ff; --green: #00ff88; --red: #ff4b2b; --text: #e0e6ed; }
        body { background: var(--bg); color: var(--text); font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { font-size: 24px; background: linear-gradient(to right, #00d2ff, #3a7bd5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; text-transform: uppercase; font-weight: 900; letter-spacing: 1.5px; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; width: 100%; max-width: 500px; }
        .tool-card { background: var(--card); border: 1px solid var(--border); border-radius: 15px; padding: 25px 10px; text-align: center; cursor: pointer; transition: 0.3s; }
        .tool-card:hover { border-color: var(--accent); transform: translateY(-5px); box-shadow: 0 8px 20px rgba(0,210,255,0.2); }
        .tool-card i { font-size: 35px; margin-bottom: 10px; display: block; color: var(--accent); }
        .tool-card h3 { font-size: 12px; margin: 0; color: #fff; text-transform: uppercase; }
        
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); backdrop-filter: blur(10px); z-index: 1000; padding: 15px; box-sizing: border-box; overflow-y: auto; }
        .modal-content { background: var(--card); border: 1px solid var(--border); border-radius: 20px; max-width: 450px; margin: 30px auto; padding: 25px; border-top: 3px solid var(--accent); }
        
        textarea, input { width: 100%; background: #000; border: 1px solid var(--border); color: var(--green); padding: 12px; margin: 8px 0; border-radius: 10px; box-sizing: border-box; outline: none; font-family: monospace; font-size: 13px; }
        .btn-main { width: 100%; padding: 15px; background: linear-gradient(135deg, #00d2ff, #3a7bd5); color: white; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; margin-top: 10px; }
        .btn-copy { background: #333; color: var(--accent); border: 1px solid var(--accent); padding: 8px; width: 100%; border-radius: 8px; cursor: pointer; font-size: 11px; margin-top: 5px; }
        .btn-close { background: transparent; border: 1px solid var(--red); color: var(--red); margin-top: 10px; width: 100%; padding: 10px; border-radius: 10px; cursor: pointer; font-size: 12px; }
        
        .res-item { background: #000; border: 1px solid var(--border); padding: 10px; border-radius: 8px; margin-top: 8px; text-align: left; font-size: 12px; border-left: 3px solid var(--accent); position: relative; word-break: break-all; }
        .stop-btn { position: absolute; right: 10px; top: 10px; background: var(--red); color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Deepak Rajput Brand</h1>
        <p style="color:#5c6b84; font-size: 11px;">Advanced Master Dashboard V5.1</p>
    </div>
    
    <div class="grid">
        <div class="tool-card" onclick="openTool('lock')"><i class="fa-solid fa-user-lock"></i><h3>Nickname Lock</h3></div>
        <div class="tool-card" onclick="openTool('extract')"><i class="fa-solid fa-satellite-dish"></i><h3>UID Extractor</h3></div>
        <div class="tool-card" onclick="openTool('check')"><i class="fa-solid fa-vial-circle-check"></i><h3>Cookie Check</h3></div>
        <div class="tool-card" onclick="alert('Coming Soon!')"><i class="fa-solid fa-paper-plane"></i><h3>Msg Sender</h3></div>
    </div>

    <div id="modal" class="modal">
        <div class="modal-content">
            <h2 id="mTitle" style="color:var(--accent); margin:0 0 15px 0; text-align:center; font-size: 18px;"></h2>
            <div id="mBody"></div>
            <button class="btn-close" onclick="closeModal()">BACK TO MENU</button>
        </div>
    </div>

    <script>
        let aliveCookies = [];
        function closeModal() { document.getElementById('modal').style.display = 'none'; }
        async function openTool(type) {
            const m = document.getElementById('modal');
            const title = document.getElementById('mTitle');
            const body = document.getElementById('mBody');
            m.style.display = 'block';

            if(type === 'lock') {
                title.innerText = 'STEALTH NICKNAME LOCK';
                body.innerHTML = \`<textarea id="l_ck" placeholder="Paste AppState JSON or Normal Cookie" rows="5"></textarea>
                <input id="l_tid" placeholder="Group Thread ID">
                <input id="l_nk" value="DEEPAK RAJPUT BRAND">
                <button class="btn-main" onclick="startLock()">ACTIVATE LOCK (3s)</button>
                <div id="activeLocks" style="margin-top:15px;"></div>\`;
                loadLocks();
            } else if(type === 'extract') {
                title.innerText = 'PRO UID EXTRACTOR';
                body.innerHTML = \`<textarea id="e_ck" placeholder="Paste AppState/Cookie..."></textarea>
                <button class="btn-main" onclick="runExtract()">SCAN GROUPS</button>
                <div id="e_res" style="margin-top:15px;"></div>\`;
            } else if(type === 'check') {
                title.innerText = 'PREMIUM CHECKER';
                aliveCookies = [];
                body.innerHTML = \`<textarea id="c_ck" placeholder="One AppState/Cookie per line..." rows="6"></textarea>
                <button class="btn-main" onclick="runCheck()">START CHECK</button>
                <button class="btn-copy" onclick="copyAlive()">COPY ALL ALIVE COOKIES</button>
                <div id="c_res" style="margin-top:15px;"></div>\`;
            }
        }

        function copyAlive() {
            if(aliveCookies.length === 0) return alert("No live cookies found!");
            navigator.clipboard.writeText(aliveCookies.join('\\n'));
            alert("Copied " + aliveCookies.length + " live cookies!");
        }

        async function loadLocks() {
            const r = await fetch('/list-locks').then(res => res.json());
            const div = document.getElementById('activeLocks');
            if(div) div.innerHTML = r.map(t => \`<div class="res-item">\${t.threadID}<button class="stop-btn" onclick="stopLock('\${t.id}')">STOP</button></div>\`).join('');
        }

        async function startLock() {
            const d = { cookie: document.getElementById('l_ck').value, threadID: document.getElementById('l_tid').value, name: document.getElementById('l_nk').value };
            await fetch('/add-lock', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(d) });
            alert("Lock Started! 3s interval active."); loadLocks();
        }

        async function stopLock(id) {
            await fetch('/stop-lock', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id}) });
            loadLocks();
        }

        async function runExtract() {
            const resDiv = document.getElementById('e_res'); resDiv.innerHTML = 'Extracting...';
            const r = await fetch('/extract-uid', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ck: document.getElementById('e_ck').value }) }).then(res => res.json());
            if(r.success) {
                resDiv.innerHTML = \`<b>\${r.name}</b><br>\` + r.groups.map(g => \`<div class="res-item">\${g.name} <br> \${g.id}</div>\`).join('');
            } else { resDiv.innerHTML = 'Login Failed!'; }
        }

        async function runCheck() {
            const lines = document.getElementById('c_ck').value.trim().split('\\n').filter(Boolean);
            const resDiv = document.getElementById('c_res'); resDiv.innerHTML = 'Checking...';
            for(let ck of lines) {
                const r = await fetch('/check-cookie', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ck }) }).then(res => res.json());
                if(r.status === 'LIVE') aliveCookies.push(ck);
                resDiv.innerHTML += \`<div class="res-item" style="border-left-color:\${r.status==='LIVE'?'var(--green)':'var(--red)'}">\${r.name} - \${r.status}</div>\`;
            }
        }
    </script>
</body>
</html>`;

// --- BACKEND (fca-mafiya Logic) ---

function runLockBot(task) {
    if (activeLocks.has(task.id)) return;
    try {
        const loginData = getLoginData(task.cookie);
        wiegine.login(loginData, { logLevel: 'silent', forceLogin: true }, (err, api) => {
            if (err || !api) return;
            api.setOptions({ listenEvents: true, selfListen: false });

            // [INSTANT LOCK - 3s Delay]
            api.getThreadInfo(task.threadID, (err, info) => {
                if (!err && info) {
                    const nickMap = info.nicknames || {};
                    info.participantIDs.forEach((uid, i) => {
                        if (nickMap[uid] !== task.name) {
                            setTimeout(() => {
                                if (activeLocks.has(task.id)) api.changeNickname(task.name, task.threadID, uid, () => {});
                            }, i * 3000); // 3 Sec Gap
                        }
                    });
                }
            });

            const stopListen = api.listenMqtt((err, event) => {
                if (event?.logMessageType === "log:user-nickname" && event.logMessageData.nickname !== task.name && event.threadID === task.threadID) {
                    api.changeNickname(task.name, task.threadID, event.logMessageData.participant_id, () => {});
                }
            });
            activeLocks.set(task.id, { ...task, stopFunc: stopListen });
        });
    } catch (e) { console.log("Login Error"); }
}

app.get('/', (req, res) => res.send(htmlContent));
app.get('/list-locks', (req, res) => res.json(Array.from(activeLocks.values()).map(t => ({ id: t.id, threadID: t.threadID }))));

app.post('/add-lock', (req, res) => {
    const id = "LOCK-" + Date.now();
    const newTask = { ...req.body, id };
    const db = JSON.parse(fs.readFileSync(DB_FILE)); db.push(newTask); fs.writeFileSync(DB_FILE, JSON.stringify(db));
    runLockBot(newTask); res.json({ success: true });
});

app.post('/stop-lock', (req, res) => {
    const { id } = req.body;
    if (activeLocks.has(id)) {
        const task = activeLocks.get(id);
        if (typeof task.stopFunc === 'function') task.stopFunc();
        activeLocks.delete(id);
        const db = JSON.parse(fs.readFileSync(DB_FILE)).filter(item => item.id !== id);
        fs.writeFileSync(DB_FILE, JSON.stringify(db));
    }
    res.json({ success: true });
});

app.post('/extract-uid', (req, res) => {
    try {
        wiegine.login(getLoginData(req.body.ck), { logLevel: 'silent' }, (err, api) => {
            if (err || !api) return res.json({ success: false });
            api.getThreadList(100, null, ["INBOX"], (err, list) => {
                const groups = (!err && list) ? list.filter(t => t.isGroup).map(g => ({ name: g.name || "Group", id: g.threadID })) : [];
                api.getUserInfo(api.getCurrentUserID(), (e, info) => res.json({ success: true, name: info[api.getCurrentUserID()]?.name || "OK", groups }));
            });
        });
    } catch(e) { res.json({ success: false }); }
});

app.post('/check-cookie', (req, res) => {
    try {
        wiegine.login(getLoginData(req.body.ck), { logLevel: 'silent' }, (err, api) => {
            if (err || !api) return res.json({ name: "Dead", status: "DEAD" });
            api.getUserInfo(api.getCurrentUserID(), (e, info) => res.json({ name: info[api.getCurrentUserID()]?.name || "Live", status: "LIVE" }));
        });
    } catch(e) { res.json({ name: "Invalid", status: "DEAD" }); }
});

const saved = JSON.parse(fs.readFileSync(DB_FILE));
saved.forEach((t, i) => setTimeout(() => runLockBot(t), i * 5000));

app.listen(PORT, () => console.log('DRB MASTER V5.1 LIVE!'));
