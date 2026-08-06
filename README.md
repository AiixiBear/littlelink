# LittleLink

Cloudflare Pages組建命令:
```bash
sed -i "s#AIIXI_TZ#$(sed -n '1p' TZ.txt)#g" index.html && sed -i "s#TZ_NAME#$(sed -n '2p' TZ.txt)#g" index.html && python3 htmltojson.py index.html --inject && sed -i "s/COMMIT_HASH_PLACEHOLDER/$(echo $CF_PAGES_COMMIT_SHA | cut -c1-7)/g" index.html && sed -i "s/COMMIT_HASH_PLACEHOLDER/$(echo $CF_PAGES_COMMIT_SHA | cut -c1-7)/g" 404.html
```