"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon, CoinsIcon, RefreshCwIcon, CheckCircleIcon, AlertCircleIcon } from "lucide-react";
import { contractAddresses, contractABIs, blockExplorer } from "@/lib/contracts";
import { useAuth } from "@/hooks/useAuth";

export default function TokenMintPage() {
    const [amount, setAmount] = useState<number>(1);

    const { address, isConnected } = useAccount();
    const { isAuthenticated } = useAuth();

    // Read contract data
    const { data: mintPrice } = useReadContract({
        address: contractAddresses.tokenMint as `0x${string}`,
        abi: contractABIs.tokenMint,
        functionName: "mintPrice",
    });

    const { data: remainingAllowance } = useReadContract({
        address: contractAddresses.tokenMint as `0x${string}`,
        abi: contractABIs.tokenMint,
        functionName: "getRemainingMintAllowance",
        args: [address || "0x0000000000000000000000000000000000000000"],
        query: {
            enabled: !!address
        }
    });

    const { data: tokenSymbol } = useReadContract({
        address: contractAddresses.tokenMint as `0x${string}`,
        abi: contractABIs.tokenMint,
        functionName: "symbol",
    });


    const { data: tokenBalance } = useReadContract({
        address: contractAddresses.tokenMint as `0x${string}`,
        abi: contractABIs.tokenMint,
        functionName: "balanceOf",
        args: [address || "0x0000000000000000000000000000000000000000"],
        query: {
            enabled: !!address
        }
    });

    // Format balance for display
    const formattedBalance = tokenBalance && typeof tokenBalance === 'bigint'
        ? Number(formatEther(tokenBalance))
        : 0;

    // Add this right before the return statement
    useEffect(() => {
        console.log("Mint state:", {
            address,
            isConnected,
            isAuthenticated,
            remainingAllowance: Number(remainingAllowance || 0),
            mintPrice,
            amount
        });
    }, [address, isConnected, isAuthenticated, remainingAllowance, mintPrice, amount]);

    return (
        <div className="container max-w-4xl py-2">
            <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Token Minting Portal
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                            <CoinsIcon className="mr-2 h-5 w-5" />
                            Token Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{formattedBalance.toLocaleString()}</p>
                        <p className="text-sm text-slate-400">{tokenSymbol as string ?? "Tokens"}</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                            <RefreshCwIcon className="mr-2 h-5 w-5" />
                            Daily Allowance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{Number(remainingAllowance ?? 0).toString()}</p>
                        <p className="text-sm text-slate-400">Tokens available today</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                            <InfoIcon className="mr-2 h-5 w-5" />
                            Mint Price
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">
                            {mintPrice ? formatEther(mintPrice as bigint) : "0"} ETH
                        </p>
                        <p className="text-sm text-slate-400">Per token</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>
                    Contract Address:{" "}
                    <a
                        href={blockExplorer.tokenMint}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-600"
                    >
                        {contractAddresses.tokenMint}
                    </a>
                </p>
            </div>
        </div>
    );
} 