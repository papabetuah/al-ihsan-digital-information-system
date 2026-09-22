# Standard Waktu Shalat — Majelis Tarjih Muhammadiyah Padang

Dashboard Masjid Al Ihsan Kapuih memakai profil hisab **Majelis Tarjih Muhammadiyah — Padang** sebagai acuan jadwal TV.

## Acuan markaz

- Lintang: **00°56'57" LS** (-0.9491666667)
- Bujur: **100°21'15" BT** (100.3541666667)
- Zona waktu: **WIB / UTC+7**

Markaz ini sama dengan jadwal Muhammadiyah Padang 1447 H / 2026 M yang dihisab oleh Oman Fathurohman SW, Majelis Tarjih dan Tajdid PP Muhammadiyah.

## Kriteria Tarjih

- **Shubuh:** ketinggian Matahari **-18°**, sesuai Keputusan PP Muhammadiyah No. 734/KEP/I.0/B/2021.
- **Terbit / Syuruq:** profil efektif **-1°** untuk kalender Padang.
- **Dhuha:** ketinggian Matahari **+4°30'**.
- **Dzuhur:** transit/kulminasi Matahari ditambah normalisasi ihtiyat kalender.
- **Ashar:** panjang bayangan = tinggi benda + bayangan saat kulminasi (**faktor 1**).
- **Maghrib:** profil efektif **-1°**.
- **Isya:** ketinggian Matahari **-18°**.

## Mesin v2

Versi `tarjih-ephemeris-v2` tidak lagi memakai continuous solar-crossing solver sebagai sumber akhir waktu salat. Mesin mengikuti struktur **Pedoman Hisab Muhammadiyah**:

1. hitung Julian day;
2. hitung deklinasi Matahari dan equation of time;
3. hitung ephemeris transit;
4. hitung selisih bujur terhadap meridian WIB;
5. hitung sudut waktu berdasarkan ketinggian Matahari;
6. bentuk waktu Shubuh/Terbit/Dhuha/Dzuhur/Ashar/Maghrib/Isya;
7. terapkan normalisasi detik/ihtiyat untuk menyamakan grid menit kalender Padang;
8. bulatkan ke menit kalender.

Referensi metode:
- Pedoman Hisab Muhammadiyah: https://tarjih.or.id/wp-content/uploads/2020/08/pedoman_hisab_muhammadiyah.pdf
- Keputusan kriteria Subuh -18°: https://muhammadiyah.or.id/2021/03/keputusan-pp-muhammadiyah-tentang-kriteria-awal-waktu-subuh/
- Jadwal Imsakiyah Padang 1447 H / 2026 M: https://web.suaramuhammadiyah.id/wp-content/uploads/2026/01/Imsakiyah-1447-H_padang.pdf

## Kalibrasi kalender lokal 2026

Kalender cetak Majelis Tarjih Muhammadiyah Padang yang diberikan pengurus menjadi **acceptance reference** aplikasi.

Regression set saat ini:
- 26 tanggal lintas Maret–Desember 2026
- 7 nilai per tanggal
- total **182 nilai**

Hasil mesin v2:
- **182 / 182 cocok persis**
- **deviasi maksimum 0 menit**

CI wajib gagal jika satu nilai saja berbeda satu menit.

## Koreksi kompatibilitas kalender

Satu nilai pada kalender cetak tidak dapat direproduksi bersama 181 nilai lain dengan satu model ephemeris halus tanpa menggeser kriteria astronomis:

- **13 Maret 2026 — Ashar: -1 menit setelah pembulatan**

Koreksi ini disimpan secara eksplisit sebagai `publishedCalendarMinuteAdjustments`. Koreksi tersebut **tidak mengubah faktor Ashar 1**, tidak mengubah markaz, dan tidak dipakai untuk tanggal lain.

Pendekatan ini dipilih agar:
- kriteria Tarjih tetap murni;
- mesin tetap menghitung secara dinamis;
- angka TV tetap identik dengan kalender yang dipakai masjid;
- pengecualian kalender tidak tersembunyi di dalam rumus.

## Aturan perubahan

Perubahan pada sudut Shubuh/Isya, markaz, faktor Ashar, profil Terbit/Maghrib, normalisasi, atau compatibility adjustment harus disertai reference baru dan regression test. Target produksi tetap **0 menit deviasi** terhadap kalender rujukan yang telah disahkan pengurus.
