# LittleLink

Cloudflare組建命令:
```
python3 htmltojson.py index.html --inject && sed -i "s/COMMIT_HASH_PLACEHOLDER/$(echo $CF_PAGES_COMMIT_SHA | cut -c1-7)/g" index.html
```