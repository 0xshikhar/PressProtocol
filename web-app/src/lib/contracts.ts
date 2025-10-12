import { nftABI } from "../../contract/abi/nftABI";
import { tokenMintABI } from "../../contract/abi/tokenMintABI";

// sepolia testnet
export const contractAddresses = {
    nft: "0x73E2dCc244FA575C143F886b9804321b4C0061b4",
    tokenMint: "0x3BfaD8D88E5F8f86b9cA1A0A29bcb4f083D1E60A",
};

// block explorer - blockscout
export const blockExplorer = {
    nft: "https://eth-sepolia.blockscout.com/address/0x73E2dCc244FA575C143F886b9804321b4C0061b4?tab=contract",
    tokenMint: "https://eth-sepolia.blockscout.com/address/0x3BfaD8D88E5F8f86b9cA1A0A29bcb4f083D1E60A?tab=contract",
};


export const contractABIs = {
    nft: nftABI,
    tokenMint: tokenMintABI,
};
