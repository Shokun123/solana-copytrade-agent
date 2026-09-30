/**
 * Autonomous Live Trading & Paper Execution Daemon
 * Runs 24/7 background operational loop for Solana & Binance Copytrade Agent.
 * Tracks live prices, executes automated quantitative strategies, and maintains real-time ledger.
 */

const fs = require('fs');
const path = require('path');
const { MarketFeed } = require('./market_feed');
const { StrategyEngine } = require('./strategy_engine');
const { WalletSimulator } = require('./wallet_simulator');
const { BINANCE_PAY_CONFIG } = require('./license_manager');

const DATA_DIR = path.join(__dirname, '..', 'data');
const STATE_FILE = path.join(DATA_DIR, 'live_portfolio_state.json');
const LOG_FILE = path.join(DATA_DIR, 'live_trading.log');
const DASHBOARD_FILE = path.join(__dirname, '..', 'public', 'index.html');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function appendLog(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, line, 'utf8');
  process.stdout.write(line);
}

class LiveDaemon {
  constructor() {
    this.feed = new MarketFeed('SOLUSDT');
    this.strategy = new StrategyEngine(14);
    this.wallet = new WalletSimulator(1000.0);
    this.iteration = 0;
    this.startTime = Date.now();
    this.running = false;
  }

  start(intervalMs = 3000) {
    this.running = true;
    appendLog(`⚡ Autonomous Trading Daemon INITIALIZED.`);
    appendLog(`Sponsor/Treasury Destination: Binance UID ${BINANCE_PAY_CONFIG.merchantUid} (${BINANCE_PAY_CONFIG.merchantName})`);
    appendLog(`Initial Portfolio: $${this.wallet.initialBalance.toFixed(2)} USDT`);

    this.timer = setInterval(async () => {
      try {
        await this.step();
      } catch (err) {
        appendLog(`[ERROR in daemon cycle]: ${err.message}`);
      }
    }, intervalMs);
  }

  stop() {
    this.running = false;
    if (this.timer) clearInterval(this.timer);
    appendLog('🛑 Autonomous Trading Daemon STOPPED.');
  }

  async step() {
    this.iteration++;
    const tick = await this.feed.fetchRealPrice();
    const prices = this.feed.getPrices();
    const signal = this.strategy.evaluateSignal(prices);
    let balances = this.wallet.getBalances(tick.price);

    // Auto-Execution Logic
    let tradeExecuted = false;
    if (signal.action === 'BUY' && this.wallet.usdtBalance >= 150.0) {
      const buyRes = this.wallet.executeBuy(tick.price, 200.0);
      if (buyRes.success) {
        appendLog(`🚀 [BUY EXECUTED] Bought ${buyRes.trade.solAmount} SOL @ $${tick.price} (RSI: ${signal.rsi || 50})`);
        tradeExecuted = true;
      }
    } else if (signal.action === 'SELL' && this.wallet.solBalance > 0) {
      const sellRes = this.wallet.executeSell(tick.price);
      if (sellRes.success) {
        appendLog(`💰 [SELL EXECUTED] Sold SOL for $${sellRes.trade.usdtReceived} USDT (RSI: ${signal.rsi || 50})`);
        tradeExecuted = true;
      }
    }

    balances = this.wallet.getBalances(tick.price);

    // Persist live state to disk every tick
    const state = {
      iteration: this.iteration,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      lastUpdated: new Date().toISOString(),
      currentPrice: tick.price,
      symbol: tick.symbol,
      feedSource: tick.source,
      rsi: signal.rsi || 50.0,
      lastSignal: signal.action,
      signalConfidence: signal.confidence,
      reason: signal.reason,
      portfolio: balances,
      recentTrades: this.wallet.trades.slice(-10),
      binancePayUid: BINANCE_PAY_CONFIG.merchantUid
    };

    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');

    // Generate Dashboard HTML on iteration 1 and periodically (every 5 iterations)
    if (this.iteration === 1 || this.iteration % 5 === 0 || tradeExecuted) {
      this.generateDashboardHtml(state);
      appendLog(`[Tick #${this.iteration}] SOL: $${tick.price.toFixed(2)} | RSI: ${state.rsi} | Signal: ${signal.action} | PnL: ${balances.pnlPercentage >= 0 ? '+' : ''}${balances.pnlPercentage}% ($${balances.pnlUsdt} USDT)`);
    }
  }

