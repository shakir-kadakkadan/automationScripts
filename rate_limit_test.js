#!/usr/bin/env node

const https = require('https');

// Sample stock symbols from your logs
const stocks = [
  'NESTLEIND', 'MARUTI', 'HYUNDAI', 'TATASTEEL', 'JSWSTEEL',
  'VOLTAS', 'WIPRO', 'HINDALCO', 'TITAN', 'CONCOR',
  'HINDZINC', 'APOLLOHOSP', 'HEROMOTOCO', 'BRITANNIA', 'HCLTECH',
  'BHARATFORG', 'JKTYRE', 'JINDALSTEL', 'POWERGRID'
];

const endTimeInMillis = 1770287400000;
const startTimeInMillis = 1770249600000;
const intervalInMinutes = 1;

let requestCount = 0;
let successCount = 0;
let errorCount = 0;
let rateLimitCount = 0;

function makeRequest(symbol, index, total) {
  return new Promise((resolve) => {
    const url = `https://groww.in/v1/api/charting_service/v2/chart/delayed/exchange/NSE/segment/CASH/${symbol}?endTimeInMillis=${endTimeInMillis}&intervalInMinutes=${intervalInMinutes}&startTimeInMillis=${startTimeInMillis}`;

    console.log(`LOGGER0: ${index}/${total} ${symbol} ${url}`);

    const startTime = Date.now();

    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://groww.in/',
        'Origin': 'https://groww.in'
      },
      timeout: 10000 // 10 second timeout
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const duration = Date.now() - startTime;
        requestCount++;

        if (res.statusCode === 200) {
          successCount++;
          const preview = data.substring(0, 100);
          console.log(`${index}/${total} ${symbol} ${preview}`);
          console.log(`✓ Success (${duration}ms) - Status: ${res.statusCode}`);
        } else if (res.statusCode === 429) {
          rateLimitCount++;
          console.log(`⚠️  RATE LIMIT HIT! (${duration}ms) - Status: ${res.statusCode}`);
          console.log(`Response: ${data}`);
          console.log(`Headers: ${JSON.stringify(res.headers)}`);
        } else {
          errorCount++;
          console.log(`✗ Error (${duration}ms) - Status: ${res.statusCode}`);
          console.log(`Response: ${data.substring(0, 200)}`);
        }

        console.log(`Stats: Total=${requestCount}, Success=${successCount}, Errors=${errorCount}, RateLimits=${rateLimitCount}\n`);
        resolve({ statusCode: res.statusCode, duration, data, rateLimited: res.statusCode === 429 });
      });
    });

    req.on('error', (err) => {
      const duration = Date.now() - startTime;
      requestCount++;
      errorCount++;
      console.log(`LOGGER0: Error ${symbol} ${err.message}`);
      console.log(`✗ Network Error (${duration}ms): ${err.message}\n`);
      resolve({ error: err.message, duration, rateLimited: false });
    });

    req.on('timeout', () => {
      req.destroy();
      const duration = Date.now() - startTime;
      requestCount++;
      errorCount++;
      console.log(`LOGGER0: Timeout ${symbol}`);
      console.log(`✗ Timeout (${duration}ms)\n`);
      resolve({ error: 'timeout', duration, rateLimited: false });
    });
  });
}

async function runTest(iterations = 5, delayMs = 100, concurrent = false) {
  console.log(`Starting rate limit test`);
  console.log(`Iterations: ${iterations}`);
  console.log(`Delay between requests: ${delayMs}ms`);
  console.log(`Mode: ${concurrent ? 'Concurrent' : 'Sequential'}`);
  console.log('='.repeat(80) + '\n');

  for (let i = 1; i <= iterations; i++) {
    console.log('='.repeat(80));
    console.log(`ITERATION ${i}/${iterations}`);
    console.log('='.repeat(80) + '\n');

    if (concurrent) {
      // Make all requests concurrently
      const promises = stocks.map((stock, j) => makeRequest(stock, j + 1, stocks.length));
      const results = await Promise.all(promises);

      // Check if any hit rate limit
      if (results.some(r => r.rateLimited)) {
        console.log('\n⚠️  RATE LIMIT DETECTED! Stopping test.');
        break;
      }
    } else {
      // Make requests sequentially
      for (let j = 0; j < stocks.length; j++) {
        const result = await makeRequest(stocks[j], j + 1, stocks.length);

        if (result.rateLimited) {
          console.log('\n⚠️  RATE LIMIT DETECTED! Stopping test.');
          return;
        }

        // Add delay between requests
        if (j < stocks.length - 1 && delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    console.log('='.repeat(80));
    console.log(`ITERATION ${i} COMPLETE`);
    console.log(`Summary: ${successCount} successful, ${errorCount} errors, ${rateLimitCount} rate limits`);
    console.log('='.repeat(80) + '\n');

    // Check if we hit rate limit
    if (rateLimitCount > 0) {
      console.log('⚠️  RATE LIMIT DETECTED! Stopping test.');
      break;
    }

    // Delay between iterations
    if (i < iterations) {
      console.log(`Waiting 2 seconds before next iteration...\n`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('FINAL RESULTS');
  console.log('='.repeat(80));
  console.log(`Total Requests: ${requestCount}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Rate Limits: ${rateLimitCount}`);
  console.log('='.repeat(80));
}

// Parse command line arguments
const args = process.argv.slice(2);
const iterations = args[0] ? parseInt(args[0]) : 5;
const delayMs = args[1] ? parseInt(args[1]) : 100;
const concurrent = args[2] === 'concurrent';

runTest(iterations, delayMs, concurrent).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
