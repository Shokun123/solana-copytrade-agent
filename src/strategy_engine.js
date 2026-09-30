/**
 * Quantitative Strategy & Signal Engine
 * Computes Relative Strength Index (RSI), Simple Moving Averages (SMA),
 * and generates actionable Buy / Sell signals.
 */

class StrategyEngine {
  constructor(rsiPeriod = 14) {
    this.rsiPeriod = rsiPeriod;
  }

  calculateSMA(prices, period = 10) {
    if (prices.length < period) return null;
    const slice = prices.slice(-period);
    const sum = slice.reduce((acc, p) => acc + p, 0);
    return parseFloat((sum / period).toFixed(4));
  }

  calculateRSI(prices) {
    if (prices.length <= this.rsiPeriod) return 50.0; // Neutral default

    let gains = 0;
    let losses = 0;

    for (let i = prices.length - this.rsiPeriod; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff >= 0) {
        gains += diff;
      } else {
        losses += Math.abs(diff);
      }
    }

    const avgGain = gains / this.rsiPeriod;
    const avgLoss = losses / this.rsiPeriod;

    if (avgLoss === 0) return 100.0;
    const rs = avgGain / avgLoss;
    return parseFloat((100 - (100 / (1 + rs))).toFixed(2));
  }

  evaluateSignal(prices) {
    if (prices.length < 5) {
      return { action: 'HOLD', confidence: 0, reason: 'Accumulating price data points' };
    }

    const currentPrice = prices[prices.length - 1];
    const smaFast = this.calculateSMA(prices, 5);
    const rsi = this.calculateRSI(prices);

    // Oversold condition with momentum recovery
    if (rsi < 35 && currentPrice > smaFast) {
      return {
        action: 'BUY',
        confidence: 85,
        rsi,
        currentPrice,
        reason: `RSI oversold (${rsi}) + Golden cross above 5-SMA ($${smaFast})`
      };
    }

    // Overbought condition with downward break
    if (rsi > 70 && currentPrice < smaFast) {
      return {
        action: 'SELL',
        confidence: 88,
        rsi,
        currentPrice,
        reason: `RSI overbought (${rsi}) + Death cross below 5-SMA ($${smaFast})`
      };
    }

    return {
      action: 'HOLD',
      confidence: 50,
      rsi,
      currentPrice,
      reason: `Stable consolidation phase (RSI: ${rsi})`
    };
  }
}

module.exports = { StrategyEngine };
