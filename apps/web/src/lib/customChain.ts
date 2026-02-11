
export const agentChain = ({
    id: 1313161584,
    name: 'The Agent Chain',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: { http: ['https://rpc-0x4e454170.aurora-cloud.dev'] },
    },
    blockExplorers: {
        default: {
            name: 'Agent Chain Explorer',
            url: 'https://explorer.0x4e454170.aurora-cloud.dev',
            apiUrl: 'https://explorer.0x4e454170.aurora-cloud.dev/api',
        },
    },
    testnet: false,
});