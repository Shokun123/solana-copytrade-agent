/**
 * Market Data Feed Service
 * Fetches real-time price feeds via Binance Public REST API (0 API Keys required)
 * and falls back gracefully to high-precision synthetic tick generation for testing.
 */

const https = require('https');

class MarketFeed {
  constructor(symbol = 'SOLUSDT') {
    this.symbol = symbol.toUpperCase();
    this.lastPrice = 145.50; // Initial fallback price
    this.priceHistory = [];
  }

  async fetchRealPrice() {
    return new Promise((resolve) => {
      const url = `https://api.binance.com/api/v3/ticker/price?symbol=${this.symbol}`;
      const req = https.get(url, { timeout: 3000 }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed && parsed.price) {
              const price = parseFloat(parsed.price);
              this.lastPrice = price;
              this.recordPrice(price);
              resolve({ success: true, price, symbol: this.symbol, source: 'Binance-Live' });
              return;
            }
          } catch (e) {}
          resolve(this.generateSyntheticTick());
        });
      });

      req.on('error', () => {
        resolve(this.generateSyntheticTick());
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(this.generateSyntheticTick());
      });
    });
  }

  generateSyntheticTick() {
    // Generate realistic micro-volatility (+/- 0.35%)
    const changePct = (Math.random() - 0.49) * 0.007;
    this.lastPrice = parseFloat((this.lastPrice * (1 + changePct)).toFixed(4));
    this.recordPrice(this.lastPrice);
    return {
      success: true,
      price: this.lastPrice,
      symbol: this.symbol,
      source: 'Internal-Precision-Simulator'
    };
  }

  recordPrice(price) {
    this.priceHistory.push({
      timestamp: Date.now(),
      price
    });
    if (this.priceHistory.length > 50) {
      this.priceHistory.shift();
    }
  }

  getPrices() {
    return this.priceHistory.map(p => p.price);
  }
}

module.exports = { MarketFeed };
