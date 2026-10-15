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
document.addEventListener('DOMContentLoaded', () => {
  const shareBtn = document.getElementById('floating-share-btn');

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      // 優先使用原生 Web Share API
      if (navigator.share) {
        try {
          await navigator.share({
            title: document.title,
            text: '歡迎來到 Aiixi Bear 的入口網站！',
            url: window.location.href,
          });
        } catch (err) {
          // 使用者取消分享時不處理錯誤
          if (err.name !== 'AbortError') {
            console.error('分享失敗:', err);
          }
        }
      } else {
        // 不支援 Web Share API 時（如部分桌上型瀏覽器），降級為複製網址
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert('已複製網站連結至剪貼簿！');
        } catch (err) {
          console.error('複製失敗:', err);
        }
      }
    });
  }
});

function setGreetingEn() {
  const hour = new Date().getHours();
  let greetingText = '';

  if (hour >= 5 && hour < 12) {
    greetingText = 'Good morning!';
  } else if (hour >= 12 && hour < 17) {
    greetingText = 'Good afternoon! Have you had lunch yet?';
  } else if (hour >= 17 && hour < 23) {
    greetingText = 'Good evening! Hope you have a wonderful night!';
  } else {
    // 處理 23 點與 0~4 點
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour >= 12 ? 'PM' : 'AM';
    const timeLabel = hour === 23 ? 'late at night' : 'early morning';

    greetingText = `It is already ${displayHour} ${period} (${timeLabel}). Make sure to get some rest!`;
  }

  const greetingEl = document.getElementById('greeting');
  if (greetingEl) {
    greetingEl.textContent = greetingText;
  }
}

document.addEventListener('DOMContentLoaded', setGreetingEn);

function updateTime() {
  const el = document.getElementById('aiixi-time');
  if (!el) return;

  const formatter = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Taipei',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  el.textContent = formatter.format(new Date());
}

// 載入時立即執行並設定每秒自動更新
updateTime();
setInterval(updateTime, 1000);