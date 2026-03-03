// src/hooks/useSpeedTest.ts
// ─────────────────────────────────────────────────────────────────────────────
// REAL speed test using browser's fetch() API - NDT7-inspired methodology.
//
// HOW IT WORKS:
//   Download test → fetch a large blob of random bytes, measure time + bytes
//   Upload test   → POST random bytes to server, measure time + bytes
//   Latency test  → multiple small pings, take median
//
// This is the same fundamental approach used by fast.com and M-Lab's NDT7.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';

export type TestPhase =
  | 'idle'
  | 'latency'
  | 'download'
  | 'upload'
  | 'complete'
  | 'error';

export interface SpeedTestResult {
  download_speed: number;   // Mbps
  upload_speed: number;     // Mbps
  latency: number;          // ms (median)
  jitter: number;           // ms (std dev of pings)
  packet_loss: number;      // percentage (estimated)
  connection_type: string;
  isp: string;
}

export interface SpeedTestState {
  phase: TestPhase;
  progress: number;         // 0–100
  currentSpeed: number;     // live Mbps while testing
  result: SpeedTestResult | null;
  error: string | null;
}

// ── Utility: chunked random buffer (fixes browser's 65536 byte limit) ──────
function getRandomBuffer(size: number): Uint8Array {
  const buffer = new Uint8Array(size);
  const chunkSize = 65536;
  for (let offset = 0; offset < size; offset += chunkSize) {
    const chunk = buffer.subarray(offset, Math.min(offset + chunkSize, size));
    crypto.getRandomValues(chunk);
  }
  return buffer;
}

// ── Utility: median of array ───────────────────────────────────────────────
function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

// ── Utility: standard deviation ───────────────────────────────────────────
function stdDev(arr: number[]): number {
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  const squareDiffs = arr.map(v => Math.pow(v - avg, 2));
  return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / arr.length);
}

