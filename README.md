# ⚡ Solana & Binance Copytrade Agent

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Binance Pay](https://img.shields.io/badge/Binance%20Pay-UID%201049392123-F0B90B.svg?logo=binance&logoColor=white)](https://pay.binance.com/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)

> **High-Performance Algorithmic Trading & Copytrade CLI Engine for Solana DEXs & Binance.**  
> Features zero-risk paper trading simulation, live public price streaming (0 API keys required), quantitative momentum indicators (RSI + SMA), and optional Pro execution.

---

## 🎯 Key Features

- **🌐 Zero-Config Live Price Feed:** Connects directly to Binance Public REST endpoints for instant tick updates (`SOL/USDT`, `BTC/USDT`, etc.) with built-in high-precision micro-volatility fallback.
- **🛡️ Built-in Paper Trading Simulator:** Test quantitative algorithms in simulated real-time conditions with virtual USDT/SOL balances, full execution logs, and PnL reporting.
- **📊 Quantitative Signal Engine:** Automated Relative Strength Index (RSI-14) calculation, Simple Moving Average (SMA) crossovers, and signal confidence scoring (`BUY`, `SELL`, `HOLD`).
- **💎 Multi-Tier Architecture:** Complete free Community Edition for backtesting and strategy learning + optional Pro Suite for real on-chain automated routing and alpha wallet copytrading.

---

## 🚀 Quick Start (In under 60 seconds)

### 1. Clone & Run

```bash
git clone https://github.com/Shokun123/solana-copytrade-agent.git
cd solana-copytrade-agent
node src/index.js
```

### 2. Run Test Suite

```bash
npm test
```
All 4 unit tests (License Validation, Live Market Feed, Strategy Engine, and Portfolio Simulator) pass in < 1 second.

---

## 🖥️ Terminal Interface Preview

```text
================================================================================
       ⚡ SOLANA & BINANCE COPYTRADE AGENT v1.0.0 ⚡
       High-Performance Algorithmic Trading & Liquidity Execution Engine
================================================================================
  Status: [COMMUNITY EDITION - SIMULATOR MODE]
  Sponsor & Payments: Binance UID 1049392123 (User-79a91)
--------------------------------------------------------------------------------
[*] Connecting to Binance Market Feed for SOL/USDT...

[Tick #1] Price: $117.91 | RSI: 50.0 | Signal: HOLD (0%) | Feed: Binance-Live
         Reason: Accumulating price data points
         Portfolio Value: $1000 | PnL: +0% ($0 USDT)

[Tick #2] Price: $117.89 | RSI: 34.2 | Signal: BUY (85%) | Feed: Binance-Live
         Reason: RSI oversold (34.2) + Golden cross above 5-SMA
         >>> [SIMULATED EXECUTION] Bought 1.2724 SOL @ $117.89
         Portfolio Value: $1000 | PnL: +0.2% (+$2.10 USDT)
```

---

## 💎 Pro Suite Upgrade ($29 USDT Lifetime)

For institutional execution, multi-wallet copytrading, and private RPC connections:

| Feature | Community Edition (Free) | Pro Suite ($29 USDT) |
| :--- | :---: | :---: |
| **Paper Trading Simulator** | ✅ | ✅ |
| **Live Market Feeds** | ✅ | ✅ |
| **RSI & SMA Momentum Signals** | ✅ | ✅ |
| **Multi-Pair Parallel Scanning** | ❌ | ✅ |
| **Solana RPC On-Chain Execution** | ❌ | ✅ |
| **Alpha Wallet Copytrade Engine** | ❌ | ✅ |
| **MEV & Front-Run Defense** | ❌ | ✅ |
| **Telegram & Discord Webhook Alerts** | ❌ | ✅ |

### How to Upgrade via Binance Pay:

1. Open your **Binance App** ➔ Tap **Pay** ➔ **Send to Binance UID**.
2. **Recipient UID:** `1049392123`
3. **Recipient Name:** `User-79a91`
4. **Amount:** `$29 USDT`
5. **Payment Note:** `SOLTRADE-PRO`
6. Once sent, activate your terminal using:
   ```bash
   node src/index.js --activate <YOUR_LICENSE_KEY>
   ```

---

## 🤝 Contributing & Community Sponsorship

We believe in open financial tooling. If this tool helps you optimize your algorithmic strategies, consider supporting ongoing development via:

- **Binance Pay UID:** `1049392123`
- **LeadRescue AI Suite:** [https://shokun123.github.io/leadrescue-ai/](https://shokun123.github.io/leadrescue-ai/)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
