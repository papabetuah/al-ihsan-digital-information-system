#!/usr/bin/env python3
import json, os, pathlib, urllib.request
from urllib.parse import urlencode

BASE="https://app.yodeck.com/api/v2"
WORKSPACE=257599
TOKEN=os.environ["YODECK_API_TOKEN"]
HEADERS={"Authorization":f"Token alihsan:{TOKEN}","Accept":"application/json"}
OUT=pathlib.Path("yodeck-workspace")
OUT.mkdir(exist_ok=True)

def get(path, params=None):
    url=f"{BASE}/{path}"
    if params:
        url += "?" + urlencode(params)
    req=urllib.request.Request(url,headers=HEADERS)
    with urllib.request.urlopen(req,timeout=30) as r:
        return json.loads(r.read())

common={"limit":100,"workspace":WORKSPACE,"ordering":"name"}
payloads={
    "media":get("media",common),
    "playlists":get("playlists",common),
    "schedules":get("schedules",common),
    "screens":get("screens",{"limit":100}),
}

for name,payload in payloads.items():
    (OUT/f"{name}.json").write_text(json.dumps(payload,ensure_ascii=False,indent=2))

summary={
    "workspace_id":WORKSPACE,
    "media_count":payloads["media"].get("count",0),
    "playlist_count":payloads["playlists"].get("count",0),
    "schedule_count":payloads["schedules"].get("count",0),
    "screen_count":payloads["screens"].get("count",0),
    "media":[{"id":x.get("id"),"name":x.get("name"),"type":(x.get("media_origin") or {}).get("type")} for x in payloads["media"].get("results",[])],
    "playlists":[{"id":x.get("id"),"name":x.get("name")} for x in payloads["playlists"].get("results",[])],
    "schedules":[{"id":x.get("id"),"name":x.get("name")} for x in payloads["schedules"].get("results",[])],
}
(OUT/"summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2))
print(json.dumps(summary,ensure_ascii=False))
