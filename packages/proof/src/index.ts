/**
 * @pressprotocol/proof
 * Offline, Air-Gapped & Delay-Tolerant Engine
 * Deterministic In-Browser CIDv1 Calculation & .pressproof.json Codec
 */

export {
  calculateDeterministicCIDv1,
  exportPressProof,
  downloadPressProofFile,
  base32Encode,
  base32Decode,
  type PressProofManifest,
  type PressProofPublisher,
  type ExportProofInput,
} from "./encoder.js";

export {
  verifyPressProof,
  extractContentFromProof,
  type PressProofVerificationResult,
} from "./decoder.js";

export {
  splitIntoQrPackets,
  parseQrPacket,
  reassembleQrPackets,
  computeChunkChecksum,
  type QrPacket,
  type QrSplitOptions,
  type QrReassemblyResult,
} from "./qr.js";
