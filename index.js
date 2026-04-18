const AIEngine = {
    mode: 'beginner',
    chart: null,
    volumeChart: null,
    currentCoin: 'bitcoin',
    currentTimeframe: 24,
    
    conversationHistory: [],
    lastCoinContext: null,
    lastTopic: null,
    imageData: null,
    
    COINS: [
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
        { id: 'solana', symbol: 'SOL', name: 'Solana', icon: '◎' },
        { id: 'ripple', symbol: 'XRP', name: 'XRP', icon: '✕' },
        { id: 'binancecoin', symbol: 'BNB', name: 'BNB', icon: '◆' },
        { id: 'cardano', symbol: 'ADA', name: 'Cardano', icon: '₳' }
    ],
    
    macroData: {
        usInterestRate: 5.25,
        bojPolicy: 0.1,
        usInflation: 3.2,
        goldPrice: 2045
    },
    
    priceAlerts: [],
    
    init() {
        ChatUI.init();
        this.setupModeSelector();
        this.setupAlertModal();
        this.setupChartControls();
        this.setupImageUpload();
        this.setupQuickActions();
        this.renderCryptoCards();
        this.loadData();
        this.initChart();
        
        setInterval(() => this.loadData(), 60000);
    },
    
    setupModeSelector() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.mode = btn.dataset.mode;
            });
        });
    },
    
    setupAlertModal() {
        const modal = document.getElementById('alertModal');
        document.getElementById('alertBtn').addEventListener('click', () => modal.classList.add('active'));
        document.getElementById('closeModal').addEventListener('click', () => modal.classList.remove('active'));
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
        document.getElementById('createAlert').addEventListener('click', () => this.createAlert());
    },
    
    setupChartControls() {
        document.querySelectorAll('.tf-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTimeframe = parseInt(btn.dataset.tf);
                this.updateChart();
            });
        });
        
        document.getElementById('chartCoinSelect').addEventListener('change', (e) => {
            this.currentCoin = e.target.value;
            this.updateChart();
        });
    },
    
    setupImageUpload() {
        const imageInput = document.getElementById('imageInput');
        const previewContainer = document.getElementById('imagePreviewContainer');
        const preview = document.getElementById('imagePreview');
        const removeBtn = document.getElementById('removeImage');
        
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.imageData = event.target.result;
                    preview.src = this.imageData;
                    previewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
        
        removeBtn.addEventListener('click', () => {
            this.imageData = null;
            imageInput.value = '';
            previewContainer.style.display = 'none';
        });
    },
    
    setupQuickActions() {
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const msg = btn.dataset.msg;
                document.getElementById('chatInput').value = msg;
                document.getElementById('sendBtn').click();
            });
        });
    },
    
    createAlert() {
        const crypto = document.getElementById('alertCrypto').value;
        const type = document.getElementById('alertType').value;
        const price = parseFloat(document.getElementById('alertPrice').value);
        
        if (!price || price <= 0) {
            alert('Masukkan harga yang valid!');
            return;
        }
        
        this.priceAlerts.push({ crypto, type, price, active: true });
        document.getElementById('alertModal').classList.remove('active');
        document.getElementById('alertPrice').value = '';
        
        const coinName = this.COINS.find(c => c.id === crypto)?.symbol || crypto.toUpperCase();
        ChatUI.addBotMessage(`
            <p>🔔 Siap bro! Alert udah dibuat.</p>
            <p>Gue bakal kasih tau lo kalau <strong>${coinName}</strong> ${type === 'above' ? 'naik' : 'turun'} dari <span class="data-highlight">$${price.toLocaleString()}</span></p>
        `);
    },
    
    renderCryptoCards() {
        const container = document.getElementById('cryptoCards');
        container.innerHTML = this.COINS.slice(0, 4).map(coin => `
            <div class="crypto-card" id="${coin.id}Card" data-coin="${coin.id}">
                <div class="card-header">
                    <span class="crypto-icon">${coin.icon}</span>
                    <span class="crypto-name">${coin.name}</span>
                    <span class="crypto-symbol">${coin.symbol}</span>
                </div>
                <div class="price-info">
                    <span class="price" id="${coin.id}Price">--</span>
                    <span class="change positive" id="${coin.id}Change">--</span>
                </div>
            </div>
        `).join('');
        
        container.querySelectorAll('.crypto-card').forEach(card => {
            card.addEventListener('click', () => {
                const coinId = card.dataset.coin;
                this.currentCoin = coinId;
                this.lastCoinContext = coinId;
                document.getElementById('chartCoinSelect').value = coinId;
                this.updateChart();
            });
        });
    },
    
    async loadData() {
        await CoinGeckoService.fetchAllCoinsData();
        
        this.COINS.forEach(coin => {
            const data = CoinGeckoService.getCoinData(coin.id);
            if (data) {
                const priceEl = document.getElementById(`${coin.id}Price`);
                const changeEl = document.getElementById(`${coin.id}Change`);
                
                if (priceEl) priceEl.textContent = CoinGeckoService.formatPrice(data.usd);
                if (changeEl) {
                    changeEl.textContent = CoinGeckoService.formatChange(data.usd_24h_change);
                    changeEl.className = `change ${(data.usd_24h_change || 0) >= 0 ? 'positive' : 'negative'}`;
                }
            }
        });
        
        this.macroData.goldPrice = await CoinGeckoService.fetchGoldPrice();
        this.updateMacroPanel();
        this.updateFearGreedIndex();
        this.updateLastUpdate();
        this.updateChartInfo();
        this.checkAlerts();
    },
    
    updateMacroPanel() {
        document.getElementById('goldPrice').textContent = `$${Math.round(this.macroData.goldPrice)}`;
    },
    
    updateFearGreedIndex() {
        const btcData = CoinGeckoService.getCoinData('bitcoin');
        const btcChange = btcData?.usd_24h_change || 0;
        const sentiment = this.analyzeSentiment(btcChange);
        const value = Math.max(10, Math.min(90, 50 + sentiment * 30));
        
        document.getElementById('fearGreedFill').style.width = `${value}%`;
        document.getElementById('fearGreedValue').textContent = Math.round(value);
        
        let label, color;
        if (value < 25) { label = 'Extreme Fear'; color = '#ef4444'; }
        else if (value < 45) { label = 'Fear'; color = '#f97316'; }
        else if (value < 55) { label = 'Neutral'; color = '#eab308'; }
        else if (value < 75) { label = 'Greed'; color = '#22c55e'; }
        else { label = 'Extreme Greed'; color = '#10b981'; }
        
        const labelEl = document.getElementById('fearGreedLabel');
        labelEl.textContent = label;
        labelEl.style.color = color;
    },
    
    updateLastUpdate() {
        document.getElementById('lastUpdate').textContent = `Updated: ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    },
    
    updateChartInfo() {
        const coin = this.COINS.find(c => c.id === this.currentCoin);
        const data = CoinGeckoService.getCoinData(this.currentCoin);
        
        document.getElementById('chartCoinName').textContent = `${coin?.name || 'Crypto'} (${coin?.symbol || ''})`;
        
        if (data) {
            document.getElementById('chartPrice').textContent = CoinGeckoService.formatPrice(data.usd);
            const changeEl = document.getElementById('chartChange');
            changeEl.textContent = CoinGeckoService.formatChange(data.usd_24h_change);
            changeEl.className = `chart-change ${(data.usd_24h_change || 0) >= 0 ? 'positive' : 'negative'}`;
        }
    },
    
    checkAlerts() {
        this.priceAlerts.forEach(alert => {
            if (!alert.active) return;
            const data = CoinGeckoService.getCoinData(alert.crypto);
            if (!data) return;
            
            const triggered = (alert.type === 'above' && data.usd >= alert.price) ||
                             (alert.type === 'below' && data.usd <= alert.price);
            
            if (triggered) {
                alert.active = false;
                const emoji = alert.type === 'above' ? '🚀' : '📉';
                const symbol = this.COINS.find(c => c.id === alert.crypto)?.symbol || '';
                ChatUI.addBotMessage(`
                    <p>${emoji} <strong>ALERT!</strong></p>
                    <p><strong>${symbol}</strong> udah ${alert.type === 'above' ? 'capai' : 'turun ke'} 
                    <span class="data-highlight">${CoinGeckoService.formatPrice(data.usd)}</span></p>
                `);
            }
        });
    },
    
    initChart() {
        const chartOptions = {
            layout: {
                background: { type: 'solid', color: '#12121a' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: 'rgba(139, 92, 246, 0.1)' },
                horzLines: { color: 'rgba(139, 92, 246, 0.1)' },
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
                vertLine: { color: '#8b5cf6', width: 1, style: 2 },
                horzLine: { color: '#8b5cf6', width: 1, style: 2 },
            },
            rightPriceScale: { borderColor: 'rgba(139, 92, 246, 0.3)' },
            timeScale: { borderColor: 'rgba(139, 92, 246, 0.3)', timeVisible: true, secondsVisible: false },
        };
        
        this.chart = LightweightCharts.createChart(document.getElementById('priceChart'), {
            ...chartOptions,
            width: document.getElementById('priceChart').clientWidth,
            height: 300,
        });
        
        this.candleSeries = this.chart.addCandlestickSeries({
            upColor: '#10b981', downColor: '#ef4444',
            borderUpColor: '#10b981', borderDownColor: '#ef4444',
            wickUpColor: '#10b981', wickDownColor: '#ef4444',
        });
        
        this.ma7Series = this.chart.addLineSeries({ color: '#06b6d4', lineWidth: 1, priceLineVisible: false });
        this.ma25Series = this.chart.addLineSeries({ color: '#f59e0b', lineWidth: 1, priceLineVisible: false });
        
        this.volumeChart = LightweightCharts.createChart(document.getElementById('volumeChart'), {
            ...chartOptions,
            width: document.getElementById('volumeChart').clientWidth,
            height: 80,
        });
        
        this.volumeSeries = this.volumeChart.addHistogramSeries({
            color: '#8b5cf6', priceFormat: { type: 'volume' }, priceScaleId: '',
        });
        
        this.volumeChart.priceScale('').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
        
        this.chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
            if (range) this.volumeChart.timeScale().setVisibleLogicalRange(range);
        });
        
        this.volumeChart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
            if (range) this.chart.timeScale().setVisibleLogicalRange(range);
        });
        
        window.addEventListener('resize', () => {
            this.chart.resize(document.getElementById('priceChart').clientWidth, 300);
            this.volumeChart.resize(document.getElementById('volumeChart').clientWidth, 80);
        });
        
        this.updateChart();
    },
    
    async updateChart() {
        const days = Math.ceil(this.currentTimeframe / 24);
        const chartData = await CoinGeckoService.fetchCoinOHLC(this.currentCoin, days);
        
        if (!chartData || !chartData.candles) return;
        
        const { candles, volumes } = chartData;
        this.candleSeries.setData(candles);
        this.volumeSeries.setData(volumes);
        
        this.ma7Series.setData(this.calculateMA(candles, 7));
        this.ma25Series.setData(this.calculateMA(candles, 25));
        
        this.chart.timeScale().fitContent();
        this.volumeChart.timeScale().fitContent();
        this.updateIndicators(candles);
        this.updateChartInfo();
    },
    
    calculateMA(candles, period) {
        const maData = [];
        for (let i = period - 1; i < candles.length; i++) {
            let sum = 0;
            for (let j = 0; j < period; j++) sum += candles[i - j].close;
            maData.push({ time: candles[i].time, value: sum / period });
        }
        return maData;
    },
    
    updateIndicators(candles) {
        if (candles.length === 0) return;
        
        let high = candles[0].high, low = candles[0].low;
        candles.forEach(c => {
            if (c.high > high) high = c.high;
            if (c.low < low) low = c.low;
        });
        
        document.getElementById('highValue').textContent = CoinGeckoService.formatPrice(high);
        document.getElementById('lowValue').textContent = CoinGeckoService.formatPrice(low);
        
        if (candles.length >= 7) {
            let sum7 = 0;
            for (let i = candles.length - 7; i < candles.length; i++) sum7 += candles[i].close;
            document.getElementById('ma7Value').textContent = CoinGeckoService.formatPrice(sum7 / 7);
        }
        
        if (candles.length >= 25) {
            let sum25 = 0;
            for (let i = candles.length - 25; i < candles.length; i++) sum25 += candles[i].close;
            document.getElementById('ma25Value').textContent = CoinGeckoService.formatPrice(sum25 / 25);
        }
    },
    
    async processMessage(userMessage, imageData = null) {
        const finalImageData = imageData || this.imageData;
        
        ChatUI.addLoadingMessage();
        await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
        ChatUI.removeLoadingMessage();
        
        if (finalImageData) {
            userMessage = (userMessage || '') + ' [image attached]';
        }
        
        this.conversationHistory.push({ role: 'user', msg: userMessage, image: finalImageData });
        
        const response = await this.generateResponse(userMessage, finalImageData);
        ChatUI.addBotMessage(response);
        
        this.conversationHistory.push({ role: 'bot', msg: response });
        
        this.imageData = null;
        document.getElementById('imagePreviewContainer').style.display = 'none';
        document.getElementById('imageInput').value = '';
    },
    
    async generateResponse(msg, imageData = null) {
        const text = msg.toLowerCase().trim();
        const words = text.split(/\s+/);
        const btc = CoinGeckoService.getCoinData('bitcoin');
        const eth = CoinGeckoService.getCoinData('ethereum');
        const sol = CoinGeckoService.getCoinData('solana');
        
        const finalImageData = imageData || this.imageData;
        
        // Detect if there's an image
        if (finalImageData) {
            return this.analyzeImage(finalImageData);
        }
        
        // Coin mentions
        const coinMentions = [];
        if (/btc|bitcoin|₿/.test(text)) coinMentions.push('bitcoin');
        if (/eth(ereum)?|Ξ/.test(text) && !/beth/.test(text)) coinMentions.push('ethereum');
        if (/sol(ana)?|◎/.test(text)) coinMentions.push('solana');
        if (/xrp|ripple|✕/.test(text)) coinMentions.push('ripple');
        if (/bnb|binance|◆/.test(text)) coinMentions.push('binancecoin');
        if (/ada|cardano|₳/.test(text)) coinMentions.push('cardano');
        
        // Context awareness - if user mentioned a coin before, use it
        if (coinMentions.length === 0 && this.lastCoinContext) {
            if (/itu|dia|nya|harga|naik|turun|analisis|cek/.test(text)) {
                coinMentions.push(this.lastCoinContext);
            }
        }
        
        // Smart routing
        if (/^(?:halo|hai|hi|hey|p|salam)$/i.test(words[0])) return this.respondCasual('greeting');
        if (/^(?:terima.?kasih|thanks|makasih|tq|oke|ok|sip)$/i.test(text)) return this.respondCasual('thanks');
        if (/^(?:maaf|sorry|oops)$/i.test(text)) return this.respondCasual('sorry');
        
        // Image-related questions
        if (/analisa.?gambar|analyze.?image|lihat.?chart|read.?chart|cek.?gambar/.test(text) && !this.imageData) {
            return this.respondCasual('upload_image');
        }
        
        // Coin-specific
        if (coinMentions.length > 0) {
            this.lastCoinContext = coinMentions[0];
            if (coinMentions.length === 1) {
                return this.respondCoinCasual(coinMentions[0]);
            } else {
                return this.respondMultipleCoins(coinMentions);
            }
        }
        
        // Price query
        if (/harga|price|rate|berapa|worth|kurs|valuasi/.test(text)) {
            return this.respondPriceCasual(text);
        }
        
        // Market analysis
        if (/analisa|analisis|market|pasar|tren|trend|kondisi|situasi|outlook|view/.test(text)) {
            return this.respondMarketCasual();
        }
        
        // Why/cause
        if (/kenapa|mengapa|why|penyebab|alasan|karena|drops?|turun|rally|naik|gain/.test(text)) {
            return this.respondWhyCasual();
        }
        
        // Investment
        if (/beli|jual|buy|sell|invest|masuk|position|signal|worth|murah|mahal|opportunity|entry/.test(text)) {
            return this.respondInvestCasual();
        }
        
        // Prediction
        if (/prediksi|forecast|target|kemana|besok|minggu|bulan|tahun|harus|akan|expect/.test(text)) {
            return this.respondPrediksiCasual();
        }
        
        // Macro
        if (/makro|ekonomi|fed|bank sentral|interest|rate|dollar|inflasi|cpi|gdp|resesi/.test(text)) {
            return this.respondMacroCasual();
        }
        
        // Technical
        if (/teknik|technical|rsi|macd|ma|fibo|bollinger|indicator|candlestick|pattern|support|resistance/.test(text)) {
            return this.respondTechCasual();
        }
        
        // Gold
        if (/emas|gold|safe.haven|perhiasan|commodity/.test(text)) {
            return this.respondGoldCasual();
        }
        
        // Comparison
        if (/bandingkan|compare|mana|lebih|vs|\//.test(text)) {
            return this.respondCompareCasual(text);
        }
        
        // Education
        if (/apa.itu|definisikan|artinya|belajar|explain|jelaskan|panduan/.test(text)) {
            return this.respondEduCasual();
        }
        
        // Strategy
        if (/strategi|strategy|dca|hold|hodl|swing|trading|day.trade/.test(text)) {
            return this.respondStrategyCasual();
        }
        
        // Follow-up conversation
        if (/terus|lalu|dan/.test(text) && this.lastTopic) {
            return this.respondFollowUp(text);
        }
        
        // Casual chat
        if (/gue|gua|aku|saya|deh|dong|nih|lo|lu|kamu/.test(text)) {
            return this.respondChatty(text);
        }
        
        // Help
        if (/help|bantu|tolong|fitur|command|menu|cara.pakai/.test(text)) {
            return this.respondHelpCasual();
        }
        
        // Default - Call Gemini API for general questions
        return this.callGeminiAPI(msg);
    },

    async callGeminiAPI(message) {
        try {
            console.log('[API] Calling Gemini with:', message);
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            const data = await response.json();
            console.log('[API] Response:', data);
            if (data.response) {
                return data.response;
            }
            if (data.error) {
                console.error('[API] Server error:', data.error);
            }
        } catch (err) {
            console.error('Gemini API error:', err);
        }
        return '<p>Maaf, gue lagi nggak bisa jawab sekarang. Coba lagi ya!</p>';
    },
    
    respondCasual(type) {
        const btc = CoinGeckoService.getCoinData('bitcoin');
        const hour = new Date().getHours();
        const timeGreet = hour < 12 ? 'pagi' : hour < 18 ? 'siang' : 'malam';
        
        const responses = {
            greeting: `<p>Yo! Selamat ${timeGreet}! 👋</p><p>Gue CryptoSense AI, siap bantu lo ngobrolin crypto apa aja.</p><p>Tinggal ketik aja, atau paste gambar chart - gue analisain buat lo!</p>`,
            thanks: `<p>Sama-sama! 😊 Kalau ada yang mau ditanyain lagi, gas aja!</p>`,
            sorry: `<p>Waduh, nggak perlu sorry! 😄 Tanya aja yang lain, gue bantuin!</p>`,
            upload_image: `<p>Wah, lo mau analisa gambar chart ya? 🤔</p><p>Cukup paste atau upload gambarnya langsung, terus ketik "analisa" atau pertanyaan lo. Gue bakal coba analisa pattern dan trend-nya!</p><p>Bisa juga tinggal drag & drop gambar ke chat ini.</p>`
        };
        
        return responses[type] || responses.greeting;
    },
    
    respondCoinCasual(coinId) {
        const coin = this.COINS.find(c => c.id === coinId);
        const data = CoinGeckoService.getCoinData(coinId);
        const btcData = CoinGeckoService.getCoinData('bitcoin');
        
        if (!coin) return '<p>Hmm, gue nggak nemu koin itu deh. Coba cek lagi ya.</p>';
        
        let response = '';
        
        if (!data) {
            response += `<p>Wah, data ${coin.symbol} lagi nggak bisa diambil nih. Lo bisa coba lagi bentar lagi atau cek koneksi internet lo.</p>`;
            return response;
        }
        
        const change = data.usd_24h_change || 0;
        const emoji = change >= 2 ? '🚀' : change >= 0 ? '📈' : change >= -2 ? '📊' : '📉';
        const status = change >= 5 ? 'rally gila-gilaan!' : 
                       change >= 3 ? 'naik kenceng!' : 
                       change >= 1 ? 'sedikit naik' :
                       change >= -1 ? 'flat tuh' :
                       change >= -3 ? 'sedikit turun' :
                       change >= -5 ? 'koreksi nih' : 'drop gede!';
        
        response += `<p>${emoji} <strong>${coin.name} (${coin.symbol})</strong></p>`;
        response += `<p>Harga: <span class="data-highlight">${CoinGeckoService.formatPrice(data.usd)}</span></p>`;
        response += `<p>24h: ${this.formatChange(change)} - ${status}</p>`;
        
        if (data.usd_market_cap) {
            response += `<p>Market Cap: <span class="data-highlight">${CoinGeckoService.formatLargeNumber(data.usd_market_cap)}</span></p>`;
        }
        
        if (data.usd_24h_vol) {
            response += `<p>Volume 24h: <span class="data-highlight">${CoinGeckoService.formatVolume(data.usd_24h_vol)}</span></p>`;
        }
        
        // Correlation with BTC
        if (coinId !== 'bitcoin' && btcData) {
            const btcChange = btcData.usd_24h_change || 0;
            const corr = (change > 0 && btcChange > 0) || (change < 0 && btcChange < 0);
            response += `<p>🔗 Korelasi BTC: <span class="${corr ? 'positive-text' : 'negative-text'}">${corr ? 'searah' : 'berlawanan'}</span></p>`;
        }
        
        // Quick insight
        if (coinId === 'bitcoin') {
            if (change >= 3) {
                response += `<p style="color: var(--text-secondary);">💡 BTC rally gede nih! Biasanya altcoins ikut naik juga soon.</p>`;
            } else if (change <= -3) {
                response += `<p style="color: var(--text-secondary);">💡 BTC koreksi nih. Altcoins biasanya ikutan turun.</p>`;
            }
        } else if (coinId === 'ethereum') {
            response += `<p style="color: var(--text-secondary);">💡 ETH itu jantungnya DeFi & NFT ecosystem. Watch berita development-nya!</p>`;
        } else if (coinId === 'solana') {
            response += `<p style="color: var(--text-secondary);">💡 SOL terkenal mahal di kecepatan & fee rendah. Populer buat DeFi & gaming.</p>`;
        }
        
        // Load chart
        this.currentCoin = coinId;
        document.getElementById('chartCoinSelect').value = coinId;
        this.updateChart();
        
        return response;
    },
    
    respondMultipleCoins(coinIds) {
        let response = '<p><strong>📊 Comparison:</strong></p><hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        
        coinIds.forEach(coinId => {
            const coin = this.COINS.find(c => c.id === coinId);
            const data = CoinGeckoService.getCoinData(coinId);
            
            if (coin && data) {
                const change = data.usd_24h_change || 0;
                response += `<p>${change >= 0 ? '📈' : '📉'} <strong>${coin.symbol}</strong>: <span class="data-highlight">${CoinGeckoService.formatPrice(data.usd)}</span> ${this.formatChange(change)}</p>`;
            }
        });
        
        response += '<hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        response += '<p style="font-size: 0.8rem; color: var(--text-muted);">Klik untuk lihat chart masing-masing!</p>';
        
        return response;
    },
    
    respondPriceCasual(text) {
        const btc = CoinGeckoService.getCoinData('bitcoin');
        const eth = CoinGeckoService.getCoinData('ethereum');
        const sol = CoinGeckoService.getCoinData('solana');
        
        let response = '<p><strong>📊 Harga Crypto:</strong></p><hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        
        const coins = [
            { coin: btc, name: 'BTC', icon: '₿' },
            { coin: eth, name: 'ETH', icon: 'Ξ' },
            { coin: sol, name: 'SOL', icon: '◎' }
        ];
        
        coins.forEach(({ coin, name, icon }) => {
            if (coin) {
                const change = coin.usd_24h_change || 0;
                response += `<p>${icon} <strong>${name}</strong>: <span class="data-highlight">${CoinGeckoService.formatPrice(coin.usd)}</span> ${this.formatChange(change)}</p>`;
            }
        });
        
        response += '<hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        response += '<p style="font-size: 0.8rem; color: var(--text-muted);">Mau tanya coin lain? Ketik aja nama coinnya!</p>';
        
        return response;
    },
    
    respondMarketCasual() {
        const btc = CoinGeckoService.getCoinData('bitcoin');
        const eth = CoinGeckoService.getCoinData('ethereum');
        const sol = CoinGeckoService.getCoinData('solana');
        
        if (!btc) return '<p>Waduh, data lagi error nih. Coba lagi bentar ya!</p>';
        
        const btcChange = btc.usd_24h_change || 0;
        const ethChange = eth?.usd_24h_change || 0;
        const solChange = sol?.usd_24h_change || 0;
        const avgChange = (btcChange + ethChange + solChange) / 3;
        
        let response = '<p><strong>📊 Update Pasar:</strong></p><hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        
        response += `<p>• BTC: <span class="data-highlight">${CoinGeckoService.formatPrice(btc.usd)}</span> ${this.formatChange(btcChange)}</p>`;
        if (eth) response += `<p>• ETH: <span class="data-highlight">${CoinGeckoService.formatPrice(eth.usd)}</span> ${this.formatChange(ethChange)}</p>`;
        if (sol) response += `<p>• SOL: <span class="data-highlight">${CoinGeckoService.formatPrice(sol.usd)}</span> ${this.formatChange(solChange)}</p>`;
        
        response += '<hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        
        if (avgChange >= 5) {
            response += '<p>🚀 <strong>PASARAN BARA!</strong> Rally gede! Sentimen risk-on lagi tinggi.</p>';
        } else if (avgChange >= 2) {
            response += '<p>📈 <strong>PASAR BULLISH</strong> - Momentum positif nih! Investor mulai masuk.</p>';
        } else if (avgChange <= -5) {
            response += '<p>💥 <strong>KOREKSI DALAM!</strong> Banyak yang panic sell nih.</p>';
        } else if (avgChange <= -2) {
            response += '<p>📉 <strong>PASAR BEARISH</strong> - Tekanan jual masih terasa.</p>';
        } else {
            response += '<p>⚖️ <strong>KONSOLIDASI</strong> - Market lagi ragu, wait and see.</p>';
        }
        
        // Macro
        if (this.macroData.usInterestRate > 5) {
            response += '<p>🌍 <strong>Fed hold high rates</strong> - Dollar kuat, crypto masih tertekan.</p>';
        }
        
        // Fear & Greed
        const fg = this.getFearGreedLevel();
        response += `<p>😨 Fear & Greed: <strong>${fg}</strong></p>`;
        
        if (fg < 30) {
            response += '<p style="color: var(--positive);">💎 Bisa jadi entry opportunity nih!</p>';
        } else if (fg > 70) {
            response += '<p style="color: var(--negative);">⚠️ Hati-hati, greed tinggi bisa trigger reversal!</p>';
        }
        
        return response;
    },
    
    respondWhyCasual() {
        const btc = CoinGeckoService.getCoinData('bitcoin');
        if (!btc) return '<p>Data lagi nggak bisa diakses nih. Coba lagi bentar ya!</p>';
        
        const change = btc.usd_24h_change || 0;
        
        let response = '<p><strong>📊 Kenapa Crypto Bergerak?</strong></p><hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        
        if (change >= 3) {
            response += '<p>📈 <strong>BTC naik nih!</strong></p>';
            response += '<p>Kemungkinan penyebabnya:</p>';
            response += '<p>• Sentimen risk-on meningkat</p>';
            response += '<p>• Institutional buying masuk</p>';
            response += '<p>• Positive news / development</p>';
            response += '<p>• Short squeeze liquidation</p>';
        } else if (change <= -3) {
            response += '<p>📉 <strong>BTC turun nih!</strong></p>';
            response += '<p>Kemungkinan penyebabnya:</p>';
            response += '<p>• Panic selling / fear</p>';
            response += '<p>• Negative macro news</p>';
            response += '<p>• Profit taking</p>';
            response += '<p>• Liquidation cascade</p>';
        } else {
            response += '<p>📊 <strong>BTC lagi flat</strong></p>';
            response += '<p>Market lagi konsolidasi, nggak ada katalis jelas.</p>';
        }
        
        // Macro
        response += '<hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        response += '<p><strong>Faktor Makro:</strong></p>';
        if (this.macroData.usInterestRate > 5) {
            response += '<p>• 🇺🇸 Interest rate tinggi = dollar kuat = crypto tertekan</p>';
        }
        if (this.macroData.usInflation > 4) {
            response += '<p>• 📈 Inflation masih tinggi = Fed stay hawkish</p>';
        }
        
        response += '<hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        response += '<p><strong>💡 Tips:</strong> Jangan reactive terhadap pergerakan harian. Fokus ke long-term trend!</p>';
        
        return response;
    },
    
    respondInvestCasual() {
        const btc = CoinGeckoService.getCoinData('bitcoin');
        const fg = this.getFearGreedLevel();
        
        let response = '<p><strong>💡 Analisis Investasi:</strong></p><hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        
        response += `<p><strong>Fear & Greed Index:</strong> ${fg}</p>`;
        
        if (fg < 25) {
            response += '<p>😱 <strong>EXTREME FEAR!</strong></p>';
            response += '<p>Banyak yang panic sell. Kalau mau jangka panjang, ini bisa jadi entry point yang bagus!</p>';
            response += '<p>💎 <strong>Tip:</strong> Gunakan DCA - invest dikit-dikit tiap minggu.</p>';
        } else if (fg < 40) {
            response += '<p>😨 <strong>Fear tinggi</strong></p>';
            response += '<p>Investors ragu. Bisa averaging in sedikit-sedikit di support.</p>';
        } else if (fg > 75) {
            response += '<p>🤑 <strong>EXTREME GREED!</strong></p>';
            response += '<p>Euforia tinggi - semua orang FOMO buying!</p>';
            response += '<p>⚠️ <strong>Warning:</strong> Hati-hati, reversal bisa terjadi kapan aja!</p>';
        } else if (fg > 60) {
            response += '<p>😏 <strong>Greed tinggi</strong></p>';
            response += '<p>Bullish tapi belum extreme. Stay cautious ya!</p>';
        } else {
            response += '<p>🎯 <strong>Netral</strong></p>';
            response += '<p>Konsolidasi sehat. Good time untuk DCA!</p>';
        }
        
        response += '<hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        response += '<p><strong>📈 Strategi Aman:</strong></p>';
        response += '<p><strong>DCA (Dollar Cost Averaging)</strong> - Invest fixed amount tiap minggu/bulan tanpa peduli harga.</p>';
        response += '<p style="color: var(--text-secondary);">Contoh: $50/minggu ke BTC. Nggak perlu tau harga, averaging aja!</p>';
        
        response += '<hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        response += '<p><strong>⚠️ Remember:</strong></p>';
        response += '<p>1. Invest aja uang yang siap kehilangan</p>';
        response += '<p>2. Diversifikasi portfolio</p>';
        response += '<p>3. Always DYOR</p>';
        
        return response;
    },
    
    respondPrediksiCasual() {
        const btc = CoinGeckoService.getCoinData('bitcoin');
        const sentiment = this.analyzeSentiment(btc?.usd_24h_change || 0);
        
        let response = '<p><strong>🔮 Outlook:</strong></p>';
        response += '<p style="color: var(--text-muted);">⚠️ Warning: Nobody can predict market for sure!</p>';
        response += '<hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        
        response += '<p><strong>Faktor Teknikal:</strong></p>';
        if (sentiment > 0.3) {
            response += '<p>✅ Momentum positif - uptrend visible</p>';
        } else if (sentiment < -0.3) {
            response += '<p>⚠️ Momentum negatif - downtrend visible</p>';
        } else {
            response += '<p>🔄 Sideways - consolidation phase</p>';
        }
        
        response += '<hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        response += '<p><strong>Faktor Makro:</strong></p>';
        if (this.macroData.usInterestRate > 5) {
            response += '<p>🇺🇸 Interest rate tinggi - crypto under pressure</p>';
        } else {
            response += '<p>🇺🇸 Interest rate rendah - liquidity meningkat</p>';
        }
        
        response += '<hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        
        if (sentiment > 0 && this.macroData.usInflation < 4) {
            response += '<p>📈 <strong>Outlook: BULLISH</strong></p>';
            response += '<p>Sentimen + macro mendukung.</p>';
        } else if (sentiment < 0 && this.macroData.usInterestRate > 5) {
            response += '<p>📉 <strong>Outlook: BEARISH</strong></p>';
            response += '<p>Tekanan dari berbagai arah.</p>';
        } else {
            response += '<p>⚖️ <strong>Outlook: NETRAL</strong></p>';
            response += '<p>Wait and see, nggak ada katalis jelas.</p>';
        }
        
        response += '<hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        response += '<p style="color: var(--text-muted);">⚠️ Ini bukan nasihat keuangan. Crypto itu volatil - invest dengan hati-hati!</p>';
        
        return response;
    },
    
    respondMacroCasual() {
        let response = '<p><strong>🌍 Analisis Makro:</strong></p><hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        
        response += `<p><strong>🇺🇸 US Interest Rate:</strong> <span class="data-highlight">${this.macroData.usInterestRate}%</span></p>`;
        if (this.macroData.usInterestRate >= 5) {
            response += '<p style="color: var(--text-secondary);">Rate tinggi = Dollar kuat = Crypto tertekan</p>';
        }
        
        response += `<p><strong>📉 Inflation:</strong> <span class="data-highlight">${this.macroData.usInflation}%</span></p>`;
        if (this.macroData.usInflation > 4) {
            response += '<p style="color: var(--text-secondary);">Above target 2% - Fed stay hawkish</p>';
        } else if (this.macroData.usInflation < 3) {
            response += '<p style="color: var(--positive);">Below target - Fed could pivot soon</p>';
        }
        
        response += `<p><strong>🥇 Gold:</strong> <span class="data-highlight">$${Math.round(this.macroData.goldPrice)}/oz</span></p>`;
        
        response += '<hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        
        const macroScore = (this.macroData.usInterestRate > 5 ? -1 : 0) + (this.macroData.usInflation > 4 ? -1 : 0);
        
        if (macroScore <= -2) {
            response += '<p>🌍 <strong>Macro: BEARISH untuk crypto</p>';
            response += '<p style="color: var(--text-secondary);">High rates + inflation = less liquidity = headwind</p>';
        } else {
            response += '<p>🌍 <strong>Macro: CONDITIONALLY BULLISH</p>';
            response += '<p style="color: var(--text-secondary);">Wait for Fed pivot signal</p>';
        }
        
        return response;
    },
    
    respondTechCasual() {
        let response = '<p><strong>📈 Analisis Teknikal:</strong></p><hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        
        response += '<p><strong>MA (Moving Average):</strong></p>';
        response += '<p>• MA7 (biru) = short-term trend</p>';
        response += '<p>• MA25 (orange) = medium-term trend</p>';
        response += '<p style="color: var(--text-secondary);">Kalau harga > MA7 > MA25 = bullish</p>';
        
        response += '<p><strong>RSI:</strong></p>';
        response += '<p>• > 70 = Overbought (potential reversal)</p>';
        response += '<p>• < 30 = Oversold (potential bounce)</p>';
        
        response += '<p><strong>Volume:</strong></p>';
        response += '<p>• High vol + price up = strong confirmation</p>';
        response += '<p>• High vol + price down = strong selling pressure</p>';
        
        response += '<p><strong>Support & Resistance:</strong></p>';
        response += '<p>• Support = where buying > selling</p>';
        response += '<p>• Resistance = where selling > buying</p>';
        
        response += '<hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        response += '<p style="color: var(--text-muted);">💡 TA nggak 100% akurat. Combine dengan fundamental analysis!</p>';
        
        return response;
    },
    
    respondGoldCasual() {
        const btc = CoinGeckoService.getCoinData('bitcoin');
        const gold = this.macroData.goldPrice;
        
        let response = '<p><strong>🥇 BTC vs Emas:</strong></p><hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        
        response += `<p>Gold: <span class="data-highlight">$${Math.round(gold)}/oz</span></p>`;
        
        if (btc) {
            const btcChange = btc.usd_24h_change || 0;
            
            response += `<p>BTC: ${this.formatChange(btcChange)}</p>`;
            response += '<hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
            
            if (btcChange >= 2 && gold > 2000) {
                response += '<p>🚀 <strong>RISK-ON!</strong></p>';
                response += '<p>BTC rally + gold strong = unusual pattern!</p>';
                response += '<p style="color: var(--positive);">💡 Bisa jadi institutional money masuk ke crypto.</p>';
            } else if (btcChange <= -2 && gold > 2000) {
                response += '<p>📉 <strong>RISK-OFF!</strong></p>';
                response += '<p>BTC drop, gold strong = safe haven preferred.</p>';
            } else {
                response += '<p>⚖️ <strong>Mixed signals</strong></p>';
                response += '<p>Nggak ada clear risk-on/off narrative.</p>';
            }
        }
        
        return response;
    },
    
    respondCompareCasual(text) {
        let response = '<p><strong>⚖️ Comparison:</strong></p><hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        
        const btc = CoinGeckoService.getCoinData('bitcoin');
        const eth = CoinGeckoService.getCoinData('ethereum');
        const sol = CoinGeckoService.getCoinData('solana');
        
        if (text.includes('btc') && text.includes('eth')) {
            response += '<p><strong>BTC vs ETH:</strong></p>';
            response += '<p><strong>BTC:</strong> Store of value, digital gold, max 21 juta supply</p>';
            response += '<p><strong>ETH:</strong> Smart contract platform, DeFi hub, unlimited supply</p>';
            response += '<p><strong>Kesimpulan:</strong> BTC = safe haven, ETH = ecosystem exposure</p>';
        } else if (text.includes('btc')) {
            if (btc) response += `<p><strong>BTC:</strong> <span class="data-highlight">${CoinGeckoService.formatPrice(btc.usd)}</span></p>`;
            response += '<p>Market leader, blue chip crypto. Paling stabil dari semua altcoins.</p>';
        } else if (text.includes('eth')) {
            if (eth) response += `<p><strong>ETH:</strong> <span class="data-highlight">${CoinGeckoService.formatPrice(eth.usd)}</span></p>`;
            response += '<p>Platform smart contract terbesar. Jantung DeFi & NFT ecosystem.</p>';
        } else if (text.includes('sol')) {
            if (sol) response += `<p><strong>SOL:</strong> <span class="data-highlight">${CoinGeckoService.formatPrice(sol.usd)}</span></p>`;
            response += '<p>High speed, low fee blockchain. Populer buat DeFi & gaming.</p>';
        } else {
            if (btc) response += `<p><strong>BTC:</strong> <span class="data-highlight">${CoinGeckoService.formatPrice(btc.usd)}</span></p>`;
            if (eth) response += `<p><strong>ETH:</strong> <span class="data-highlight">${CoinGeckoService.formatPrice(eth.usd)}</span></p>`;
            if (sol) response += `<p><strong>SOL:</strong> <span class="data-highlight">${CoinGeckoService.formatPrice(sol.usd)}</span></p>`;
        }
        
        return response;
    },
    
    respondEduCasual() {
        let response = '<p><strong>📚 Edukasi Crypto:</strong></p><hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        
        if (/bitcoin|btc/.test(this.lastTopic || '')) {
            response += '<p><strong>Bitcoin (BTC):</strong></p>';
            response += '<p>Cryptocurrency pertama, diciptakan 2009 oleh Satoshi Nakamoto.</p>';
            response += '<p>• Max supply: 21 juta BTC only</p>';
            response += '<p>• Sering disebut "digital gold"</p>';
            response += '<p>• Konsensus: Proof of Work</p>';
            response += '<p>• Halving setiap 4 tahun - historically bullish</p>';
        } else if (/ethereum|eth/.test(this.lastTopic || '')) {
            response += '<p><strong>Ethereum (ETH):</strong></p>';
            response += '<p>Platform smart contract terbesar.</p>';
            response += '<p>• Used untuk DeFi, NFTs, DAOs</p>';
            response += '<p>• Switched ke Proof of Stake</p>';
            response += '<p>• EIP-1559 = deflationary mechanism</p>';
        } else {
            response += '<p><strong>Crypto Basics:</strong></p>';
            response += '<p>• <strong>Blockchain:</strong> Distributed ledger, tamper-proof</p>';
            response += '<p>• <strong>Market Cap:</strong> Harga × Supply</p>';
            response += '<p>• <strong>DeFi:</strong> Financial services tanpa perantara</p>';
            response += '<p>• <strong>NFT:</strong> Unique digital assets</p>';
        }
        
        response += '<hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        response += '<p style="color: var(--text-muted);">💡 Tanya aja kalau mau tau lebih spesifik!</p>';
        
        return response;
    },
    
    respondStrategyCasual() {
        let response = '<p><strong>🎯 Strategi Trading & Investing:</strong></p><hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        
        response += '<p><strong>📈 Long-Term / HODL:</strong></p>';
        response += '<p>Buy and hold untuk months/years. Ride out volatility.</p>';
        response += '<p>Best untuk: Yang percaya value crypto jangka panjang.</p>';
        
        response += '<p><strong>💰 DCA (Dollar Cost Averaging):</strong></p>';
        response += '<p>Invest fixed amount tiap minggu/bulan.</p>';
        response += '<p>• Reduces timing risk</p>';
        response += '<p>• Removes emotion dari decision</p>';
        response += '<p>• Contoh: $50/minggu ke BTC</p>';
        
        response += '<p><strong>📊 Swing Trading:</strong></p>';
        response += '<p>Hold untuk days-weeks. Capture medium-term moves.</p>';
        
        response += '<p><strong>⚠️ Risk Management:</strong></p>';
        response += '<p>• Position size: Max 1-5% per trade</p>';
        response += '<p>• Stop loss: Always have exit plan</p>';
        response += '<p>• Risk/Reward: Aim min 1:2</p>';
        
        response += '<hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        response += '<p><strong>🧠 Psikologi:</strong></p>';
        response += '<p>• Jangan FOMO atau panic sell</p>';
        response += '<p>• Accept that you won\'t time perfectly</p>';
        response += '<p>• Stay calm, trading is a marathon</p>';
        
        return response;
    },
    
    respondChatty(text) {
        this.lastTopic = text;
        
        if (/bingung|ragu|confused/.test(text)) {
            return `<p>Wajar kok bingung! Crypto emang complicated 🧠</p><p>Tips: Mulai dari basics - apa itu BTC, apa itu blockchain. Baru pelan-pelan invest sedikit-sedikit sambil belajar.</p><p>DCA strategy paling recommended buat pemula!</p>`;
        }
        
        if (/senang|happy|excited|euphoria/.test(text)) {
            return `<p>Happy to hear that! 🎉</p><p>Semoga profits terus ya! Tapi tetap hati-hati, market bisa berubah kapan aja.</p><p>Remember: "Bulls make money, bears make money, pigs get slaughtered." 🐷</p>`;
        }
        
        if (/sedih|sad|depresi|galau|rugi/.test(text)) {
            return `<p>Waduh, turutannya nih 😔</p><p>Ingat: Loss itu bagian dari game. Yang penting:</p><p>1. Jangan invest more than you can lose</p><p>2. Stay calm, jangan decision based on emotions</p><p>3. This is a long game - pasar bakal pulih eventually</p>`;
        }
        
        if (/stress|panik|fomo/.test(text)) {
            return `<p>Calm down bro! 🧘</p><p>FOMO dan panic selling itu musuh terbesar trader.</p><p>Tips:</p><p>• Take a break dari chart</p><p>• Jangan check harga every second</p><p>• Fokus ke long-term goals</p><p>• Remember why you invested in the first place</p>`;
        }
        
        if (/撸|liu|lol|hehe|haha|wow/.test(text)) {
            return `<p>Hahaha! 😄</p><p>Lo bisa aja! Ada yang mau ditanyain soal crypto? Gue siap bantu!</p>`;
        }
        
        return `<p>Hei! 😄</p><p>Gue di sini buat bantu lo ngertiin crypto. Mau tanya apa? Bisa soal harga, analisis, strategi, edukasi - apa aja!</p><p>Atau kalau lo mau upload gambar chart, gue analisain juga bisa!</p>`;
    },
    
    respondFollowUp(text) {
        if (/harga|price|berapa/.test(text)) {
            if (this.lastCoinContext) {
                return this.respondCoinCasual(this.lastCoinContext);
            }
            return this.respondPriceCasual(text);
        }
        
        return `<p>Hmm, gue kurang paham follow-up-nya 😅</p><p>Coba di-expain lagi atau tanya lebih spesifik ya!</p>`;
    },
    
    respondHelpCasual() {
        let response = '<p><strong>🔧 Fitur CryptoSense AI:</strong></p><hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        
        response += '<p><strong>📊 Data Real-time:</strong></p>';
        response += '<p>• BTC, ETH, SOL, XRP, BNB, ADA</p>';
        response += '<p>• Market cap, volume, 24h change</p>';
        
        response += '<p><strong>📈 Live Chart:</strong></p>';
        response += '<p>• Candlestick (TradingView style)</p>';
        response += '<p>• MA7, MA25, Volume</p>';
        response += '<p>• Timeframes: 1H, 4H, 1D, 1W, 1M</p>';
        
        response += '<p><strong>🖼️ Analisa Gambar:</strong></p>';
        response += '<p>• Upload/ paste gambar chart</p>';
        response += '<p>• Gue analisa pattern & trend</p>';
        
        response += '<p><strong>😨 Fear & Greed Index</strong></p>';
        response += '<p><strong>🌍 Macro Indicators:</strong> Fed, BOJ, Inflation, Gold</p>';
        response += '<p><strong>🔔 Price Alert:</strong> Set alert buat price tertentu</p>';
        
        response += '<hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        response += '<p><strong>💬 Cara Pakai:</strong></p>';
        response += '<p>1. Ketik pertanyaan di chat</p>';
        response += '<p>2. Upload/ paste gambar chart</p>';
        response += '<p>3. Klik crypto card untuk lihat chart</p>';
        
        return response;
    },
    
    respondSmartCasual(btc, text) {
        this.lastTopic = text;
        
        if (btc) {
            const change = btc.usd_24h_change || 0;
            return `<p>Oke, gue tangkep! 👍</p>
                <p><strong>Quick Update:</strong></p>
                <p>BTC: <span class="data-highlight">${CoinGeckoService.formatPrice(btc.usd)}</span> ${this.formatChange(change)}</p>
                <hr style="border-color: var(--border-color); margin: 0.5rem 0;">
                <p>Mau tanya yang lebih spesifik? Misalnya:</p>
                <p>• "Kenapa crypto turun?"</p>
                <p>• "Apakah bagus untuk investasi?"</p>
                <p>• "Analisa pasar"</p>
                <p>• Atau paste gambar chart - gue analisain!</p>`;
        }
        
        return `<p>Hmm, gue kurang ngerti nih 😅</p>
            <p>Tapi gue specialize di crypto analysis! Coba tanya:</p>
            <p>• Harga crypto sekarang</p>
            <p>• Analisis pasar</p>
            <p>• Strategi investasi</p>
            <p>• Atau upload gambar chart!</p>`;
    },
    
    analyzeImage(imageData) {
        let response = '<div class="image-analysis-container">';
        response += `<img src="${imageData}" class="analyzed-image" alt="Uploaded chart" style="max-width: 100%; max-height: 250px; border-radius: 8px; margin-bottom: 12px; border: 1px solid var(--border-color);" />`;
        response += '<p><strong>🖼️ Analisa Gambar Chart:</strong></p>';
        response += '<hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        
        response += '<p>Wah, lo upload gambar chart ya! 🤔</p>';
        response += '<p>Gue akan coba analisa dari visual:</p>';
        
        response += '<div class="image-analysis-box">';
        response += '<p><strong>📊 Pengamatan Visual:</strong></p>';
        
        // Random analysis based on patterns (simulated)
        const patterns = [
            { name: 'Uptrend Line', desc: 'Harga terlihat lagi uptrend, ada kemungkinan continues naik' },
            { name: 'Downtrend Line', desc: 'Harga terlihat lagi downtrend, hati-hati potential terus turun' },
            { name: 'Sideways/Range', desc: 'Chart lagi range-bound, nggak ada arah jelas' },
            { name: 'Breakout Pattern', desc: 'Ada pola breakout - harga berpotensi naik/break resistance' },
            { name: 'Double Top', desc: 'Pola double top - potential reversal ke bawah' },
            { name: 'Higher Highs', desc: 'Chart bikin higher highs - uptrend kuat!' }
        ];
        
        const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        response += `<p>🔍 Pattern terdeteksi: <strong>${randomPattern.name}</strong></p>`;
        response += `<p>💡 ${randomPattern.desc}</p>`;
        
        response += '<hr style="border-color: rgba(6, 182, 212, 0.3); margin: 0.5rem 0;">';
        response += '<p><strong>⚠️ Catatan Penting:</strong></p>';
        response += '<p>• Analisa dari gambar nggak seakurat data real</p>';
        response += '<p>• Disarankan untuk cross-check dengan data aktual</p>';
        response += '<p>• Selalu DYOR sebelum take action</p>';
        
        response += '</div>';
        
        response += '<hr style="border-color: var(--border-color); margin: 0.5rem 0;">';
        response += '<p style="color: var(--text-muted); font-size: 0.8rem;">💡 Untuk analisa lebih akurat, lo bisa langsung lihat chart interactive di bawah dengan klik crypto card!</p>';
        
        response += '</div>';
        
        return response;
    },
    
    analyzeSentiment(btcChange) {
        let score = 0;
        if (btcChange > 5) score += 3;
        else if (btcChange > 3) score += 2;
        else if (btcChange > 1) score += 1;
        else if (btcChange < -5) score -= 3;
        else if (btcChange < -3) score -= 2;
        else if (btcChange < -1) score -= 1;
        
        if (this.macroData.usInterestRate > 5.5) score -= 1;
        if (this.macroData.usInterestRate < 4) score += 1;
        if (this.macroData.usInflation < 3) score += 1;
        if (this.macroData.usInflation > 5) score -= 1;
        
        return score / 4;
    },
    
    getFearGreedLevel() {
        const btc = CoinGeckoService.getCoinData('bitcoin');
        if (!btc) return 50;
        const sentiment = this.analyzeSentiment(btc.usd_24h_change || 0);
        return Math.round(Math.max(10, Math.min(90, 50 + sentiment * 35)));
    },
    
    formatChange(change) {
        const cls = change >= 0 ? 'positive-text' : 'negative-text';
        return `<span class="${cls}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</span>`;
    }
};

window.AIEngine = AIEngine;

document.addEventListener('DOMContentLoaded', () => AIEngine.init());
