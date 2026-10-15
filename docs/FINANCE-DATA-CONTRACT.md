# Kontrak Data Keuangan Dashboard v111

Sumber utama: Google Sheet CMS Masjid Al Ihsan.

## Sheet
- `Keuangan Transaksi`: input bendahara.
- `Keuangan Config`: periode aktif, target operasional, tautan laporan.
- `Keuangan Dashboard`: ringkasan terhitung.

## Aturan
- Posisi dana memasukkan saldo awal dan transfer penutupan program.
- Pemasukan/pengeluaran operasional hanya transaksi `Operasional + Kas Umum`.
- Kas program (Pembangunan, Ramadhan, Kurban, dll.) berdiri sendiri sampai ditutup.
- Saat program ditutup, surplus/defisit masuk Kas Umum sebagai `Transfer Antar Kas`.

## JSON internal yang dibaca UI
```json
{
  "version": "finance-v111",
  "period": "2026-10",
  "target": 10000000,
  "position": -16864347,
  "income": 1299000,
  "expense": 3981000,
  "surplus": -2682000,
  "collected": 1299000,
  "remaining": 8701000,
  "progress": 0.1299,
  "history": [{"period":"2026-10","income":1299000,"expense":3981000}],
  "top_income": [{"label":"Kotak Amal","amount":1064500}],
  "top_expense": [{"label":"Honor Imam/Petugas","amount":1750000}],
  "last_update": "...",
  "report_url": ""
}
```

Browser menghitung Top 3 langsung dari `Keuangan Transaksi` dan memakai `data/finance-summary.json` hanya sebagai fallback saat Google Sheet gagal dibaca.
