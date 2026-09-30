/**
 * Solana & Binance Copytrade Agent - License & Monetization Manager
 * Official Sponsor & Payments Destination: Binance UID 1049392123
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const BINANCE_PAY_CONFIG = {
  merchantUid: '1049392123',
  merchantName: 'User-79a91',
  acceptedCurrencies: ['USDT', 'USDC', 'BUSD'],
  proTierPriceUsd: 29.0,
  features: {
    community: [
      'Single-pair live price monitoring (SOL/USDT)',
      'Paper trading simulator with zero risk',
      'Basic momentum & RSI technical indicators',
      'Local transaction logging'
    ],
    pro: [
      'Multi-pair parallel scanning (SOL, BTC, ETH, Pump.fun DEX tokens)',
      'Live execution integration with Solana RPC & Binance API',
      'Copytrade Engine: Mirror top-performing on-chain alpha wallets',
      'Automated trailing stop-loss and MEV front-run protection',
      'Instant Telegram & Discord webhook execution alerts',
      'Priority access to algorithmic strategies'
    ]
  }
};

class LicenseManager {
  constructor(configDir = path.join(__dirname, '..')) {
    this.licenseFile = path.join(configDir, '.license_key');
  }

  isProActive() {
    if (!fs.existsSync(this.licenseFile)) {
      return false;
    }
    try {
      const key = fs.readFileSync(this.licenseFile, 'utf8').trim();
      return this.verifyKey(key);
    } catch (e) {
      return false;
    }
  }

  verifyKey(key) {
    if (!key || typeof key !== 'string') return false;
    // Format: PRO-<TIMESTAMP>-<SIGNATURE>
    const parts = key.split('-');
    if (parts.length !== 3 || parts[0] !== 'PRO') return false;
    const [_, timestamp, sig] = parts;
    const expectedSig = crypto
      .createHash('sha256')
      .update(`${BINANCE_PAY_CONFIG.merchantUid}-${timestamp}-PRO-ACCESS`)
      .digest('hex')
      .slice(0, 12);
    return sig.toUpperCase() === expectedSig.toUpperCase();
  }

  generateKey(timestamp = Date.now()) {
    const sig = crypto
      .createHash('sha256')
      .update(`${BINANCE_PAY_CONFIG.merchantUid}-${timestamp}-PRO-ACCESS`)
      .digest('hex')
      .slice(0, 12);
    return `PRO-${timestamp}-${sig.toUpperCase()}`;
  }

  saveLicenseKey(key) {
    if (this.verifyKey(key)) {
      fs.writeFileSync(this.licenseFile, key.trim(), 'utf8');
      return true;
    }
    return false;
  }

  getUpgradeBanner() {
    return `
================================================================================
             🚀 UPGRADE TO SOLANA & BINANCE COPYTRADE PRO SUITE 🚀
================================================================================
 Unlock real on-chain automated execution, multi-wallet copytrading,
 and MEV front-run defense directly from your terminal.

 💎 Price: $${BINANCE_PAY_CONFIG.proTierPriceUsd.toFixed(2)} USDT (Lifetime Access & Updates)
 💳 Pay via Binance Pay to Merchant UID: [ ${BINANCE_PAY_CONFIG.merchantUid} ]
 👤 Recipient: ${BINANCE_PAY_CONFIG.merchantName}

 How to Activate Pro:
 1. Open Binance App -> Pay -> Send to Binance UID: ${BINANCE_PAY_CONFIG.merchantUid}
 2. Enter $${BINANCE_PAY_CONFIG.proTierPriceUsd} USDT with note: "SOLTRADE-PRO"
 3. Run: soltrade --activate <LICENSE_KEY> or submit transaction ID.
================================================================================
`;
  }
}

module.exports = {
  LicenseManager,
  BINANCE_PAY_CONFIG
};
