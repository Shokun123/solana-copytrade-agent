/**
 * Automated Test Suite for Solana & Binance Copytrade Agent
 */

const assert = require('assert');
const { MarketFeed } = require('../src/market_feed');
const { StrategyEngine } = require('../src/strategy_engine');
const { WalletSimulator } = require('../src/wallet_simulator');
const { LicenseManager } = require('../src/license_manager');

async function runTests() {
  console.log('\x1b[34m[*] Running Trading Engine Test Suite...\x1b[0m\n');
  let passed = 0;

  // Test 1: License Manager
  try {
    const lm = new LicenseManager();
    const validKey = lm.generateKey();
    assert.strictEqual(lm.verifyKey(validKey), true, 'Valid key should verify');
    assert.strictEqual(lm.verifyKey('INVALID-KEY-123'), false, 'Invalid key should fail');
    console.log('✔ Test 1: License Manager validation passed.');
    passed++;
  } catch (e) {
    console.error('✖ Test 1 Failed:', e.message);
  }

  // Test 2: Market Feed
  try {
    const feed = new MarketFeed('SOLUSDT');
    const tick = await feed.fetchRealPrice();
    assert.ok(tick.price > 0, 'Price must be positive');
    assert.strictEqual(tick.symbol, 'SOLUSDT');
    console.log(`✔ Test 2: Market Feed passed (Price: $${tick.price} from ${tick.source}).`);
    passed++;
  } catch (e) {
    console.error('✖ Test 2 Failed:', e.message);
  }

  // Test 3: Strategy Engine
  try {
    const strat = new StrategyEngine(5);
    const mockPrices = [100, 102, 104, 103, 105, 108, 110, 115];
    const sma = strat.calculateSMA(mockPrices, 5);
    const rsi = strat.calculateRSI(mockPrices);
    const signal = strat.evaluateSignal(mockPrices);
    assert.ok(sma > 100, 'SMA should be computed');
    assert.ok(rsi >= 0 && rsi <= 100, 'RSI should be between 0 and 100');
    assert.ok(['BUY', 'SELL', 'HOLD'].includes(signal.action), 'Signal action must be valid');
    console.log(`✔ Test 3: Strategy Engine passed (SMA: ${sma}, RSI: ${rsi}, Action: ${signal.action}).`);
    passed++;
  } catch (e) {
    console.error('✖ Test 3 Failed:', e.message);
  }

  // Test 4: Wallet Simulator
  try {
    const wallet = new WalletSimulator(1000.0);
    const buyResult = wallet.executeBuy(100.0, 200.0);
    assert.strictEqual(buyResult.success, true);
    assert.strictEqual(wallet.solBalance, 2.0);
    assert.strictEqual(wallet.usdtBalance, 800.0);

    const sellResult = wallet.executeSell(120.0);
    assert.strictEqual(sellResult.success, true);
    assert.strictEqual(wallet.solBalance, 0.0);
    assert.strictEqual(wallet.usdtBalance, 1040.0); // $40 profit

    const balances = wallet.getBalances(120.0);
    assert.strictEqual(balances.pnlUsdt, 40.0);
    assert.strictEqual(balances.pnlPercentage, 4.0);
    console.log(`✔ Test 4: Wallet Simulator passed (PnL: +$${balances.pnlUsdt} / +${balances.pnlPercentage}%).`);
    passed++;
  } catch (e) {
    console.error('✖ Test 4 Failed:', e.message);
  }

  console.log(`\n\x1b[32m[RESULT] ${passed}/4 Tests Passed Successfully!\x1b[0m\n`);
  if (passed !== 4) process.exit(1);
}

runTests();
