#!/usr/bin/env python3
import json, os, time, urllib.request, urllib.error

BASE="https://app.yodeck.com/api/v2"
TOKEN=os.environ["YODECK_API_TOKEN"].strip()
WORKSPACE=257599
SCREEN_ID=811845
DASHBOARD_URL="https://papabetuah.github.io/al-ihsan-digital-information-system/"

HEADERS={
    "Authorization":f"Token alihsan:{TOKEN}",
    "Accept":"application/json",
    "Content-Type":"application/json",
}

TTS={
"01":("01 - Imbauan Kebersihan Masjid Al Ihsan.mp3","1Fd9FM45_D56XSwkN0LlvahOjTc_Sd0Bv"),
"02":("02 - Selamat Datang Masjid Al Ihsan.mp3","1vtd4k60ZMTOutb2K6Hbd6nzddtt5cR87"),
"03":("03 - Luruskan dan Rapatkan Saf.mp3","1uyKv6hEhDhEh-J1Ahd3KGX5ZLBLi9MGW"),
"04":("04 - Nonaktifkan Nada Dering.mp3","1rI-8siBxIgpv_waILWQT2qhRdleTn0JX"),
"05":("05 - Menjaga Ketenangan Masjid.mp3","17YGcjHQTyguYvqbcqjbLhoYtVLh8r13h"),
"06":("06 - Ajak Keluarga ke Masjid.mp3","11VkwxLhqn1p_NLqlp9isCUdVOsIEopZI"),
"07":("07 - Memakmurkan Masjid.mp3","14Egsk_ZmBzSC0lRoITG5FF-0HUS4YUsu"),
"08":("08 - Sedekah untuk Masjid.mp3","1ZMabyJeRvLpZsdo3hHLyw4jfjHqwshDB"),
"09":("09 - Hadis Keutamaan Salat Berjamaah.mp3","1M50Sly0Jw9Gtcpg5-al0A5oXcbs6ql7V"),
"10":("10 - Hadis Keutamaan Pergi ke Masjid.mp3","181X6AHZjRFFfleviGu1fwBJvGOrPgYVm"),
"11":("11 - Hadis Malaikat Mendoakan Jamaah.mp3","1LoNWqK0lv9OxXsGPhJVTZa7d5qN-feQR"),
"12":("12 - Hadis Keutamaan Membaca Al Quran.mp3","13EKVrXJB7caA6L0crGm-Oiac72yVG-m0"),
"13":("13 - Hadis Sedekah Jariah.mp3","1c0Eu1s7XcWNbZwNbZ1QGftZmzC3hq0Xf"),
"14":("14 - Hadis Persaudaraan Muslim.mp3","1IccqToOOInp4i6drbLNN-PDWXbx8Onix"),
"15":("15 - Hadis Berbuat Baik kepada Tetangga.mp3","11JEhXNGt66LSp8CjDDhIIyqllgAPl1wN"),
"16":("16 - Hadis Menjaga Lisan.mp3","1tri4AndYnMMNY7qkNb1xkfVjZNFXkKA_"),
"17":("17 - Pengantar Pra Azan Subuh.mp3","1WFd2FOb6CKJ57RCR-jU-ZerZ3ytpth-b"),
"18":("18 - Pengantar Pra Azan Zuhur.mp3","1nou0VvtA0MsbijcbFTaE8acNfe7IOh24"),
"19":("19 - Pengantar Pra Azan Asar.mp3","189nVN0M26_CovtDo-8H8u_dgHlYPhX4C"),
"20":("20 - Pengantar Pra Azan Magrib.mp3","10RGdZDuLQ2-pFw83-gzI2w227JGqlNmB"),
"21":("21 - Pengantar Pra Azan Isya.mp3","1e6zTOCDPHOtS4hvtAV4AKyT5CsnSY-yA"),
"22":("22 - Pengantar Hari Jumat.mp3","1OV5ckszmt8A1E53wVZIwMtre0FX0Aq1h"),
"23":("23 - Datang Lebih Awal untuk Salat Jumat.mp3","1z36Nohv9NrgfsryXg29W4F1z8m1tNbDz"),
"24":("24 - Adab Mendengarkan Khutbah Jumat.mp3","1X5iCCE3f9YI5UTToittXiuh-wjVJD3V3"),
"25":("25 - Infak Jumat Masjid Al Ihsan.mp3","1XAy2pGty9vXoBBaQPnb3bJ9qt0hHDPR2"),
}

