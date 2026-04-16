# CryptoSense AI

[English](#english) | [Bahasa Indonesia](#bahasa-indonesia)

---

<a name="english"></a>
# English

Web-based crypto tracker & analyzer chatbot with conversational AI that makes learning crypto easy and fun!

---

## 🎯 Who Is This For?

CryptoSense AI is perfect for you who:

- 🐣 **Beginners** - Want to learn crypto from scratch without confusion
- 📊 **Trackers** - Want to track real-time crypto prices
- 🧠 **Aspiring Analysts** - Want to understand macro economic factors (FED, inflation, gold) that affect crypto
- 💬 **No-Fuss Users** - Like casual conversation but still want useful insights

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 💬 **Natural Chat** | Chat like talking to a friend, not a rigid robot |
| 📈 **Live Data** | Real-time prices from CoinGecko API |
| 🖼️ **Image Analysis** | Upload/paste chart screenshots, I'll analyze it for you |
| 📊 **Candlestick Chart** | Interactive chart with MA7, MA25, Volume |
| 😨 **Fear & Greed** | Market sentiment index |
| 🌍 **Macro Indicators** | FED rates, Inflation, Gold price |
| 🔔 **Price Alert** | Set notifications at specific prices |

---

## 🚀 How to Use

### 1. Run the Application

```bash
# Open terminal in project folder
node server.js
```

### 2. Open in Browser

```
http://localhost:3000
```

### 3. Start Chatting!

Type your questions in the chat. Examples:

```
"Hey, what's BTC price?"
"Analyze the market please"
"Why is crypto dropping?"
"Give me some insights"
```

Or upload chart screenshots by clicking the 📷 button or drag & drop!

---

## 🔄 How It Works (Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INPUT                            │
│              (type message / upload image)                    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      AI ENGINE                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Intent Detection                                    │   │
│  │  • Detect user's message intent                      │   │
│  │  • Identify mentioned coins (BTC/ETH/SOL/etc)       │   │
│  │  • Identify topic (price/analysis/macro/etc)         │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Context Awareness                                   │   │
│  │  • Remember previously discussed coins               │   │
│  │  • Track conversation history                        │   │
│  │  • Maintain conversation state                       │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Response Generation                                 │   │
│  │  • Generate response based on intent                │   │
│  │  • Fetch real-time data from API                   │   │
│  │  • Format in casual conversational style            │   │
│  └─────────────────────────┬───────────────────────────┘   │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                       OUTPUT                                │
│              Conversational response + data                  │
└─────────────────────────────────────────────────────────────┘
```

### Detail Flow:

```
User: "Is BTC going up?"
         │
         ▼
┌─────────────────┐
│ 1. Parse Input │ → Detect: BTC, price question
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Get Data    │ → Fetch from CoinGecko API
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. Generate    │ → Create casual response
└────────┬────────┘
         │
         ▼
User: "₿ BTC: $XX,XXX  (+2.5%)
        🚀 It's rallying!"
```

---

## 🔑 API Key

**No API key required!** 

This app uses [CoinGecko API](https://www.coingecko.com/) which provides free public API access. The data is fetched directly from their servers in real-time.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| Vanilla JavaScript | Frontend & AI logic |
| LightweightCharts | Candlestick chart |
| CoinGecko API | Real-time crypto data (free, no API key) |

---

## 📋 Disclaimer

> ⚠️ **Important:** Information provided is for educational purposes only, NOT financial advice. Always DYOR (Do Your Own Research) before making investment decisions.

---

## 💡 Usage Tips

1. **Use casual language** - No need to be formal, just chat naturally
2. **Mention coin names** - Say "BTC", "ETH", "SOL" so I know what you're interested in
3. **Upload charts** - Screenshot your chart, I'll help analyze patterns
4. **Click crypto cards** - To view detailed chart of specific coins

---

<hr>

<a name="bahasa-indonesia"></a>
# Bahasa Indonesia

Chatbot crypto tracker & analyzer berbasis web dengan conversational AI yang bikin belajar crypto jadi mudah dan seru!

---

## 🎯 Untuk Siapa?

CryptoSense AI cocok buat kamu yang:

- 🐣 **Pemula** - Mau belajar crypto dari nol tanpa bingung
- 📊 **Tracker** - Ingin tracking harga crypto real-time
- 🧠 **Analis Pemula** - Ingin paham faktor makro ekonomi (FED, inflation, gold) yang pengaruh ke crypto
- 💬 **Anti Ribet** - Suka ngobrol santai tapi tetap dapat insight berguna

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 💬 **Chat Natural** | Ngobrol kayak sama temen, bukan robot kaku |
| 📈 **Live Data** | Harga real-time dari CoinGecko API |
| 🖼️ **Analisa Gambar** | Upload/paste screenshot chart, gue analisain |
| 📊 **Candlestick Chart** | Chart interaktif dengan MA7, MA25, Volume |
| 😨 **Fear & Greed** | Index sentimen pasar |
| 🌍 **Macro Indicators** | FED rates, Inflation, Gold price |
| 🔔 **Price Alert** | Set notifikasi di harga tertentu |

---

## 🚀 Cara Pakai

### 1. Jalankan Aplikasi

```bash
# Buka terminal di folder project
node server.js
```

### 2. Buka di Browser

```
http://localhost:3000
```

### 3. Mulai Ngobrol!

Ketik pertanyaan kamu di chat. Contoh:

```
"Hai, BTC berapa nih?"
"Analisa pasar dong"
"Kenapa crypto turun?"
"Kasih insight dong"
```

Atau upload screenshot chart dengan klik tombol 📷 atau drag & drop!

---

## 🔄 Cara Kerja (Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INPUT                            │
│              (ketik pesan / upload gambar)                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      AI ENGINE                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Intent Detection                                    │   │
│  │  • Deteksi maksud pesan user                         │   │
│  │  • Kenali coin yang disebut (BTC/ETH/SOL/etc)        │   │
│  │  • Identifikasi topik (harga/analisis/makro/etc)    │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Context Awareness                                   │   │
│  │  • Ingat coin yang pernah dibahas                   │   │
│  │  • Track conversation history                       │   │
│  │  • Maintain conversation state                      │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Response Generation                                 │   │
│  │  • Generate respons sesuai intent                   │   │
│  │  • Ambil data real-time dari API                   │   │
│  │  • Format jadi bahasa casual Indonesia             │   │
│  └─────────────────────────┬───────────────────────────┘   │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                       OUTPUT                                │
│              Respons conversational + data                  │
└─────────────────────────────────────────────────────────────┘
```

### Detail Flow:

```
User: "BTC naik nggak sih?"
         │
         ▼
┌─────────────────┐
│ 1. Parse Input │ → Deteksi: BTC, pertanyaan harga
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Get Data    │ → Fetch dari CoinGecko API
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. Generate    │ → Buat response casual Indonesia
└────────┬────────┘
         │
         ▼
User: "₿ BTC: $XX,XXX  (+2.5%)
        🚀 Lagi rally nih!"
```

---

## 🔑 API Key

**Tidak perlu API key!**

Aplikasi ini menggunakan [CoinGecko API](https://www.coingecko.com/) yang menyediakan akses API publik gratis. Data diambil langsung dari server mereka secara real-time.

---

## 🛠️ Teknologi

| Teknologi | Kegunaan |
|-----------|----------|
| Vanilla JavaScript | Frontend & AI logic |
| LightweightCharts | Candlestick chart |
| CoinGecko API | Real-time crypto data (gratis, tanpa API key) |

---

## 📋 Disclaimer

> ⚠️ **Penting:** Informasi yang diberikan hanya untuk edukasi, BUKAN nasihat keuangan. Selalu DYOR (Do Your Own Research) sebelum mengambil keputusan investasi.

---

## 💡 Tips Penggunaan

1. **Pakai bahasa sehari-hari** - Nggak perlu formal, ngobrol biasa aja
2. **Mention nama coin** - Bilang "BTC", "ETH", "SOL" biar gue fokus
3. **Upload chart** - Screenshot chart lo, gue bantu analisa pattern-nya
4. **Klik crypto card** - Untuk lihat chart detail coin tertentu

---

Built with ❤️ for crypto enthusiasts
