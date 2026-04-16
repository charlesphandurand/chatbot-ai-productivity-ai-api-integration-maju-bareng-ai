const CoinGeckoService = {
    BASE_URL: 'https://api.coingecko.com/api/v3',
    
    COINS: [
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
        { id: 'solana', symbol: 'SOL', name: 'Solana', icon: '◎' },
        { id: 'ripple', symbol: 'XRP', name: 'XRP', icon: '✕' },
        { id: 'binancecoin', symbol: 'BNB', name: 'BNB', icon: '◆' },
        { id: 'cardano', symbol: 'ADA', name: 'Cardano', icon: '₳' }
    ],
    
    cachedData: {},
    lastFetch: null,
    
    async fetchAllCoinsData() {
        try {
            const ids = this.COINS.map(c => c.id).join(',');
            const response = await fetch(
                `${this.BASE_URL}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
            );
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            this.COINS.forEach(coin => {
                if (data[coin.id]) {
                    this.cachedData[coin.id] = data[coin.id];
                }
            });
            
            this.lastFetch = new Date();
            return this.cachedData;
        } catch (error) {
            console.error('Error fetching coins:', error);
            return this.cachedData;
        }
    },
    
    async fetchCoinOHLC(coinId, days = 7) {
        try {
            const response = await fetch(
                `${this.BASE_URL}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`
            );
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const ohlcData = await response.json();
            
            const candles = ohlcData.map(d => ({
                time: d[0] / 1000,
                open: d[1],
                high: d[2],
                low: d[3],
                close: d[4],
            }));
            
            const volumes = ohlcData.map(d => ({
                time: d[0] / 1000,
                value: d[5] || 0,
                color: d[4] >= d[1] ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
            }));
            
            return { candles, volumes };
        } catch (error) {
            console.error('Error fetching OHLC:', error);
            return null;
        }
    },
    
    async fetchGoldPrice() {
        const mockGold = 2045 + (Math.random() - 0.5) * 50;
        return mockGold;
    },
    
    getCoinData(coinId) {
        return this.cachedData[coinId] || null;
    },
    
    getAllCoins() {
        return this.COINS.map(coin => ({
            ...coin,
            data: this.cachedData[coin.id] || null
        }));
    },
    
    formatPrice(price) {
        if (!price) return '--';
        if (price >= 1000) {
            return '$' + Math.round(price).toLocaleString();
        }
        return '$' + price.toFixed(price < 1 ? 4 : 2);
    },
    
    formatChange(change) {
        if (change === undefined) return '--';
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(2)}%`;
    },
    
    formatVolume(vol) {
        if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
        if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
        if (vol >= 1e3) return `$${(vol / 1e3).toFixed(2)}K`;
        return `$${vol.toFixed(2)}`;
    },
    
    formatLargeNumber(num) {
        if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        return `$${num.toFixed(2)}`;
    }
};

window.CoinGeckoService = CoinGeckoService;