TILAWAH={
"SUBUH-01":("SUBUH-01 - Al-Afasy - Al-Fajr 1-10.mp3","1eyF4ZphZc-wbFDBbPrAT5VNUixlIS1pj"),
"SUBUH-02":("SUBUH-02 - Minshawi - Ad-Duha 1-11.mp3","1d05_JuLsic2SmN-ck6bmpfuYqBiL5h0y"),
"SUBUH-03":("SUBUH-03 - Al-Afasy - At-Takwir 15-21.mp3","1CHnRfnN0GRPaJP2CWeaGmn3_w5cEuDuT"),
"ZUHUR-01":("ZUHUR-01 - Al-Afasy - Taha 14-16.mp3","1E9ecJpS8vd1ISKSZyPy0rRwrfgD--1CC"),
"ZUHUR-02":("ZUHUR-02 - Al-Afasy - Al-Baqarah 238-239.mp3","1yugZtpa0MfoJBLZ9Uz3Y3bEY0T3fjqHZ"),
"ZUHUR-03":("ZUHUR-03 - Al-Afasy - Al-Maarij 22-35.mp3","1WsBcrkutHVo4yNS9UZSLtGgLQgsLvPsW"),
"ASAR-01":("ASAR-01 - Minshawi - Al-Asr 1-3.mp3","1zKHi8mPURuj71VOmdLGa_aW67wqvWwX7"),
"ASAR-02":("ASAR-02 - Minshawi - Ash-Sharh 1-8.mp3","1vMnP5VSPYQX6xxd0zD2ZPVQ1uL5g9j86"),
"ASAR-03":("ASAR-03 - Al-Afasy - Ali Imran 133-136.mp3","1aV5d_5QT218CiAR6yOuFz6NJFsSmUhsi"),
"MAGRIB-01":("MAGRIB-01 - Al-Afasy - Al-Inshiqaq 16-25.mp3","1OuijgMA_aZKDXzU76b2dgt-SXKBc1G9a"),
"MAGRIB-02":("MAGRIB-02 - Al-Afasy - At-Tariq 1-10.mp3","1rPYfp16QM5DSkZEOY52Gb_DUmkZIfhWO"),
"MAGRIB-03":("MAGRIB-03 - Minshawi - Ash-Shams 1-15.mp3","1n1xgDvnfgt70I_YBXsXDJQWsEDHUrmpO"),
"ISYA-01":("ISYA-01 - Al-Afasy - Al-Muzzammil 1-10.mp3","1AvOkTylz1nqTyRwRZlzcnpkodSnvBoRO"),
"ISYA-02":("ISYA-02 - Al-Afasy - As-Sajdah 15-17.mp3","149VHNVJlgbsCJtcrqyizW1vuYqXO0QVY"),
"ISYA-03":("ISYA-03 - Al-Afasy - Al-Mulk 1-5.mp3","1ELa8rzRYz3qudMGx-pHrCf8nj6UYm-0W"),
"JUMAT-01":("JUMAT-01 - Al-Afasy - Ali Imran 102-104.mp3","1fcggSnH8nhXdv-h-0hcS7qfosd0Egopz"),
"JUMAT-02":("JUMAT-02 - Al-Afasy - Al-Baqarah 261-263.mp3","1UjOwMJkKox0Zjn84UTo-0KlefxatL82q"),
"JUMAT-03":("JUMAT-03 - Al-Afasy - Al-Baqarah 267-272.mp3","1JS2bfHaGasR4S_RcXxZ71u6EfROu2atD"),
}

