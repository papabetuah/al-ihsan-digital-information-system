#!/usr/bin/env python3
import json, os, urllib.request

BASE="https://app.yodeck.com/api/v2"
TOKEN=os.environ["YODECK_API_TOKEN"].strip()
WORKSPACE=257599
HEADERS={"Authorization":f"Token alihsan:{TOKEN}","Accept":"application/json"}

def get(path):
    req=urllib.request.Request(BASE+path,headers=HEADERS)
    with urllib.request.urlopen(req,timeout=60) as r:
        return json.loads(r.read())

media=get(f"/media?limit=100&workspace={WORKSPACE}&ordering=name").get("results",[])
out=[]
for m in media:
    if (m.get("media_origin") or {}).get("type")!="audio":
        continue
    status=get(f"/media/{m['id']}/status")
    detail=get(f"/media/{m['id']}")
    out.append({
        "id":m.get("id"),
        "name":m.get("name"),
        "list_status":m.get("status"),
        "status_endpoint":status,
        "last_uploaded":detail.get("last_uploaded"),
        "file_extension":detail.get("file_extension"),
        "default_duration":detail.get("default_duration"),
        "media_origin":detail.get("media_origin"),
        "arguments":detail.get("arguments"),
        "thumbnail_url":detail.get("thumbnail_url"),
    })

with open("yodeck-media-probe.json","w") as f:
    json.dump(out,f,ensure_ascii=False,indent=2)
print(json.dumps(out[:5],ensure_ascii=False,indent=2))
