# Standard Waktu Shalat — Majelis Tarjih Muhammadiyah Padang

Dashboard Masjid Al Ihsan Kapuih memakai profil hisab **Majelis Tarjih Muhammadiyah — Padang** sebagai acuan jadwal TV.

## Acuan markaz

Untuk menjaga konsistensi dengan jadwal Muhammadiyah Padang yang dicetak, aplikasi tidak memakai geolokasi perangkat TV. Markaz yang dibakukan adalah:

- Lintang: **00°56'57" LS** (-0.9491666667)
- Bujur: **100°21'15" BT** (100.3541666667)
- Zona waktu: **WIB / UTC+7**

Koordinat ini sama dengan markaz Padang pada Jadwal Imsakiyah Muhammadiyah 1447 H / 2026 M yang dihisab oleh Oman Fathurohman SW, Majelis Tarjih dan Tajdid PP Muhammadiyah.

## Kriteria astronomis

- **Shubuh:** pusat Matahari pada ketinggian **-18°** di ufuk timur, mengikuti Keputusan Munas Tarjih Muhammadiyah XXXI / Keputusan PP Muhammadiyah No. 734/KEP/I.0/B/2021.
- **Terbit / Syuruq:** profil terbit Matahari menggunakan ketinggian efektif **-1°**, mewakili gabungan semi-diameter, refraksi, dan kerendahan ufuk untuk profil jadwal Padang.
- **Dhuha:** ketinggian Matahari **+4°30'**.
- **Dzuhur:** sesudah kulminasi / transit Matahari.
- **Ashar:** panjang bayangan = panjang benda + bayangan saat kulminasi (faktor 1).
- **Maghrib:** profil terbenam Matahari menggunakan ketinggian efektif **-1°**.
- **Isya:** pusat Matahari pada ketinggian **-18°** di ufuk barat.

Mesin posisi Matahari menggunakan persamaan astronomi berpresisi tinggi (Julian day, apparent solar longitude, obliquity, solar declination, equation of time) dan menyelesaikan crossing ketinggian Matahari secara iteratif.

## Kalibrasi kalender Padang

Ephemeris/implementasi komputer yang berbeda dapat menggeser hasil beberapa detik. Karena layar TV hanya menampilkan satuan menit, aplikasi mempunyai normalisasi detik kecil per peristiwa. Nilai ini **bukan kriteria fikih baru**; fungsinya hanya menyelaraskan engine dengan grid menit pada kalender Majelis Tarjih Padang yang dijadikan referensi.

Reference regression memakai 26 tanggal dari kalender Padang Maret–Desember 2026, meliputi 182 nilai (Shubuh, Syuruq, Dhuha, Dzuhur, Ashar, Maghrib, Isya).

Acceptance gate:

- minimal **95% nilai harus cocok persis sampai menit**, dan
- **tidak boleh ada deviasi lebih dari 1 menit**.

Baseline saat standardisasi: **174/182 cocok persis (95,6%)**, deviasi maksimum **1 menit**.

## Aturan perubahan

Perubahan berikut tidak boleh dilakukan hanya untuk mempercantik angka:

1. mengganti sudut Shubuh/Isya;
2. mengganti markaz Padang;
3. mengganti faktor Ashar;
4. mengganti profil Syuruq/Maghrib;
5. mengganti kalibrasi menit/detik.

Jika Majelis Tarjih menerbitkan keputusan atau jadwal Padang baru yang mengubah kriteria, perubahan harus dibuat sebagai versi metode baru dan regression reference harus diperbarui bersama sumbernya.
