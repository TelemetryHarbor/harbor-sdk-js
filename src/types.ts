// src/types.ts

/**
 * A general-purpose telemetry reading.
 */
export interface GeneralReading {
  ship_id: string;
  cargo_id: string;
  value: number;
  time?: string; // Optional, ISO 8601 format with 'Z'
}

// A type union representing any valid payload.
// Add future reading types here, e.g., GpsReading.
export type HarborPayload = GeneralReading;
