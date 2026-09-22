# Standard Perhitungan Waktu Salat — Masjid Al Ihsan Kapuih

## Status

Metode aplikasi dibakukan sebagai **TARJIH_MUHAMMADIYAH_PADANG_2026**.

Tujuan utama: hasil dashboard TV mengikuti jadwal lokal Majelis Tarjih Muhammadiyah Padang yang digunakan pengurus, tetapi tetap dihitung secara dinamis dan tidak meng-hardcode tabel harian.

## Dasar Tarjih

1. Awal Subuh menggunakan posisi pusat matahari **-18°** di ufuk timur, sesuai Keputusan PP Muhammadiyah No. 734/KEP/I.0/B/2021 (hasil Munas Tarjih XXXI).
2. Isya menggunakan akhir senja astronomis, matahari sekitar **-18°**.
3. Zuhur mengikuti kulminasi matahari dengan ihtiyat.
4. Asar menggunakan panjang bayangan benda = bayangan saat kulminasi + 1 kali tinggi benda (faktor 1).
5. Terbit/Syuruq memperhitungkan piringan matahari dan refraksi; jadwal lokal juga memuat ihtiyat/koreksi lokal.

## Referensi lokal / acceptance data

Foto kalender Majelis Tarjih Muhammadiyah Padang 2026 yang diberikan pengurus dipakai sebagai data pembanding. Sampel lintas bulan yang dijadikan acceptance reference:

| Tanggal 2026 | Subuh | Syuruq | Zuhur | Asar | Magrib | Isya |
|---|---:|---:|---:|---:|---:|---:|
| 01 Apr | 05:11 | 06:16 | 12:24 | 15:33 | 18:27 | 19:36 |
| 01 Mei | 05:03 | 06:10 | 12:17 | 15:38 | 18:20 | 19:31 |
| 01 Jun | 05:01 | 06:11 | 12:18 | 15:43 | 18:20 | 19:34 |
| 01 Jul | 05:06 | 06:17 | 12:24 | 15:49 | 18:26 | 19:41 |
| 01 Agu | 05:11 | 06:19 | 12:26 | 15:49 | 18:29 | 19:41 |
| 01 Sep | 05:07 | 06:13 | 12:20 | 15:35 | 18:23 | 19:32 |
| 22 Sep | 05:00 | 06:05 | 12:13 | 15:16 | 18:17 | 19:25 |
| 01 Okt | 04:57 | 06:02 | 12:10 | 15:14 | 18:14 | 19:22 |
| 01 Nov | 04:47 | 05:54 | 12:04 | 15:23 | 18:08 | 19:19 |
| 01 Des | 04:49 | 05:59 | 12:09 | 15:34 | 18:14 | 19:28 |

## Kalibrasi browser

Mesin browser lama menggunakan model matahari ringkas. Dibanding kalender lokal 2026, pola selisihnya stabil. Karena itu koreksi menit dibuat eksplisit:

- Subuh: +1 menit
- Syuruq/Terbit: -3 menit
- Zuhur: +2 menit
- Asar: +2 menit
- Magrib: +2 menit
- Isya: +2 menit

Koreksi ini adalah **kalibrasi model untuk Masjid Al Ihsan terhadap kalender Tarjih Padang**, bukan definisi fikih universal.

## Aturan perubahan

- Parameter Tarjih (khususnya sudut Subuh) tidak boleh diubah tanpa keputusan/rujukan resmi baru.
- Koreksi lokal boleh diubah hanya setelah dibandingkan dengan kalender resmi/lokal terbaru.
- Perubahan wajib diuji lintas musim, minimal satu tanggal pada beberapa bulan berbeda.
- Jadwal tidak boleh diganti dengan angka hardcode per hari kecuali sebagai fallback darurat yang disetujui pengurus.
