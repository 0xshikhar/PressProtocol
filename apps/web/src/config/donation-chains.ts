export interface DonationChain {
  id: string;
  name: string;
  badge: string;
  symbol: string;
  address: string;
  networkType: "evm" | "solana" | "bitcoin" | "tron" | "zcash";
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
  type: "paypal" | "payoneer" | "github" | "wire";
  status: "active" | "coming_soon";
  statusNotice?: string;
  description: string;
}

export const DONATION_CHAINS: DonationChain[] = [
  {
    id: "zcash",
    name: "Zcash",
    badge: "Transparent Address",
    symbol: "ZEC",
    address: "t1Le6zNv7AJDWip8RYxq71RoqnCEPV9KtNj",
    networkType: "zcash",
    supportedTokens: ["ZEC"],
    explorerUrl: "https://blockchair.com/zcash/address/t1Le6zNv7AJDWip8RYxq71RoqnCEPV9KtNj",
    description: "Send Zcash directly to our cypherpunk zero-knowledge protocol research fund.",
  },
  {
    id: "evm",
    name: "Ethereum & EVM Chains",
    badge: "Mainnet · Arbitrum · Optimism · Base · Polygon  · BSC ",
    symbol: "ETH / EVM",
    address: "0x4A0b74638e280b8d7cbB1de0Bbb8cdBef15038a8",
    networkType: "evm",
    supportedTokens: ["ETH", "USDC", "USDT", "DAI", "ARB", "OP", "POL"],
    explorerUrl: "https://etherscan.io/address/0x4A0b74638e280b8d7cbB1de0Bbb8cdBef15038a8",
    description: "Send ETH or any ERC-20 token on Ethereum Mainnet, Arbitrum, Optimism, Base, Polygon, Avalanche, or any EVM network.",
  },
  {
    id: "bsc",
    name: "BNB Smart Chain (BSC)",
    badge: "BEP-20 Network",
    symbol: "BNB / BEP-20",
    address: "0x4A0b74638e280b8d7cbB1de0Bbb8cdBef15038a8",
    networkType: "evm",
    supportedTokens: ["BNB", "USDT (BEP-20)", "USDC (BEP-20)", "FDUSD"],
    explorerUrl: "https://bscscan.com/address/0x4A0b74638e280b8d7cbB1de0Bbb8cdBef15038a8",
    description: "Send BNB or any BEP-20 token on BNB Smart Chain directly to our sovereign infrastructure address.",
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    badge: "Native SegWit",
    symbol: "BTC",
    address: "bc1qruke6fukrq0ds8gv9r97fuvsrgvuey758ewvxe",
    networkType: "bitcoin",
    supportedTokens: ["BTC"],
    explorerUrl: "https://mempool.space/address/bc1qruke6fukrq0ds8gv9r97fuvsrgvuey758ewvxe",
    description: "Send native Bitcoin directly to our air-gapped sovereign node infrastructure vault.",
  },
  {
    id: "solana",
    name: "Solana",
    badge: "Solana Mainnet",
    symbol: "SOL / SPL",
    address: "6zFDgUsaQHTo3So9imLLvvhcomPDNX5DD4nZykn7ozRT",
    networkType: "solana",
    supportedTokens: ["SOL", "USDC (SPL)", "USDT (SPL)"],
    explorerUrl: "https://solscan.io/account/6zFDgUsaQHTo3So9imLLvvhcomPDNX5DD4nZykn7ozRT",
    description: "Send SOL or any SPL tokens on the high-speed Solana network.",
  },
  {
    id: "tron",
    name: "TRON",
    badge: "TRC-20 Network",
    symbol: "TRX / TRC-20",
    address: "TK4nkSBQ5QJNhkh8C7HrLA95396A7rqJBQ",
    networkType: "tron",
    supportedTokens: ["TRX", "USDT (TRC-20)", "USDC (TRC-20)"],
    explorerUrl: "https://tronscan.org/#/address/TK4nkSBQ5QJNhkh8C7HrLA95396A7rqJBQ",
    description: "Send TRX or TRC-20 tokens (like USDT) on the high-throughput TRON network.",
  },
];

export const TRADITIONAL_METHODS: TraditionalMethod[] = [
  {
    id: "github-sponsors",
    name: "GitHub Sponsors",
    badge: "Zero-Fee / Open Source",
    identifier: "github.com/sponsors/0xshikhar",
    link: "https://github.com/0xshikhar/PressProtocol",
    type: "github",
    status: "active",
    description: "Support open-source development directly through GitHub's sponsorship program with zero fees.",
  },
  {
    id: "paypal",
    name: "PayPal",
    badge: "Coming Soon",
    identifier: "Merchant Setup In Progress",
    type: "paypal",
    status: "coming_soon",
    statusNotice: "Merchant entity verification & account setup in progress for pressprotocol.com. Integration launching soon.",
    description: "Direct card & PayPal gateway. Currently undergoing institutional entity verification for pressprotocol.com.",
  },
  {
    id: "payoneer",
    name: "Payoneer",
    badge: "Coming Soon",
    identifier: "Account Setup In Progress",
    type: "payoneer",
    status: "coming_soon",
    statusNotice: "Commercial billing profile currently under setup for pressprotocol.com. Integration launching soon.",
    description: "Cross-border commercial settlement and card payouts. Entity review in progress.",
  },
  {
    id: "wire",
    name: "Direct Wire & Foundation Grants",
    badge: "By Inquiry",
    identifier: "pressprotocol.com/inquiry",
    link: "https://github.com/0xshikhar/PressProtocol/issues",
    type: "wire",
    status: "active",
    description: "For institutional wire transfers, donor-advised funds (DAFs), or journalism grants, open an inquiry directly with maintainers.",
  },
];
