# Gemini + Node.js (Starter)

## Yang perlu disiapkan
1. Buat file `.env` di root proyek.
2. Isi `GOOGLE_API_KEY` dengan API key Gemini Anda.

Contoh: lihat `.env.example`.

## Jalankan demo
```bash
npm run demo:gemini -- "Tolong jelaskan arsitektur REST API."
```

## Konfigurasi env vars
- `GOOGLE_API_KEY` (wajib)
- `GEMINI_API_VERSION` (opsional, default `v1`)
- `GEMINI_MODEL` (opsional, default `gemini-2.5-flash`)
- `GEMINI_TEMPERATURE` (opsional, default `0.7`)
- `GEMINI_MAX_OUTPUT_TOKENS` (opsional, default `256`)
- `GEMINI_SYSTEM_INSTRUCTION` (opsional)

## Reuse di project Anda
Di project baru nanti, tinggal import:
```js
const { generateGeminiText } = require("../gemini/client");
```
Lalu panggil `generateGeminiText("prompt Anda")`.

