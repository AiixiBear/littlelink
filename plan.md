# Portal redesign plan

## Design

採用「白底資訊卡片」：淡水藍頁面背景、白色內容區塊、清楚的細邊框、單一水藍色主按鈕與少量粉色 focus 狀態。Nene 圖片與 YouTube 影片作為內容流中的一般媒體卡片，不再作為背景或浮動特效。

## Implementation

- 保留 Astro static output、多語系路由與 `locales.ts` 資料來源。
- 將首頁拆成 ProfileHeader、InfoCards 與 PortalLinks 元件。
- 用 `portal.css` 取代首頁的多份互相覆蓋 CSS。
- 移除首頁對背景圖片、毛玻璃、櫻花動畫、浮動分享按鈕與 Material Symbols 的依賴。
- 將頭像複製至 `static/images/avatar.webp`，減少首頁必要的跨網域圖片請求。
- 保留語言選擇與 Discord 複製功能，但使用簡單 fallback。

## Acceptance

- 三個語言路由仍可由 `getStaticPaths()` 產生。
- 首頁依序呈現身份、快速入口、資訊卡、Nene 圖片、YouTube 影片與社群連結。
- 不使用 CSS 背景圖片、`backdrop-filter`、`background-attachment` 或櫻花動畫。
- 404 頁面使用同一套簡潔色彩方向。
- `main` 不修改；所有變更只發生在 `refactor/portal-redesign`。
