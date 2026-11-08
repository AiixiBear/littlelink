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