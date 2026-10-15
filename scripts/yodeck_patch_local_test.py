#!/usr/bin/env python3
import json, os, urllib.request, urllib.error

BASE="https://app.yodeck.com/api/v2"
TOKEN=os.environ["YODECK_API_TOKEN"].strip()
ID=37267469
DRIVE_ID="1Fd9FM45_D56XSwkN0LlvahOjTc_Sd0Bv"
HEADERS={"Authorization":f"Token alihsan:{TOKEN}","Accept":"application/json","Content-Type":"application/json"}

def req(method,path,payload=None):
    data=None if payload is None else json.dumps(payload).encode()
    r=urllib.request.Request(BASE+path,data=data,headers=HEADERS,method=method)
    try:
        with urllib.request.urlopen(r,timeout=60) as h:
            raw=h.read()
            return {"ok":True,"status":h.status,"data":json.loads(raw) if raw else {}}
    except urllib.error.HTTPError as e:
        body=e.read().decode("utf-8","replace")
        return {"ok":False,"status":e.code,"body":body}

report={}
report["before"]=req("GET",f"/media/{ID}")
report["patch"]=req("PATCH",f"/media/{ID}",{
    "media_origin":{"type":"audio","source":"local","format":None}
})
report["after_patch"]=req("GET",f"/media/{ID}")

if report["patch"]["ok"]:
    src=f"https://drive.usercontent.google.com/download?id={DRIVE_ID}&export=download&confirm=t"
    with urllib.request.urlopen(urllib.request.Request(src,headers={"User-Agent":"Mozilla/5.0"}),timeout=120) as h:
        blob=h.read()
    report["bytes"]=len(blob)
    up=req("GET",f"/media/{ID}/upload")
    report["upload_ticket"]=up
    if up["ok"]:
        upload_url=up["data"]["upload_url"]
        put=urllib.request.Request(upload_url,data=blob,headers={"Content-Type":"audio/mpeg"},method="PUT")
        with urllib.request.urlopen(put,timeout=120) as h:
            report["s3_put_status"]=h.status
        report["complete"]=req("PUT",f"/media/{ID}/upload/complete",{"upload_url":upload_url})
        report["after_complete"]=req("GET",f"/media/{ID}")
        report["file_status"]=req("GET",f"/media/{ID}/status")

open("yodeck-patch-local-test.json","w").write(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