  generateDashboardHtml(state) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>⚡ Solana Copytrade Agent — Live Terminal Dashboard</title>
  <meta http-equiv="refresh" content="3">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 font-sans min-h-screen p-4 md:p-8">
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Header -->
    <header class="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="inline-block w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>
          <h1 class="text-2xl font-bold tracking-tight text-white">⚡ Solana Copytrade Agent</h1>
          <span class="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-500/30">LIVE RUNNING</span>
        </div>
        <p class="text-xs text-slate-400 mt-1">Autonomous Quantitative Execution & High-Frequency Paper Trading</p>
      </div>
      <div class="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-right">
        <p class="text-xs text-slate-400">Binance Pay Treasury</p>
        <p class="font-mono text-amber-400 font-bold text-sm">UID: ${state.binancePayUid} (User-79a91)</p>
      </div>
    </header>

    <!-- Metrics Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <p class="text-xs text-slate-400 font-medium">SOL / USDT Live</p>
        <p class="text-2xl font-bold text-emerald-400 mt-1 font-mono">$${state.currentPrice.toFixed(2)}</p>
        <p class="text-[10px] text-slate-500 mt-1">Feed: ${state.feedSource}</p>
      </div>
      <div class="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <p class="text-xs text-slate-400 font-medium">Portfolio Value</p>
        <p class="text-2xl font-bold text-white mt-1 font-mono">$${state.portfolio.totalPortfolioUsd.toFixed(2)}</p>
        <p class="text-[10px] text-slate-500 mt-1">Initial: $1,000.00 USDT</p>
      </div>
      <div class="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <p class="text-xs text-slate-400 font-medium">Realized PnL</p>
        <p class="text-2xl font-bold ${state.portfolio.pnlUsdt >= 0 ? 'text-emerald-400' : 'text-rose-400'} mt-1 font-mono">
          ${state.portfolio.pnlPercentage >= 0 ? '+' : ''}${state.portfolio.pnlPercentage}%
        </p>
        <p class="text-[10px] text-slate-500 mt-1">${state.portfolio.pnlUsdt >= 0 ? '+' : ''}$${state.portfolio.pnlUsdt} USDT</p>
      </div>
      <div class="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <p class="text-xs text-slate-400 font-medium">Quant Signal (RSI-14)</p>
        <p class="text-2xl font-bold text-amber-400 mt-1 font-mono">${state.lastSignal} (${state.rsi})</p>
        <p class="text-[10px] text-slate-500 mt-1">${state.signalConfidence}% Confidence</p>
      </div>
    </div>

    <!-- Live Execution Status -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
      <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Live Algorithm Signal Context</h2>
      <div class="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-xs text-slate-300">
        <p><span class="text-cyan-400">Iteration:</span> #${state.iteration} | <span class="text-cyan-400">Uptime:</span> ${state.uptimeSeconds}s | <span class="text-cyan-400">Timestamp:</span> ${state.lastUpdated}</p>
        <p class="mt-1"><span class="text-cyan-400">Signal Rationale:</span> ${state.reason}</p>
        <p class="mt-1"><span class="text-cyan-400">Wallet Balances:</span> ${state.portfolio.usdt.toFixed(2)} USDT | ${state.portfolio.sol.toFixed(4)} SOL | Executed Trades: ${state.portfolio.tradeCount}</p>
      </div>
    </div>

    <!-- Trade History Table -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
      <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Recent Executions Ledger</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead class="text-slate-500 border-b border-slate-800 pb-2">
            <tr>
              <th class="py-2">Trade ID</th>
              <th>Action</th>
              <th>Price</th>
              <th>SOL Amount</th>
              <th>Total (USDT)</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            ${state.recentTrades.length === 0 ? '<tr><td colspan="6" class="py-4 text-center text-slate-500">Awaiting market trigger conditions...</td></tr>' : 
              state.recentTrades.map(t => `
                <tr class="hover:bg-slate-800/30">
                  <td class="py-2.5 text-slate-400">${t.id}</td>
                  <td class="font-bold ${t.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}">${t.type}</td>
                  <td class="text-white">$${t.price.toFixed(2)}</td>
                  <td class="text-slate-300">${t.solAmount} SOL</td>
                  <td class="text-white">$${(t.usdtSpent || t.usdtReceived).toFixed(2)}</td>
                  <td class="text-slate-500">${t.timestamp.split('T')[1].split('.')[0]}</td>
                </tr>
              `).join('')
            }
          </tbody>
        </table>
      </div>
    </div>
  </div>
</body>
</html>`;
    fs.writeFileSync(DASHBOARD_FILE, html, 'utf8');
  }
}

// Start daemon if executed directly
if (require.main === module) {
  const daemon = new LiveDaemon();
  daemon.start(3000);

  process.on('SIGINT', () => {
    daemon.stop();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    daemon.stop();
    process.exit(0);
  });
}

module.exports = { LiveDaemon };