WEEKLY={
"Senin":{
"SUBUH":["SUBUH-01","09","17"],"ZUHUR":["ZUHUR-01","09","18"],"ASAR":["ASAR-01","10","19"],"MAGRIB":["MAGRIB-01","06","20"],"ISYA":["ISYA-01","11","21"]},
"Selasa":{
"SUBUH":["SUBUH-02","10","17"],"ZUHUR":["ZUHUR-02","13","18"],"ASAR":["ASAR-02","14","19"],"MAGRIB":["MAGRIB-02","12","20"],"ISYA":["ISYA-02","12","21"]},
"Rabu":{
"SUBUH":["SUBUH-03","12","17"],"ZUHUR":["ZUHUR-03","15","18"],"ASAR":["ASAR-03","15","19"],"MAGRIB":["MAGRIB-03","14","20"],"ISYA":["ISYA-03","13","21"]},
"Kamis":{
"SUBUH":["SUBUH-01","06","17"],"ZUHUR":["ZUHUR-01","08","18"],"ASAR":["ASAR-01","16","19"],"MAGRIB":["MAGRIB-01","16","20"],"ISYA":["ISYA-01","16","21"]},
"Jumat":{
"SUBUH":["SUBUH-02","07","17"],"ZUHUR":["ZUHUR-02","16","18"],"ASAR":["ASAR-02","07","19"],"MAGRIB":["MAGRIB-02","05","20"],"ISYA":["ISYA-02","07","21"]},
"Sabtu":{
"SUBUH":["SUBUH-03","09","17"],"ZUHUR":["ZUHUR-02","16","18"],"ASAR":["ASAR-03","10","19"],"MAGRIB":["MAGRIB-03","06","20"],"ISYA":["ISYA-03","11","21"]},
"Ahad":{
"SUBUH":["SUBUH-01","12","17"],"ZUHUR":["ZUHUR-03","13","18"],"ASAR":["ASAR-01","14","19"],"MAGRIB":["MAGRIB-01","12","20"],"ISYA":["ISYA-01","13","21"]},
}

FRIDAY={
"PEKAN-1":["JUMAT-01","22","23","24"],
"PEKAN-2":["JUMAT-02","22","25","24"],
"PEKAN-3":["JUMAT-03","23","25","24"],
"PEKAN-4":["JUMAT-01","22","25","24"],
}

def request(method,path,payload=None,retries=4):
    data=None if payload is None else json.dumps(payload).encode()
    for attempt in range(retries):
        req=urllib.request.Request(BASE+path,data=data,headers=HEADERS,method=method)
        try:
            with urllib.request.urlopen(req,timeout=60) as r:
                raw=r.read()
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as e:
            body=e.read().decode("utf-8","replace")
            if e.code==429 and attempt+1<retries:
                time.sleep(5*(attempt+1)); continue
            raise RuntimeError(f"{method} {path} -> HTTP {e.code}: {body[:1200]}")

def list_all(path):
    return request("GET",f"{path}?limit=100&workspace={WORKSPACE}&ordering=name").get("results",[])

report={"created_media":[],"existing_media":[],"failed_media":[],"created_playlists":[],"existing_playlists":[],"failed_playlists":[]}

existing_media={x["name"]:x for x in list_all("/media")}

def upload_audio_bytes(obj,drive_id):
    source_url=f"https://drive.usercontent.google.com/download?id={drive_id}&export=download&confirm=t"
    with urllib.request.urlopen(urllib.request.Request(source_url,headers={"User-Agent":"Mozilla/5.0"}),timeout=120) as r:
        blob=r.read()
    upload=request("GET",f"/media/{obj['id']}/upload")
    upload_url=upload["upload_url"]
    put=urllib.request.Request(upload_url,data=blob,headers={"Content-Type":"audio/mpeg"},method="PUT")
    with urllib.request.urlopen(put,timeout=120) as r:
        r.read()
    request("PUT",f"/media/{obj['id']}/upload/complete",{"upload_url":upload_url})

