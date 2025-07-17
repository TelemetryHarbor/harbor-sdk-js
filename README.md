# Telemetry Harbor SDK for Node.js

<!-- Telemetry Harbor JavaScript SDK Badges -->

<!-- npm -->
[![npm version](https://img.shields.io/npm/v/telemetryharbor-sdk.svg)](https://www.npmjs.com/package/telemetryharbor-sdk)
[![npm downloads](https://img.shields.io/npm/dm/telemetryharbor-sdk.svg)](https://www.npmjs.com/package/telemetryharbor-sdk)
[![License](https://img.shields.io/npm/l/telemetryharbor-sdk.svg)](https://github.com/TelemetryHarbor/harbor-sdk-js/blob/main/LICENSE)
[![Node.js Version](https://img.shields.io/node/v/telemetryharbor-sdk.svg)](https://nodejs.org)

<!-- GitHub -->
![Build](https://github.com/TelemetryHarbor/harbor-sdk-js/actions/workflows/publish-to-npm.yml/badge.svg)
![Last Commit](https://img.shields.io/github/last-commit/TelemetryHarbor/harbor-sdk-js.svg)
![Issues](https://img.shields.io/github/issues/TelemetryHarbor/harbor-sdk-js.svg)
![Pull Requests](https://img.shields.io/github/issues-pr/TelemetryHarbor/harbor-sdk-js.svg)
![Repo Size](https://img.shields.io/github/repo-size/TelemetryHarbor/harbor-sdk-js.svg)
![Contributors](https://img.shields.io/github/contributors/TelemetryHarbor/harbor-sdk-js.svg)

<!-- Fun / Community -->
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Stars](https://img.shields.io/github/stars/TelemetryHarbor/harbor-sdk-js.svg?style=social)
![Forks](https://img.shields.io/github/forks/TelemetryHarbor/harbor-sdk-js.svg?style=social)

A modern, production-ready SDK for sending telemetry data to the **Telemetry Harbor** service from any Node.js or TypeScript application.

This library simplifies sending data by handling HTTP communication, JSON serialization, and robust error handling with automatic retries.

For full details and advanced usage, please see our official documentation at [docs.telemetryharbor.com](https://docs.telemetryharbor.com).

***

## Features

* ✅ **TypeScript First**: Written in TypeScript for strong typing and excellent editor autocompletion.
* 📦 **Batching Support**: Efficiently send multiple readings in a single request.
* ⚙️ **Robust Retries**: Implements exponential backoff to automatically retry sending data on network or server errors.
* modern: Uses `async/await` and is built on top of the popular `axios` library.
* 🌐 **Universal**: Works in any modern Node.js environment.

***

## Installation

```bash
npm install telemetryharbor-sdk
```

***

## Quickstart Guide

Here is a basic example of how to use the SDK.

```javascript
import { HarborClient, GeneralReading } from 'telemetryharbor-sdk';

// 1. Initialize the client
const client = new TelemetryHarborClient(
  'YOUR_API_ENDPOINT',
  'YOUR_API_KEY'
);

async function main() {
  // 2. Create a reading object
  const reading: GeneralReading = {
    ship_id: 'node-freighter-01',
    cargo_id: 'cpu-load',
    value: 42.5,
  };

  try {
    // 3. Send the reading
    const response = await client.send(reading);
    console.log('Successfully sent data!', { status: response.status });

    // --- Or send a batch ---
    const readings: GeneralReading[] = [
      { ship_id: 'node-freighter-01', cargo_id: 'ram-usage', value: 8192 },
      { ship_id: 'node-freighter-01', cargo_id: 'disk-io', value: 512.7 },
    ];
    const batchResponse = await client.sendBatch(readings);
    console.log('Successfully sent batch!', { status: batchResponse.status });

  } catch (error) {
    console.error('Failed to send data:', error.message);
  }
}

main();
```

***

## API Reference

### `TelemetryHarborClient(endpoint, apiKey, [maxRetries], [initialBackoff])`

The constructor for the client.

* `endpoint` (string): The URL of your Telemetry Harbor ingestion endpoint.
* `apiKey` (string): Your unique API key for authentication.
* `maxRetries` (number, optional): The maximum number of retries. Defaults to `5`.
* `initialBackoff` (number, optional): The initial backoff delay in milliseconds. Defaults to `1000`.

### `async send(reading)`

Sends a single telemetry reading.

### `async sendBatch(readings)`

Sends an array of readings in a single HTTP request.

