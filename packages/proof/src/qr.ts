import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@pressprotocol/sdk";

export interface QrPacket {
  raw: string;
  version: number;
  sessionId: string;
  index: number;
  total: number;
  checksum: string;
  chunk: string;
}

export interface QrSplitOptions {
  maxChunkSize?: number; // Target chunk size in characters (default: 480 for reliable mobile camera scanning)
  sessionId?: string; // Optional custom session identifier (e.g. article CID snippet)
}

export interface QrReassemblyResult {
  complete: boolean;
  sessionId: string;
  total: number;
  receivedCount: number;
  missingIndices: number[];
  payload?: string;
  checksumValid?: boolean;
}

/**
 * Computes an 8-character hex checksum over input data.
 */
export function computeChunkChecksum(data: string): string {
  const encoder = new TextEncoder();
  const hash = sha256(encoder.encode(data));
  return bytesToHex(hash.slice(0, 4));
}

/**
 * Splits arbitrary payload (string or .pressproof.json object) into optical QR frames.
 * Format: PPQR:1:<sessionId>:<index>:<total>:<checksum>:<chunk>
 */
export function splitIntoQrPackets(
  payload: string | object,
  options: QrSplitOptions = {}
): QrPacket[] {
  const serialized = typeof payload === "string" ? payload : JSON.stringify(payload);
  const maxChunkSize = Math.max(100, options.maxChunkSize || 480);

  // Derive an 8-character session ID if not provided
  const sessionId =
    options.sessionId?.slice(0, 8) ||
    computeChunkChecksum(serialized);

  const totalChunks = Math.ceil(serialized.length / maxChunkSize) || 1;
  const packets: QrPacket[] = [];

  for (let i = 0; i < totalChunks; i++) {
    const start = i * maxChunkSize;
    const end = Math.min(start + maxChunkSize, serialized.length);
    const chunk = serialized.slice(start, end);
    const checksum = computeChunkChecksum(chunk);
    const index = i + 1; // 1-indexed

    const raw = `PPQR:1:${sessionId}:${index}:${totalChunks}:${checksum}:${chunk}`;

    packets.push({
      raw,
      version: 1,
      sessionId,
      index,
      total: totalChunks,
      checksum,
      chunk,
    });
  }

  return packets;
}

/**
 * Parses a single scanned QR string into a structured QrPacket.
 */
export function parseQrPacket(rawInput: string): QrPacket | null {
  if (!rawInput || typeof rawInput !== "string") return null;
  const trimmed = rawInput.trim();

  // Pattern: PPQR:<version>:<sessionId>:<index>:<total>:<checksum>:<chunk>
  if (!trimmed.startsWith("PPQR:")) return null;

  const firstFiveColons: number[] = [];
  let pos = -1;
  for (let i = 0; i < 6; i++) {
    pos = trimmed.indexOf(":", pos + 1);
    if (pos === -1) break;
    firstFiveColons.push(pos);
  }

  if (firstFiveColons.length < 6) return null;

  const versionStr = trimmed.slice(firstFiveColons[0] + 1, firstFiveColons[1]);
  const sessionId = trimmed.slice(firstFiveColons[1] + 1, firstFiveColons[2]);
  const indexStr = trimmed.slice(firstFiveColons[2] + 1, firstFiveColons[3]);
  const totalStr = trimmed.slice(firstFiveColons[3] + 1, firstFiveColons[4]);
  const checksum = trimmed.slice(firstFiveColons[4] + 1, firstFiveColons[5]);
  const chunk = trimmed.slice(firstFiveColons[5] + 1);

  const version = parseInt(versionStr, 10);
  const index = parseInt(indexStr, 10);
  const total = parseInt(totalStr, 10);

  if (isNaN(version) || isNaN(index) || isNaN(total) || index < 1 || index > total) {
    return null;
  }

  // Verify chunk checksum
  const expectedChecksum = computeChunkChecksum(chunk);
  if (checksum !== expectedChecksum) {
    return null; // Corrupted packet
  }

  return {
    raw: trimmed,
    version,
    sessionId,
    index,
    total,
    checksum,
    chunk,
  };
}

/**
 * Reassembles scanned QR packets into the original payload.
 * Supports out-of-order packets and partial scan status.
 */
export function reassembleQrPackets(
  packets: (string | QrPacket)[]
): QrReassemblyResult {
  const parsedPackets: QrPacket[] = [];

  for (const item of packets) {
    if (typeof item === "string") {
      const parsed = parseQrPacket(item);
      if (parsed) parsedPackets.push(parsed);
    } else if (item && typeof item === "object" && item.sessionId) {
      parsedPackets.push(item);
    }
  }

  if (parsedPackets.length === 0) {
    return {
      complete: false,
      sessionId: "",
      total: 0,
      receivedCount: 0,
      missingIndices: [],
    };
  }

  // Group by session ID to avoid mixing multi-document scans
  const sessionId = parsedPackets[0].sessionId;
  const sessionPackets = parsedPackets.filter((p) => p.sessionId === sessionId);
  const total = sessionPackets[0].total;

  const packetMap = new Map<number, QrPacket>();
  for (const packet of sessionPackets) {
    packetMap.set(packet.index, packet);
  }

  const missingIndices: number[] = [];
  for (let i = 1; i <= total; i++) {
    if (!packetMap.has(i)) {
      missingIndices.push(i);
    }
  }

  const complete = missingIndices.length === 0;

  if (!complete) {
    return {
      complete: false,
      sessionId,
      total,
      receivedCount: packetMap.size,
      missingIndices,
    };
  }

  // Reassemble in strict 1..total index order
  let payload = "";
  for (let i = 1; i <= total; i++) {
    payload += packetMap.get(i)!.chunk;
  }

  return {
    complete: true,
    sessionId,
    total,
    receivedCount: total,
    missingIndices: [],
    payload,
    checksumValid: true,
  };
}