def ensure_audio(key,name,drive_id):
    obj=existing_media.get(name)
    try:
        if not obj:
            payload={
                "name":name,
                "media_origin":{"type":"audio","source":"local","format":None},
                "description":"Masjid Al Ihsan Kapuih - otomatis dipulihkan via API",
                "default_duration":60,
                "workspace":WORKSPACE,
            }
            obj=request("POST","/media",payload)
            existing_media[name]=obj
            report["created_media"].append(name)
        else:
            report["existing_media"].append(name)
        if not obj.get("last_uploaded"):
            upload_audio_bytes(obj,drive_id)
            obj=request("GET",f"/media/{obj['id']}")
            existing_media[name]=obj
        return obj
    except Exception as e:
        report["failed_media"].append({"name":name,"error":str(e)})
        return None

for key,(name,gid) in TTS.items():
    ensure_audio(key,name,gid)
for key,(name,gid) in TILAWAH.items():
    ensure_audio(key,name,gid)

dashboard_name="Dashboard Masjid Al Ihsan Kapuih"
dashboard=existing_media.get(dashboard_name)
if not dashboard:
    try:
        dashboard=request("POST","/media",{
            "name":dashboard_name,
            "media_origin":{"type":"webpage","source":"url","format":None},
            "description":"Dashboard utama Masjid Al Ihsan Kapuih",
            "default_duration":86400,
            "arguments":{"play_from_url":DASHBOARD_URL},
            "workspace":WORKSPACE,
        })
        existing_media[dashboard_name]=dashboard
        report["created_media"].append(dashboard_name)
    except Exception as e:
        report["failed_media"].append({"name":dashboard_name,"error":str(e)})
else:
    report["existing_media"].append(dashboard_name)

by_key={}
for k,(name,_) in {**TTS,**TILAWAH}.items():
    if name in existing_media:
        by_key[k]=existing_media[name]

existing_playlists={x["name"]:x for x in list_all("/playlists")}

def ensure_playlist(name,keys):
    if name in existing_playlists:
        report["existing_playlists"].append(name)
        return existing_playlists[name]
    if any(k not in by_key for k in keys):
        report["failed_playlists"].append({"name":name,"error":"media dependency missing"})
        return None
    base_items=[{"id":by_key[k]["id"],"priority":i+1,"type":"media"} for i,k in enumerate(keys)]
    payload={
        "name":name,
        "description":"Playlist pra-azan Masjid Al Ihsan Kapuih",
        "workspace":{"id":WORKSPACE,"name":"Surau Kapuih"},
        "items":base_items,
        "playback_options":{"synced_playback":False,"random_playback":False},
    }
    try:
        obj=request("POST","/playlists",payload)
    except Exception:
        payload["items"]=[{**item,"duration":60} for item in base_items]
        try:
            obj=request("POST","/playlists",payload)
        except Exception as e:
            report["failed_playlists"].append({"name":name,"error":str(e)})
            return None
    existing_playlists[name]=obj
    report["created_playlists"].append(name)
    return obj

for day,prayers in WEEKLY.items():
    for prayer,keys in prayers.items():
        ensure_playlist(f"PRA-AZAN {prayer} {day.upper()}",keys)
for week,keys in FRIDAY.items():
    ensure_playlist(f"PRA-JUMAT {week}",keys)

if dashboard:
    try:
        request("PATCH",f"/screens/{SCREEN_ID}",{
            "screen_content":{
                "source_id":dashboard["id"],
                "source_name":dashboard_name,
                "source_type":"media"
            }
        })
        request("POST",f"/screens/{SCREEN_ID}/push",{"use_download_timeslots":False})
        report["screen_default"]="dashboard assigned and pushed"
    except Exception as e:
        report["screen_default_error"]=str(e)

report["totals"]={
    "media_now":len(list_all("/media")),
    "playlists_now":len(list_all("/playlists")),
}
with open("yodeck-rebuild-report.json","w") as f:
    json.dump(report,f,ensure_ascii=False,indent=2)
print(json.dumps(report,ensure_ascii=False,indent=2))
