"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HarborClient = void 0;
const axios_1 = __importDefault(require("axios"));
// Helper function for sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
class HarborClient {
    constructor(endpoint, apiKey, maxRetries = 5, initialBackoff = 1000) {
        if (!endpoint || !apiKey) {
            throw new Error("Endpoint and API Key cannot be empty.");
        }
        this.maxRetries = maxRetries;
        this.initialBackoff = initialBackoff; // in milliseconds
        this.client = axios_1.default.create({
            baseURL: endpoint,
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": apiKey,
            },
            timeout: 10000, // 10-second timeout
        });
        console.log(`TelemetryHarborClient initialized for endpoint: ${endpoint}`);
    }
    async _sendRequest(url, data) {
        let retries = 0;
        while (retries <= this.maxRetries) {
            try {
                console.log(`Attempt ${retries + 1}/${this.maxRetries + 1} to send data to ${url}`);
                const response = await this.client.post(url, data);
                console.log(`Data successfully sent to ${url}. Status: ${response.status}`);
                return response;
            }
            catch (error) {
                const axiosError = error;
                if (axiosError.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.error(`HTTP error on attempt ${retries + 1}: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`);
                    // Don't retry on 4xx client errors (except 429)
                    if (axiosError.response.status >= 400 &&
                        axiosError.response.status < 500 &&
                        axiosError.response.status !== 429) {
                        throw new Error(`Client error: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`);
                    }
                }
                else if (axiosError.request) {
                    // The request was made but no response was received
                    console.error(`Network error on attempt ${retries + 1}: No response received.`);
                }
                else {
                    // Something happened in setting up the request that triggered an Error
                    console.error("Error", axiosError.message);
                }
                if (retries < this.maxRetries) {
                    const sleepTime = this.initialBackoff * 2 ** retries;
                    console.warn(`Retrying in ${sleepTime / 1000} seconds...`);
                    await sleep(sleepTime);
                }
                retries++;
            }
        }
        throw new Error(`Failed to send data to ${url} after ${this.maxRetries + 1} attempts.`);
    }
    /**
     * Sends a single telemetry reading.
     * @param reading A HarborPayload object (e.g., GeneralReading).
     */
    async send(reading) {
        // Add timestamp if not provided
        if (!reading.time) {
            reading.time = new Date().toISOString();
        }
        console.log(`Sending single ${reading.constructor.name} to base endpoint.`);
        return this._sendRequest("", reading);
    }
    /**
     * Sends multiple telemetry readings as a batch.
     * @param readings An array of HarborPayload objects.
     */
    async sendBatch(readings) {
        if (!readings || readings.length === 0) {
            console.warn("Attempted to send an empty batch. No request will be made.");
            return null;
        }
        // Add timestamps if not provided
        const processedBatch = readings.map((r) => ({
            ...r,
            time: r.time || new Date().toISOString(),
        }));
        console.log(`Sending batch of ${processedBatch.length} readings.`);
        return this._sendRequest("/batch", processedBatch);
    }
}
exports.HarborClient = HarborClient;
