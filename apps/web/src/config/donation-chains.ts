export interface DonationChain {
  id: string;
  name: string;
  badge: string;
  symbol: string;
  address: string;
  networkType: "evm" | "ton" | "solana" | "bitcoin";
  supportedTokens: string[];
  explorerUrl: string;
  description: string;
}

export interface TraditionalMethod {
  id: string;
  name: string;
  badge: string;
  identifier: string;
  link?: string;
  type: "paypal" | "github" | "nano" | "wire";
  description: string;
}

export const DONATION_CHAINS: DonationChain[] = [
  {
    id: "evm",
    name: "Ethereum & EVM Chains",
    badge: "Mainnet · Arbitrum · Optimism · Base · Polygon · BSC",
    symbol: "ETH / ERC-20",
    address: "0x71C8360f33ab81773663673B3a863704258f4a13",
    networkType: "evm",
    supportedTokens: ["ETH", "USDC", "USDT", "DAI", "BNB", "MATIC", "ARB", "OP"],
    explorerUrl: "https://etherscan.io/address/0x71C8360f33ab81773663673B3a863704258f4a13",
    description: "Send ETH or any ERC-20 token on Ethereum Mainnet, Arbitrum, Optimism, Base, Polygon, or BNB Smart Chain (BSC).",
  },
  {
    id: "ton",
    name: "TON (The Open Network)",
    badge: "TON Mainnet",
    symbol: "TON / Jettons",
    address: "EQB_G9u9yFkYFvM3nZ_W4L3Zp8kZ4a2N8d3kX4m9p7q2r1s0",
    networkType: "ton",
    supportedTokens: ["TON", "USDT (TON)", "NOT"],
    explorerUrl: "https://tonscan.org/address/EQB_G9u9yFkYFvM3nZ_W4L3Zp8kZ4a2N8d3kX4m9p7q2r1s0",
    description: "Send TON or TON Jettons directly to our sovereign open-source infrastructure wallet.",
  },
  {
    id: "solana",
    name: "Solana",
    badge: "Solana Mainnet",
    symbol: "SOL / SPL",
    address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    networkType: "solana",
    supportedTokens: ["SOL", "USDC (SPL)", "USDT (SPL)"],
    explorerUrl: "https://solscan.io/account/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    description: "Send SOL or SPL tokens on the high-speed Solana network.",
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    badge: "Native SegWit",
    symbol: "BTC",
    address: "bc1q9d80d2g3w92p3r7u58p3d5z0w4k5v9q8y2m1a3",
    networkType: "bitcoin",
    supportedTokens: ["BTC"],
    explorerUrl: "https://mempool.space/address/bc1q9d80d2g3w92p3r7u58p3d5z0w4k5v9q8y2m1a3",
    description: "Send native Bitcoin directly to our air-gapped infrastructure vault.",
  },
];

export const TRADITIONAL_METHODS: TraditionalMethod[] = [
  {
    id: "paypal",
    name: "PayPal",
    badge: "Direct / Cards",
    identifier: "paypal.me/0xshikhar",
    link: "https://paypal.me/0xshikhar",
    type: "paypal",
    description: "Send support using PayPal balance, debit card, or credit card directly to the infrastructure fund.",
  },
  {
    id: "github-sponsors",
    name: "GitHub Sponsors",
    badge: "Zero-Fee / Recurring",
    identifier: "github.com/sponsors/0xshikhar",
    link: "https://github.com/0xshikhar/PressProtocol",
    type: "github",
    description: "Support open-source development directly through GitHub's sponsorship program with zero fees.",
  },
  {
    id: "nano",
    name: "Nano (XNO)",
    badge: "Zero-Fee Instant",
    identifier: "nano_1pressprotocol9sovereign8pubgood7zero6fee5block4chain3node2x1",
    type: "nano",
    description: "Fee-less, instantaneous digital currency directly supporting autonomous edge compute.",
  },
];
