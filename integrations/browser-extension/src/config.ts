/**
 * PressProtocol Sovereign Web Clipper - Configuration & Constants
 */
import type { ExtensionSettings } from "./types";

export const DEFAULT_SETTINGS: ExtensionSettings = {
  apiUrl: "https://api.pressprotocol.com",
  webAppUrl: "https://pressprotocol.com",
  autoCopyPermalink: true,
  signWithBurnerKey: true,
};

export const SCRAPS_STORAGE_KEY = "pressprotocol_scraps";
export const SETTINGS_STORAGE_KEY = "pressprotocol_settings";
export const IDENTITY_STORAGE_KEY = "pressprotocol_burner_identity";

export const CANONICAL_ONION_HOST = "pressprotocol7sovereign4node6federation3mesh7relay5v3.onion";

export const CANDIDATE_API_ENDPOINTS = [
  "https://api.pressprotocol.com",
  "https://pressprotocol-api.newsofficework.workers.dev",
  "https://pressprotocol.com",
  "http://localhost:3000",
  "http://localhost:4000",
];
