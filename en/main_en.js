const container = document.getElementById('sakura-container');

// 定義生成櫻花的函式 (核心工廠)
function createSakura(isInitial = false) {
    const sakura = document.createElement('div');
    sakura.classList.add('sakura');

    const size = Math.random() * 8 + 8;
    sakura.style.width = `${size}px`;
    sakura.style.height = `${size * 0.9}px`;
    
    // 水平位置
    sakura.style.left = `${Math.random() * 100}%`;
    
    // 如果是初始化，隨機決定它在垂直方向的位置，不要全部擠在頂端！
    const startTop = isInitial ? Math.random() * 100 : -5;
    sakura.style.top = `${startTop}vh`;
    
    const duration = Math.random() * 7 + 8;
    sakura.style.animationDuration = `${duration}s`;
    
    // 關鍵：如果不是剛生成的，就不要有延遲
    sakura.style.animationDelay = isInitial ? `-${Math.random() * duration}s` : '0s';

    container.appendChild(sakura);

    sakura.addEventListener('animationend', () => {
    sakura.remove();
    });
}

// 在初始化時，直接產生一批櫻花，並且讓它們處於隨機的飄落狀態
for (let i = 0; i < 40; i++) {
    createSakura(true); 
}

let lastTimestamp = 0;
let productionInterval = 100; // 初始生產間隔 (毫秒)

function startSakuraProduction(timestamp) {
    // 計算距離上次生產的時間差
    if (!lastTimestamp) lastTimestamp = timestamp;
    const elapsed = timestamp - lastTimestamp;

    // 當時間差達到設定的間隔時，生產一片新櫻花
    if (elapsed > productionInterval) {
    createSakura();
    lastTimestamp = timestamp;
    }

    // 請求瀏覽器在下一幀繼續執行生產線
    requestAnimationFrame(startSakuraProduction);
}

function adjustProductionRhythm() {
    const screenWidth = window.innerWidth;

    if (screenWidth > 1200) {
    // 寬螢幕：縮短間隔，生產更多櫻花
    productionInterval = 350;
    } else if (screenWidth > 768) {
    // 平板或大手機：適中
    productionInterval = 400;
    } else {
    // 一般手機：拉長間隔，確保流暢
    productionInterval = 500;
    }
}

// 設定初始節奏
adjustProductionRhythm();

// 啟動櫻花
requestAnimationFrame(startSakuraProduction);

// 當視窗大小改變時，動態調整生產節奏
window.addEventListener('resize', adjustProductionRhythm);
const LANYARD_USER_ID = '982547292529774612';
const presenceCard = document.getElementById('discord-presence');
const presenceIndicator = document.getElementById('presence-indicator');
const presenceStatus = document.getElementById('presence-status');
const activitySection = document.getElementById('discord-activity');
const activityList = document.getElementById('activity-list');
const spotifySection = document.getElementById('spotify-activity');
let presenceSocket;
let reconnectTimer;
let currentSpotifyTimestamps;

