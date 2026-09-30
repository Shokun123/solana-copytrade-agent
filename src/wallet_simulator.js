/**
 * Virtual Paper Trading Portfolio & Risk Manager
 * Tracks simulated USDT & SOL balances, orders, execution logs, and PnL.
 */

class WalletSimulator {
  constructor(initialUsdt = 1000.0) {
    this.initialBalance = initialUsdt;
    this.usdtBalance = initialUsdt;
    this.solBalance = 0.0;
    this.trades = [];
    this.openPositions = [];
  }

  executeBuy(price, amountUsdt = 100.0) {
    if (this.usdtBalance < amountUsdt) {
      return { success: false, reason: 'Insufficient simulated USDT balance' };
    }

    const solAcquired = parseFloat((amountUsdt / price).toFixed(4));
    this.usdtBalance -= amountUsdt;
    this.solBalance += solAcquired;

    const trade = {
      id: `TR-${Date.now()}`,
      type: 'BUY',
      price,
      solAmount: solAcquired,
      usdtSpent: amountUsdt,
      timestamp: new Date().toISOString()
    };

    this.trades.push(trade);
    this.openPositions.push(trade);

    return {
      success: true,
      trade,
      currentBalances: this.getBalances(price)
    };
  }

  executeSell(price) {
    if (this.solBalance <= 0) {
      return { success: false, reason: 'No SOL available to sell' };
    }

    const usdtReceived = parseFloat((this.solBalance * price).toFixed(2));
    const soldAmount = this.solBalance;

    this.solBalance = 0.0;
    this.usdtBalance += usdtReceived;

    const trade = {
      id: `TR-${Date.now()}`,
      type: 'SELL',
      price,
      solAmount: soldAmount,
      usdtReceived,
      timestamp: new Date().toISOString()
    };

    this.trades.push(trade);
    this.openPositions = [];

    return {
      success: true,
      trade,
      currentBalances: this.getBalances(price)
    };
  }

  getBalances(currentSolPrice) {
    const portfolioValue = parseFloat((this.usdtBalance + (this.solBalance * currentSolPrice)).toFixed(2));
    const totalPnlUsdt = parseFloat((portfolioValue - this.initialBalance).toFixed(2));
    const totalPnlPct = parseFloat(((totalPnlUsdt / this.initialBalance) * 100).toFixed(2));

    return {
      usdt: parseFloat(this.usdtBalance.toFixed(2)),
      sol: parseFloat(this.solBalance.toFixed(4)),
      totalPortfolioUsd: portfolioValue,
      pnlUsdt: totalPnlUsdt,
      pnlPercentage: totalPnlPct,
      tradeCount: this.trades.length
    };
  }
}

module.exports = { WalletSimulator };