// ── Detect connection type from browser API ────────────────────────────────
function detectConnectionType(): string {
  // navigator.connection is available in Chrome/Android
  const conn = (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;
  if (!conn) return 'unknown';
  const type = conn.effectiveType || conn.type || 'unknown';
  if (type.includes('wifi') || type === '4g') return 'wifi';
  if (type.includes('cellular') || type === '3g' || type === '2g') return 'mobile';
  if (type === 'ethernet') return 'ethernet';
  return 'unknown';
}

// ── Helper: get auth header for fetch requests ────────────────────────────
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── LATENCY TEST ──────────────────────────────────────────────────────────
// Ping the server 10 times with tiny requests, measure round-trip time
async function measureLatency(
  onProgress: (p: number) => void
): Promise<{ latency: number; jitter: number; packet_loss: number }> {
  const PINGS = 10;
  const times: number[] = [];
  let failed = 0;

  for (let i = 0; i < PINGS; i++) {
    const start = performance.now();
    try {
      // Bust cache with timestamp - we just need any tiny response
      await fetch(`/api/network/ping/?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: getAuthHeaders(),
      });
      times.push(performance.now() - start);
    } catch {
      failed++;
    }
    onProgress(Math.round(((i + 1) / PINGS) * 100));
    // Small gap between pings
    await new Promise(r => setTimeout(r, 100));
  }

  const packet_loss = (failed / PINGS) * 100;
  if (times.length === 0) throw new Error('All pings failed');

  return {
    latency: Math.round(median(times) * 10) / 10,
    jitter: Math.round(stdDev(times) * 10) / 10,
    packet_loss: Math.round(packet_loss * 10) / 10,
  };
}

// ── DOWNLOAD TEST ─────────────────────────────────────────────────────────
// Fetch a stream of random bytes from server, measure throughput
async function measureDownload(
  onProgress: (p: number, speedMbps: number) => void
): Promise<number> {
  const TEST_DURATION_MS = 8000;  // run for 8 seconds
  const start = performance.now();
  let totalBytes = 0;
  let done = false;

  // Keep firing parallel requests for 8 seconds
  const fetchChunk = async () => {
    while (!done) {
      try {
        // Our backend serves random bytes at this endpoint
        const res = await fetch(`/api/network/download-test/?size=500000&t=${Date.now()}`, {
          cache: 'no-store',
          headers: getAuthHeaders(),
        });
        const blob = await res.blob();
        totalBytes += blob.size;

        const elapsed = performance.now() - start;
        if (elapsed >= TEST_DURATION_MS) {
          done = true;
          break;
        }

        const speedMbps = (totalBytes * 8) / (elapsed / 1000) / 1_000_000;
        const progress = Math.min(100, Math.round((elapsed / TEST_DURATION_MS) * 100));
        onProgress(progress, Math.round(speedMbps * 10) / 10);
      } catch {
        break;
      }
    }
  };

  // Run 4 parallel streams (like real speed tests do for saturation)
  await Promise.race([
    Promise.all([fetchChunk(), fetchChunk(), fetchChunk(), fetchChunk()]),
    new Promise<void>(r => setTimeout(r, TEST_DURATION_MS + 1000)),
  ]);
  done = true;

  const elapsed = (performance.now() - start) / 1000;
  const speedMbps = (totalBytes * 8) / elapsed / 1_000_000;
  return Math.round(speedMbps * 100) / 100;
}

// ── UPLOAD TEST ───────────────────────────────────────────────────────────
// POST random bytes to server, measure throughput
async function measureUpload(
  onProgress: (p: number, speedMbps: number) => void
): Promise<number> {
  const TEST_DURATION_MS = 8000;
  const CHUNK_SIZE = 200_000;  // 200KB per chunk
  const start = performance.now();
  let totalBytes = 0;
  let done = false;

  // Generate random data once (reuse for each chunk)
  const randomData = getRandomBuffer(CHUNK_SIZE);
  const blob = new Blob([randomData.buffer as ArrayBuffer]);

  const uploadChunk = async () => {
    while (!done) {
      try {
        const formData = new FormData();
        formData.append('data', blob, 'chunk.bin');

        await fetch(`/api/network/upload-test/?t=${Date.now()}`, {
          method: 'POST',
          body: formData,
          cache: 'no-store',
          headers: { ...getAuthHeaders() }, // Don't set Content-Type for FormData
        });

        totalBytes += CHUNK_SIZE;
        const elapsed = performance.now() - start;
        if (elapsed >= TEST_DURATION_MS) { done = true; break; }

        const speedMbps = (totalBytes * 8) / (elapsed / 1000) / 1_000_000;
        const progress = Math.min(100, Math.round((elapsed / TEST_DURATION_MS) * 100));
        onProgress(progress, Math.round(speedMbps * 10) / 10);
      } catch {
        break;
      }
    }
  };

  // 2 parallel upload streams
  await Promise.race([
    Promise.all([uploadChunk(), uploadChunk()]),
    new Promise<void>(r => setTimeout(r, TEST_DURATION_MS + 1000)),
  ]);
  done = true;

  const elapsed = (performance.now() - start) / 1000;
  const speedMbps = (totalBytes * 8) / elapsed / 1_000_000;
  return Math.round(speedMbps * 100) / 100;
}

// ── Main hook ─────────────────────────────────────────────────────────────
export function useSpeedTest() {
  const [state, setState] = useState<SpeedTestState>({
    phase: 'idle',
    progress: 0,
    currentSpeed: 0,
    result: null,
    error: null,
  });

  const runTest = useCallback(async () => {
    setState({ phase: 'latency', progress: 0, currentSpeed: 0, result: null, error: null });

    try {
      // ── Phase 1: Latency ──────────────────────────────────────────────
      const { latency, jitter, packet_loss } = await measureLatency((p) => {
        setState(s => ({ ...s, progress: p }));
      });

      // ── Phase 2: Download ─────────────────────────────────────────────
      setState(s => ({ ...s, phase: 'download', progress: 0, currentSpeed: 0 }));
      const download_speed = await measureDownload((p, speed) => {
        setState(s => ({ ...s, progress: p, currentSpeed: speed }));
      });

      // ── Phase 3: Upload ───────────────────────────────────────────────
      setState(s => ({ ...s, phase: 'upload', progress: 0, currentSpeed: 0 }));
      const upload_speed = await measureUpload((p, speed) => {
        setState(s => ({ ...s, progress: p, currentSpeed: speed }));
      });

      const result: SpeedTestResult = {
        download_speed,
        upload_speed,
        latency,
        jitter,
        packet_loss,
        connection_type: detectConnectionType(),
        isp: '',
      };

      setState({ phase: 'complete', progress: 100, currentSpeed: 0, result, error: null });
    } catch (err: any) {
      setState(s => ({
        ...s,
        phase: 'error',
        error: err.message || 'Speed test failed. Check your connection.',
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({ phase: 'idle', progress: 0, currentSpeed: 0, result: null, error: null });
  }, []);

  return { ...state, runTest, reset };
}
