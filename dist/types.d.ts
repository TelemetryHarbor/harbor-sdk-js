/**
 * A general-purpose telemetry reading.
 */
export interface GeneralReading {
    ship_id: string;
    cargo_id: string;
    value: number;
    time?: string;
}
export type HarborPayload = GeneralReading;