const statusNames = { online: 'online', idle: 'idle', dnd: 'dnd', offline: 'offline' };
const activityTypes = [
  'Playing',      // 0
  'Streaming',    // 1
  'Listening to', // 2
  'Watching',     // 3
  'Status:',      // 4 (Custom Status)
  'Competing in'  // 5
];
function activityImage(activity) {
    const image = activity.assets && activity.assets.large_image;
    if (!image) return '';
    if (image.startsWith('mp:external/')) return `https://media.discordapp.net/external/${image.slice(12)}`;
    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${image}.png`;
}

function formatTime(milliseconds) {
    const seconds = Math.max(0, Math.floor(milliseconds / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function renderActivities(activities) {
    const visibleActivities = activities.filter(activity => activity.name !== 'Spotify');
    activityList.replaceChildren();
    activitySection.hidden = visibleActivities.length === 0;
    visibleActivities.forEach(activity => {
    const item = document.createElement('article');
    item.className = 'presence-activity';
    const imageUrl = activityImage(activity);
    if (imageUrl) {
        const image = document.createElement('img');
        image.src = imageUrl;
        image.alt = '';
        image.className = 'activity-image';
        item.append(image);
    }
    const details = document.createElement('div');
    details.className = 'activity-details';
    const title = document.createElement('strong');
    title.textContent = `${activityTypes[activity.type] || 'Activity'} ${activity.name || 'untitled activity'}`;
    details.append(title);
    [activity.details, activity.state].filter(Boolean).forEach(text => {
        const line = document.createElement('span');
        line.textContent = text;
        details.append(line);
    });
    if (activity.timestamps && activity.timestamps.start) {
        const elapsed = document.createElement('span');
        elapsed.className = 'activity-time';
        elapsed.dataset.started = activity.timestamps.start;
        if (activity.timestamps.end) elapsed.dataset.ended = activity.timestamps.end;
        details.append(elapsed);
        if (activity.type === 2 && activity.timestamps.end > activity.timestamps.start) {
        const progress = document.createElement('div');
        progress.className = 'activity-progress';
        progress.setAttribute('role', 'progressbar');
        progress.setAttribute('aria-label', '音樂活動進度');
        progress.setAttribute('aria-valuemin', '0');
        progress.setAttribute('aria-valuemax', '100');
        const progressBar = document.createElement('span');
        progress.append(progressBar);
        details.append(progress);
        elapsed.dataset.progress = 'true';
        elapsed.dataset.progressBar = 'true';
        progressBar.dataset.activityProgress = 'true';
        }
    }
    const buttonUrls = activity.metadata && activity.metadata.button_urls || [];
    if ((activity.buttons || []).length && buttonUrls.length) {
        const actions = document.createElement('div');
        actions.className = 'activity-actions';
        activity.buttons.forEach((label, index) => {
        if (!buttonUrls[index]) return;
        const link = document.createElement('a');
        link.className = 'presence-link';
        link.href = buttonUrls[index];
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = label;
        actions.append(link);
        });
        details.append(actions);
    }
    item.append(details);
    activityList.append(item);
    });
    updateActivityProgress();
}

function renderSpotify(spotify) {
    spotifySection.hidden = !spotify;
    currentSpotifyTimestamps = spotify && spotify.timestamps;
    if (!spotify) return;
    document.getElementById('spotify-song').textContent = spotify.song;
    document.getElementById('spotify-artist').textContent = spotify.artist;
    document.getElementById('spotify-album').textContent = spotify.album;
    const art = document.getElementById('spotify-art');
    art.src = spotify.album_art_url;
    art.hidden = false;
    const link = document.getElementById('spotify-link');
    link.href = `https://open.spotify.com/track/${spotify.track_id}`;
    link.hidden = false;
    updateSpotifyProgress(currentSpotifyTimestamps);
}

function updateSpotifyProgress(timestamps) {
    if (!timestamps) return;
    const elapsed = Date.now() - timestamps.start;
    const duration = timestamps.end - timestamps.start;
    const percentage = Math.min(100, Math.max(0, elapsed / duration * 100));
    document.getElementById('spotify-progress-bar').style.width = `${percentage}%`;
    document.getElementById('spotify-time').textContent = `${formatTime(elapsed)} / ${formatTime(duration)}`;
}

function updateActivityProgress() {
    document.querySelectorAll('.activity-time[data-progress="true"]').forEach(element => {
    const start = Number(element.dataset.started);
    const end = Number(element.dataset.ended);
    const duration = end - start;
    const elapsed = Math.min(duration, Math.max(0, Date.now() - start));
    const percentage = elapsed / duration * 100;
    const progressBar = element.parentElement.querySelector('[data-activity-progress]');
    element.textContent = `${formatTime(elapsed)} / ${formatTime(duration)}`;
    progressBar.style.width = `${percentage}%`;
    progressBar.parentElement.setAttribute('aria-valuenow', String(Math.round(percentage)));
    });
}

function renderPresence(data) {
    const status = data && data.discord_status || 'offline';
    
    presenceCard.hidden = false;
    presenceIndicator.dataset.status = status;

    if (status === 'offline') {
    presenceStatus.textContent = '這個功能沒有壞掉但是目前無法顯示';
    presenceIndicator.hidden = true;
    
    activitySection.hidden = true;
    spotifySection.hidden = true;
    currentSpotifyTimestamps = null;
    return;
    }

    presenceStatus.textContent = statusNames[status] || status;
    presenceIndicator.hidden = false;
    renderActivities(data.activities || []);
    renderSpotify(data.spotify);
}

