# Rate Limit Test

A Node.js script to test and measure rate limiting behavior on Groww's stock charting API.

## What It Does

- Sends multiple requests to the Groww delayed charting API
- Tracks success, error, and rate limit (429) responses
- Supports both sequential and concurrent request modes
- Automatically stops when rate limiting is detected
- Logs detailed timing and response information

## Requirements

- Node.js (uses built-in `https` module, no dependencies)

## Usage

```bash
./rate_limit_test.js [iterations] [delayMs] [mode]
```

### Arguments

| Argument | Default | Description |
|----------|---------|-------------|
| `iterations` | `5` | Number of times to cycle through all stocks |
| `delayMs` | `100` | Milliseconds to wait between requests (sequential mode) |
| `mode` | sequential | Use `concurrent` for parallel requests |

### Examples

```bash
# Default: 5 iterations, 100ms delay, sequential
./rate_limit_test.js

# 3 iterations with 200ms delay
./rate_limit_test.js 3 200

# 2 iterations, no delay, concurrent requests
./rate_limit_test.js 2 0 concurrent
```

## Test Stocks

The script tests 19 NSE stock symbols:
```
NESTLEIND, MARUTI, HYUNDAI, TATASTEEL, JSWSTEEL,
VOLTAS, WIPRO, HINDALCO, TITAN, CONCOR,
HINDZINC, APOLLOHOSP, HEROMOTOCO, BRITANNIA, HCLTECH,
BHARATFORG, JKTYRE, JINDALSTEL, POWERGRID
```

## Output

Each request logs:
- Request URL and progress (e.g., `3/19 TATASTEEL`)
- Response status and duration
- Running statistics

Final summary shows:
- Total requests made
- Successful responses (200)
- Errors (non-200, non-429)
- Rate limits hit (429)

## Configuration

Edit these variables in the script to modify the API query:

| Variable | Description |
|----------|-------------|
| `stocks` | Array of NSE stock symbols to test |
| `endTimeInMillis` | End timestamp for chart data |
| `startTimeInMillis` | Start timestamp for chart data |
| `intervalInMinutes` | Chart interval (1 = 1-minute candles) |
