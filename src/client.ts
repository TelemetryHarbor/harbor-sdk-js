import axios, { AxiosInstance, AxiosError } from "axios";
import { HarborPayload } from "./types";

// Helper function for sleep
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class HarborClient {
  private readonly client: AxiosInstance;
  private readonly maxRetries: number;
  private readonly initialBackoff: number;

  constructor(
    endpoint: string,
    apiKey: string,
    maxRetries: number = 5,
    initialBackoff: number = 1000
  ) {
    if (!endpoint || !apiKey) {
      throw new Error("Endpoint and API Key cannot be empty.");
    }

    this.maxRetries = maxRetries;
    this.initialBackoff = initialBackoff; // in milliseconds

    this.client = axios.create({
      baseURL: endpoint,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      timeout: 10000, // 10-second timeout
    });

    console.log(`TelemetryHarborClient initialized for endpoint: ${endpoint}`);
  }

  private async _sendRequest(url: string, data: any) {
    let retries = 0;
    while (retries <= this.maxRetries) {
      try {
        console.log(
          `Attempt ${retries + 1}/${this.maxRetries + 1} to send data to ${url}`
        );
        const response = await this.client.post(url, data);
        console.log(
          `Data successfully sent to ${url}. Status: ${response.status}`
        );
        return response;
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error(
            `HTTP error on attempt ${retries + 1}: ${
              axiosError.response.status
            } - ${JSON.stringify(axiosError.response.data)}`
          );
          // Don't retry on 4xx client errors (except 429)
          if (
            axiosError.response.status >= 400 &&
            axiosError.response.status < 500 &&
            axiosError.response.status !== 429
          ) {
            throw new Error(
              `Client error: ${axiosError.response.status} - ${JSON.stringify(
                axiosError.response.data
              )}`
            );
          }
        } else if (axiosError.request) {
          // The request was made but no response was received
          console.error(
            `Network error on attempt ${retries + 1}: No response received.`
          );
        } else {
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
    throw new Error(
      `Failed to send data to ${url} after ${this.maxRetries + 1} attempts.`
    );
  }

  /**
   * Sends a single telemetry reading.
   * @param reading A HarborPayload object (e.g., GeneralReading).
   */
  public async send(reading: HarborPayload) {
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
  public async sendBatch(readings: HarborPayload[]) {
    if (!readings || readings.length === 0) {
      console.warn(
        "Attempted to send an empty batch. No request will be made."
      );
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
