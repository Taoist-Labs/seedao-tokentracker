# Seedao Token Tracker

A Cloudflare Worker that tracks token holder counts for SEEDAO tokens on Polygon/Ethereum network.

## Overview

This project consists of two Cloudflare Workers:

1. **Main Worker (`seedao-tokentracker`)**
   - Endpoint: `https://tokentracker.seedao.tech`
   - Provides real-time holder counts for SEEDAO tokens
   - Uses caching (12-hour TTL) to reduce API calls
   - Returns data in JSON format

2. **Scheduler Worker (`seedao-tokentracker-scheduler`)**
   - Runs daily at midnight UTC
   - Refreshes token holder data from Dune Analytics
   - Updates the cached data

## Supported Tokens

- SNS (Polygon NFT): `0x5f3bd0ce4445e96f2d7dcc4bba883378ead8e10f`
- SEED (Ethereum NFT): `0x30093266E34a816a53e302bE3e59a93B52792FD4`
- SCR (Polygon ERC20): `0x30093266E34a816a53e302bE3e59a93B52792FD4`

## API Response Format

```json
{
  "sns": {
    "address": "0x5f3bd0ce4445e96f2d7dcc4bba883378ead8e10f",
    "holders": 12345
  },
  "seed": {
    "address": "0x30093266E34a816a53e302bE3e59a93B52792FD4",
    "holders": 67890
  },
  "scr": {
    "address": "0x30093266E34a816a53e302bE3e59a93B52792FD4",
    "holders": 54321
  }
}
```

## Deployment

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Configure Wrangler:
   ```bash
   wrangler config
   ```

3. Set up environment variables:
   ```bash
   wrangler secret put DUNE_API_KEY
   wrangler secret put DUNE_QUERY_ID
   ```

4. Deploy main worker:
   ```bash
   wrangler deploy
   ```

5. Deploy scheduler:
   ```bash
   wrangler deploy schedule.js --config wrangler-schedule.toml
   ```

## Development

1. Run locally:
   ```bash
   wrangler dev
   ```

2. Test scheduler:
   ```bash
   wrangler dev schedule.js --config test-scheduler.toml
   ```



## Misc

This project is deployed under the account of Taoist Labs.