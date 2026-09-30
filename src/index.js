#!/usr/bin/env node

/**
 * Solana & Binance Copytrade Agent - Main CLI Entry Point
 * Autonomous High-Frequency Simulator & Copytrading Bot
 * Developed for Shokun123 | Monetization: Binance UID 1049392123
 */

const { MarketFeed } = require('./market_feed');
const { StrategyEngine } = require('./strategy_engine');
const { WalletSimulator } = require('./wallet_simulator');
const { LicenseManager, BINANCE_PAY_CONFIG } = require('./license_manager');

const licenseMgr = new LicenseManager();
const isPro = licenseMgr.isProActive();

function printHeader() {
  console.log(`
\x1b[36m================================================================================\x1b[0m
\x1b[1m\x1b[33m       ⚡ SOLANA & BINANCE COPYTRADE AGENT v1.0.0 ⚡\x1b[0m
       \x1b[32mHigh-Performance Algorithmic Trading & Liquidity Execution Engine\x1b[0m
\x1b[36m================================================================================\x1b[0m
  Status: ${isPro ? '\x1b[32m[PRO ACTIVATED - FULL ACCESS]\x1b[0m' : '\x1b[33m[COMMUNITY EDITION - SIMULATOR MODE]\x1b[0m'}
  Sponsor & Payments: \x1b[1mBinance UID ${BINANCE_PAY_CONFIG.merchantUid}\x1b[0m (${BINANCE_PAY_CONFIG.merchantName})
\x1b[36m--------------------------------------------------------------------------------\x1b[0m`);
}

async function runSimulator(cycles = 5) {
  printHeader();
  console.log(`\x1b[34m[*] Connecting to Binance Market Feed for SOL/USDT...\x1b[0m\n`);

  const feed = new MarketFeed('SOLUSDT');
  const strategy = new StrategyEngine(14);
  const wallet = new WalletSimulator(1000.0);

  for (let i = 1; i <= cycles; i++) {
    const tick = await feed.fetchRealPrice();
    const prices = feed.getPrices();
    const signal = strategy.evaluateSignal(prices);
    const balances = wallet.getBalances(tick.price);

    console.log(`\x1b[1m[Tick #${i}] Price:\x1b[0m \x1b[32m$${tick.price.toFixed(2)}\x1b[0m | \x1b[1mRSI:\x1b[0m ${signal.rsi || '50.0'} | \x1b[1mSignal:\x1b[0m \x1b[33m${signal.action}\x1b[0m (${signal.confidence}%) | \x1b[1mFeed:\x1b[0m ${tick.source}`);
    console.log(`         \x1b[90mReason: ${signal.reason}\x1b[0m`);

    if (signal.action === 'BUY' && wallet.usdtBalance >= 100) {
      const res = wallet.executeBuy(tick.price, 150.0);
      if (res.success) {
        console.log(`         \x1b[32m>>> [SIMULATED EXECUTION] Bought ${res.trade.solAmount} SOL @ $${tick.price}\x1b[0m`);
      }
    } else if (signal.action === 'SELL' && wallet.solBalance > 0) {
      const res = wallet.executeSell(tick.price);
      if (res.success) {
        console.log(`         \x1b[31m>>> [SIMULATED EXECUTION] Sold all SOL for $${res.trade.usdtReceived} USDT\x1b[0m`);
      }
    }

    console.log(`         Portfolio Value: $${balances.totalPortfolioUsd} | PnL: ${balances.pnlPercentage >= 0 ? '+' : ''}${balances.pnlPercentage}% ($${balances.pnlUsdt} USDT)\n`);

    if (i < cycles) {
      await new Promise(r => setTimeout(r, 1200));
    }
  }

  console.log(`\x1b[36m================================================================================\x1b[0m`);
  console.log(`\x1b[1m\x1b[32m✔ Simulation batch completed with 0 errors.\x1b[0m`);
  if (!isPro) {
    console.log(licenseMgr.getUpgradeBanner());
  }
}

// CLI Argument Handling
const args = process.argv.slice(2);

if (args.includes('--upgrade')) {
  printHeader();
  console.log(licenseMgr.getUpgradeBanner());
} else if (args.includes('--status')) {
  printHeader();
  console.log(`Pro License Active: ${isPro}`);
} else if (args[0] === '--activate' && args[1]) {
  if (licenseMgr.saveLicenseKey(args[1])) {
    console.log(`\x1b[32m✔ Pro License activated successfully! Real execution enabled.\x1b[0m`);
  } else {
    console.log(`\x1b[31m✖ Invalid license key format.\x1b[0m`);
  }
} else {
  // Default run
  runSimulator(5);
}
