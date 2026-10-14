#!/usr/bin/env python3
import json, os, pathlib, sys, urllib.request, urllib.error

BASE="https://app.yodeck.com/api/v2"
TOKEN=os.environ.get("YODECK_API_TOKEN","").strip()
if not TOKEN:
    raise SystemExit("YODECK_API_TOKEN is missing")

headers={
    "Authorization": f"Token alihsan:{TOKEN}",
    "Accept": "application/json",
}

out=pathlib.Path("yodeck-inventory")
out.mkdir(exist_ok=True)

endpoints={
    "media":"media?limit=100&ordering=name",
    "playlists":"playlists?limit=100&ordering=name",
    "schedules":"schedules?limit=100&ordering=name",
    "screens":"screens?limit=100",
}

summary={}
for name,path in endpoints.items():
    req=urllib.request.Request(f"{BASE}/{path}", headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw=r.read()
    except urllib.error.HTTPError as e:
        body=e.read().decode("utf-8","replace")
        print(f"{name}: HTTP {e.code}: {body[:800]}", file=sys.stderr)
        raise
    data=json.loads(raw)
    (out/f"{name}.json").write_text(json.dumps(data,ensure_ascii=False,indent=2))
    items=data.get("results", data if isinstance(data,list) else [])
    summary[name]={
        "count": data.get("count",len(items)) if isinstance(data,dict) else len(items),
        "items":[
            {
                "id":x.get("id"),
                "name":x.get("name"),
                "type":(x.get("media_origin") or {}).get("type") if isinstance(x,dict) else None,
            }
            for x in items
        ],
    }

(out/"summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2))
print(json.dumps({k:v["count"] for k,v in summary.items()},ensure_ascii=False))
