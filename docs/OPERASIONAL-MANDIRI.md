# Operasional Mandiri Sistem Digital Masjid Al Ihsan

Dokumen ini adalah panduan agar sistem tetap berjalan walau pendiri/ketua tidak lagi mengurus teknis sehari-hari.

## Arsitektur tetap

- **GitHub**: kode dashboard, mesin waktu salat, aturan rotasi, dan otomatisasi.
- **GitHub Actions**: setiap hari memeriksa/menyembuhkan media Yodeck lalu menyinkronkan jadwal 30 hari.
- **Yodeck**: pemutar native untuk dashboard, audio, playlist, dan schedule.
- **Google Drive Masjid**: arsip master audio untuk pemulihan bila media Yodeck hilang.
- **TV Masjid**: hanya menjalankan Yodeck.

Audio azan tidak pernah disimpan/diputar otomatis. Seluruh azan tetap live oleh muazin.

## Otomasi harian

Workflow **Self-heal and sync Yodeck** berjalan setiap hari sekitar 00:05 WIB.

Urutannya:
1. Memeriksa 43 audio, 39 playlist, dan dashboard.
2. Memulihkan item Yodeck yang hilang/rusak dari master Drive.
3. Menunggu encoding Yodeck selesai.
4. Menghitung ulang waktu salat dengan mesin Majelis Tarjih Muhammadiyah Padang.
5. Membuat rolling schedule 30 hari.
6. Menetapkan schedule ke screen Surau Kapuih dan Push to Screen.
7. Membuka issue GitHub hanya jika proses gagal.

Dengan buffer 30 hari, kegagalan otomasi beberapa hari tidak langsung menghentikan program pra-azan.

## Tugas pengurus non-teknis

Pengurus harian cukup:
- memastikan TV, internet, dan sound system hidup;
- memastikan volume benar;
- melaksanakan azan secara live;
- melaporkan jika layar/audio tidak normal.

Tidak perlu mengubah schedule Yodeck secara manual.

## Kepemilikan organisasi — WAJIB dituntaskan

Agar sistem tidak bergantung pada satu orang, seluruh aset berikut harus dimiliki akun resmi Masjid Al Ihsan:

- akun Google/Drive masjid;
- akun GitHub organisasi atau akun resmi masjid;
- akun Yodeck masjid;
- email pemulihan organisasi.

Minimal dua pengurus harus menjadi admin:
1. Admin Utama Masjid
2. Admin Cadangan

Jangan memakai email pribadi pendiri sebagai satu-satunya pemilik.

## Secret dan kredensial

GitHub Secret yang diperlukan:
- `YODECK_API_TOKEN`

Token tidak boleh ditulis di source code, dokumen publik, WhatsApp grup, atau dashboard.

Saat admin berganti:
1. buat token Yodeck baru;
2. ganti secret `YODECK_API_TOKEN`;
3. jalankan workflow manual;
4. pastikan workflow sukses;
5. baru cabut token lama.

## Pemulihan bencana

Jika media Yodeck terhapus:
- jalankan workflow **Self-heal and sync Yodeck** secara manual.

Jika schedule hilang:
- workflow yang sama akan membuat ulang schedule.

Jika dashboard Yodeck hilang:
- workflow akan membuat ulang media webpage dari GitHub Pages.

Jika repo GitHub bermasalah:
- pulihkan dari repository/backup organisasi lalu jalankan workflow.

Jika Drive master hilang:
- jangan hapus media Yodeck yang masih sehat; pulihkan arsip Drive terlebih dahulu.

## Pemeriksaan bulanan 5 menit

Satu pengurus cukup memeriksa:
- workflow terakhir berstatus hijau;
- tidak ada issue **[AL-IHSAN] Otomasi Yodeck gagal** yang terbuka;
- Yodeck screen online;
- tanggal/waktu salat di TV masuk akal;
- satu audio pra-azan terdengar normal.

## Prinsip perubahan

Perubahan waktu salat, rotasi audio, atau sistem TV dilakukan lewat GitHub dan diuji oleh regression test. Hindari edit manual di Yodeck kecuali keadaan darurat.
