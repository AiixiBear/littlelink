# LittleLink

## 說明

這是 [Aiixi Bear的入口網站](https://go.aiixi.cc/) 的開放原始碼 repo。

這是基於 [sethcottle/littlelink](https://github.com/sethcottle/littlelink/) 進行修改的。

本專案基於 [MIT License](LICENSE.md) 條款開源，您可以免費使用、修改、分發及進行商業化利用。

**請注意： 本專案的圖示（Icon）、名稱及相關品牌標誌不在授權範圍內，請勿將其用於您的專案或衍生作品中。**

## Cloudflare Pages 組建命令
```bash
sed -i "s#AIIXI_TZ#$(sed -n '1p' TZ.txt)#g" index.html && sed -i "s#TZ_NAME#$(sed -n '2p' TZ.txt)#g" index.html && sed -i "s/COMMIT_HASH_PLACEHOLDER/$(echo $CF_PAGES_COMMIT_SHA | cut -c1-7)/g" index.html && sed -i "s/COMMIT_HASH_PLACEHOLDER/$(echo $CF_PAGES_COMMIT_SHA | cut -c1-7)/g" 404.html
```