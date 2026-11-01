export interface Env {
  DATABASE_URL?: string;
  PINATA_JWT?: string;
  PINATA_API_KEY?: string;
  PINATA_SECRET_KEY?: string;
  IPFS_GATEWAY_URL?: string;
  CORS_ORIGIN?: string;
  PUBLIC_APP_URL?: string;
  TOR_ONION_GATEWAY?: string;
  PINATA_GATEWAY_URL?: string;
  PINATA_GATEWAY_TOKEN?: string;
  EDGE_SIGNING_KEY?: string;
  JWT_SECRET?: string;
  ENVIRONMENT?: string;
}

export interface ContentData {
  title: string;
  content: string;
  tags: string[];
  timestamp: string;
  publisher?: {
    pubkey: string;
    signature: string;
    sigVersion?: 1 | 2;
  };
}

export interface PublishContentInput {
  title: string;
  content: string;
  tags?: string[];
  walletAddress?: string;
  privateKey?: string;
  publicKey?: string;
  signature?: string;
  timestamp?: string;
}

export interface PublishResponseData {
  cid: string;
  ipfsUrl: string;
  gatewayUrl: string;
  shareUrl: string;
  title: string;
  tags: string[];
  createdAt: string;
  publisher: {
    pubkey: string;
    signature: string;
    walletAddress?: string;
  };
  signatureStatus?: string;
  mirrors: {
    ipfs: string;
    tor: string;
    gateway: string;
  };
}