async function loadPresence() {
    if (!/^\d{17,20}$/.test(LANYARD_USER_ID)) return;
    try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${LANYARD_USER_ID}`);
    if (response.ok) renderPresence((await response.json()).data);
    } catch (error) {
    console.warn('Lanyard API 無法連線', error);
    }
}

function connectPresence() {
    if (!/^\d{17,20}$/.test(LANYARD_USER_ID)) return;
    presenceSocket = new WebSocket('wss://api.lanyard.rest/socket');
    presenceSocket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.op === 1) {
        presenceSocket.send(JSON.stringify({ op: 2, d: { subscribe_to_id: LANYARD_USER_ID } }));
    } else if (message.op === 0 && (message.t === 'INIT_STATE' || message.t === 'PRESENCE_UPDATE')) {
        renderPresence(message.d);
    }
    });
    presenceSocket.addEventListener('close', () => {
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connectPresence, 5000);
    });
}

loadPresence();
connectPresence();
setInterval(() => {
    updateSpotifyProgress(currentSpotifyTimestamps);
    document.querySelectorAll('.activity-time:not([data-progress="true"])').forEach(element => {
    element.textContent = `Time elapsed: ${formatTime(Date.now() - Number(element.dataset.started))}`;
    });
    updateActivityProgress();
}, 1000);

Promise.all([
fetch('/cdn-cgi/trace').then(res => res.text()),
fetch('cloudflare_nodes_en.json').then(res => res.json())
])
.then(([traceText, nodesData]) => {
    // 解析 /cdn-cgi/trace 文字資料
    const info = {};
    traceText.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key) info[key] = val.trim();
    });

    const colo = info.colo;
    if (!colo) {
    document.getElementById('trace-info').textContent = 'CDN：不存在';
    return;
    }

    // 依據 colo 機房代碼尋找對應的城市名稱
    const cityName = nodesData[colo] || '未知城市';
    document.getElementById('trace-info').textContent = `CDN : ${cityName} (${colo})`;
})
.catch(err => {
    console.error('無法抓取 Cloudflare trace 或節點資料', err);
    document.getElementById('trace-info').textContent = 'CDN：錯誤';
});
console.info("大便")
document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', function (event) {
    event.preventDefault(); // 安全防護：阻止預設跳轉

    const idToCopy = this.getAttribute('data-id');      // 取得實際帳號
    const platformLabel = this.getAttribute('data-label'); // 取得平台名稱

    navigator.clipboard.writeText(idToCopy).then(() => {
        alert(`已複製 ${platformLabel} ID！`);
    }).catch(err => {
        console.error(`複製 ${platformLabel} 失敗: `, err);
        alert(`複製失敗`);
    });
    });
});
/*
// 輔助函式：解析長時區偏移量字串並轉換為分鐘數
function parseOffsetToMinutes(tzStr) {
    if (!tzStr || tzStr === 'GMT' || tzStr === 'UTC') return 0;
    const match = tzStr.match(/GMT([+-])(\d+):?(\d+)?/);
    if (!match) return 0;
    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = match[3] ? parseInt(match[3], 10) : 0;
    return sign * (hours * 60 + minutes);
}

// 雙時區時鐘與日期更新主程式
function updateClocks() {
    const now = new Date();
    const bearTimeZone = 'AIIXI_TZ';
    let userTimeZone = '';

    // 1. 處理使用者時區、日期（含星期）與時間
    try {
    userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const userDateStr = now.toLocaleDateString('zh-TW', {
        timeZone: userTimeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'long'
    });
    document.getElementById('user-date').textContent = userDateStr;

    const userTimeStr = now.toLocaleTimeString('zh-TW', {
        timeZone: userTimeZone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('user-time').textContent = userTimeStr;
    } catch (e) {
    document.getElementById('user-date').textContent = now.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long' });
    document.getElementById('user-time').textContent = now.toLocaleTimeString('zh-TW', { hour12: false });
    }

    // 2. 處理愛希熊的時區日期（含星期）與時間
    try {
    const bearDateStr = now.toLocaleDateString('zh-TW', {
        timeZone: bearTimeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'long'
    });
    document.getElementById('bear-date').textContent = bearDateStr;

    const bearTimeStr = now.toLocaleTimeString('zh-TW', {
        timeZone: bearTimeZone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('bear-time').textContent = bearTimeStr;
    } catch (e) {
    console.error('愛希熊時區時間計算異常', e);
    }

    // 3. 計算雙方時差標籤
    try {
    if (userTimeZone && bearTimeZone && bearTimeZone !== 'TZ_' + 'HERE') {
        const formatterUser = new Intl.DateTimeFormat('en-US', { timeZone: userTimeZone, timeZoneName: 'longOffset' });
        const formatterBear = new Intl.DateTimeFormat('en-US', { timeZone: bearTimeZone, timeZoneName: 'longOffset' });
        
        const partsUser = formatterUser.formatToParts(now);
        const partsBear = formatterBear.formatToParts(now);
        
        const tzStrUser = partsUser.find(p => p.type === 'timeZoneName').value;
        const tzStrBear = partsBear.find(p => p.type === 'timeZoneName').value;

        const diffMinutes = parseOffsetToMinutes(tzStrBear) - parseOffsetToMinutes(tzStrUser);
        const diffHours = diffMinutes / 60;

        const diffTag = document.getElementById('time-diff-tag');
        if (diffHours === 0) {
        diffTag.textContent = '(與您相同)';
        } else if (diffHours > 0) {
        diffTag.textContent = `(比您快 ${diffHours} 小時)`;
        } else {
        diffTag.textContent = `(比您慢 ${Math.abs(diffHours)} 小時)`;
        }
    }
    } catch (err) {
    console.error('時差標籤動態計算失敗', err);
    }
}

// 精準對齊秒數跳動的計時器
function tick() {
    updateClocks();
    const delay = 1000 - Date.now() % 1000;
    setTimeout(tick, delay);
}

// 立即執行，無載入延遲
tick();
*/