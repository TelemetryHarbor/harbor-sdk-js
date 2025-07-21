import { HarborPayload } from "./types";
export declare class HarborClient {
    private readonly client;
    private readonly maxRetries;
    private readonly initialBackoff;
    constructor(endpoint: string, apiKey: string, maxRetries?: number, initialBackoff?: number);
    private _sendRequest;
    /**
     * Sends a single telemetry reading.
     * @param reading A HarborPayload object (e.g., GeneralReading).
     */
    send(reading: HarborPayload): Promise<import("axios").AxiosResponse<any, any>>;
    /**
     * Sends multiple telemetry readings as a batch.
     * @param readings An array of HarborPayload objects.
     */
    sendBatch(readings: HarborPayload[]): Promise<import("axios").AxiosResponse<any, any> | null>;
}
