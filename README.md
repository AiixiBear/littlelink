# LittleLink

## 說明

這是 [Aiixi Bear 的入口網站](https://go.aiixi.cc/) 的開放原始碼 repo。

網站使用 Astro 產生靜態 HTML，頁面樣式與互動仍以 HTML、CSS 和 JavaScript 為主。

本專案基於 [MIT License](LICENSE.md) 條款開源，您可以免費使用、修改、分發及進行商業化利用。

**請注意： 本專案的裡面出現 Aiixi Bear 的圖示（Icon）、名稱不在授權範圍內，請勿將其用於您的專案或衍生作品中。**

**本網站不擁有遊戲內任何素材的版權，一切版權皆歸於其合法擁有者，包括但不限於Sega、Colorful Palette和Crypton。本網站的 `images/nene1.webp` `images/nene2.webp` 僅作為背景圖使用，無任何其他用途。**

## Cloudflare Pages 組建組態設定

- Framework 預設：`Astro`

- 組建命令：`./build.sh`

- 組建輸出目錄：`dist`

本機開發：

```sh
npm install
npm run dev
```

本專案需要 Node.js `22.19.0` 或更新版本。

Cloudflare Pages 若未自動讀取 `.nvmrc`，請將 `NODE_VERSION` 環境變數設為 `22.19.0`。

正式建置請使用 `./build.sh`，它會以 Astro 產生頁面、使用 js-beautify 格式化輸出的 HTML，再替換部署資訊。網站原始靜態資產位於 `static/`，Astro 會將其複製到輸出目錄。Astro 的匿名遙測已停用（`build.sh` 與 npm scripts 都設了 `ASTRO_TELEMETRY_DISABLED=1`），建置時不會回傳使用數據。

## 專案結構

- `src/pages/`：各語言頁面與 404 頁；目錄對應網站 URL。
- `src/layouts/`：共用文件版型、SEO 標籤與頁尾。
- `src/content/home/*.yaml`：首頁文案的 Content Collection，一個語言一個檔案，結構由 `src/content.config.ts` 的 schema 驗證。改文字時只改對應語言的 YAML 檔。
- `src/content/inspiration.yaml`：靈感區塊的 Content Collection，單一檔案。要新增圖片或 YouTube 嵌入，只要在這個檔案最後多貼一段（範例寫在檔案頂部註解裡）：圖片先把檔案放進 `static/images/`，再寫 `type: image`＋`src`／`alt`／`caption`；影片寫 `type: youtube`＋`videoId`（可貼完整網址）／`title`。顯示順序由每筆的 `order` 數字決定（間隔 10 方便中間插入），欄位寫錯或 `id` 重複會讓建置失敗，不會上線壞掉的區塊。
- `src/content/links.yaml`：所有入口／社群連結的 Content Collection，單一檔案。要新增連結，只要在這個檔案多貼一段（範例寫在檔案頂部註解裡）：`group: website` 會出現在上方快速傳送門，`group: social` 會出現在下方社群清單（需附 `static/images/icons/` 裡的 icon 檔名）；顯示順序同樣由 `order` 數字決定；`label` 可寫單一字串或三語物件；社群連結加 `copy: 要複製的文字` 就會變成點擊複製（Discord 用法）。
- `src/data/`：語言路徑、社群連結等與語言無關的共用資料。
- `static/`：CSS、圖片、JavaScript 及 Cloudflare Pages 靜態設定。
- `dist/`：建置產物，不要直接修改。