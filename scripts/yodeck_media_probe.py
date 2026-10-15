#!/usr/bin/env python3
import json, os, urllib.request

BASE="https://app.yodeck.com/api/v2"
TOKEN=os.environ["YODECK_API_TOKEN"].strip()
WORKSPACE=257599
HEADERS={"Authorization":f"Token alihsan:{TOKEN}","Accept":"application/json"}

req=urllib.request.Request(f"{BASE}/media?limit=100&workspace={WORKSPACE}&ordering=name",headers=HEADERS)
with urllib.request.urlopen(req,timeout=60) as r:
    media=json.loads(r.read()).get("results",[])

out=[]
for m in media:
    if (m.get("media_origin") or {}).get("type")!="audio":
        continue
    out.append({
        "id":m.get("id"),
        "name":m.get("name"),
        "status":m.get("status"),
        "last_uploaded":m.get("last_uploaded"),
        "file_extension":m.get("file_extension"),
        "default_duration":m.get("default_duration"),
        "media_origin":m.get("media_origin"),
        "arguments":m.get("arguments"),
        "thumbnail_url":m.get("thumbnail_url"),
    })

with open("yodeck-media-probe.json","w") as f:
    json.dump(out,f,ensure_ascii=False,indent=2)
print(json.dumps(out[:10],ensure_ascii=False,indent=2))
