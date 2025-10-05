"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCwIcon, CheckCircleIcon, AlertCircleIcon } from "lucide-react";
import { contractAddresses, contractABIs, blockExplorer } from "@/lib/contracts";
import { useAuth } from "@/hooks/useAuth";

function TokenMint() {
    const [amount, setAmount] = useState<number>(1);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [tokenPrice, setTokenPrice] = useState<number>(0);

    const { address, isConnected } = useAccount();
    const { isAuthenticated } = useAuth();

    // Reset states when transaction completes
    const resetStates = () => {
        setTimeout(() => {
            setIsSuccess(false);
            setError(null);
        }, 5000);
    };

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

    const { data: tokenName } = useReadContract({
        address: contractAddresses.tokenMint as `0x${string}`,
        abi: contractABIs.tokenMint,
        functionName: "name",
    });


    // Write contract
    const { data: hash, isPending, writeContract } = useWriteContract();

    console.log("hash", hash, "isPending", isPending, "writeContract", writeContract);

    // Wait for transaction receipt
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        });

    // Add this near the top of your component to handle disabled states better
    console.log("isConnected", isConnected, "isAuthenticated", isAuthenticated, "isPending", isPending, "isConfirming", isConfirming, "remainingAllowance", remainingAllowance);
    const isDisabled = !isConnected || isPending || isConfirming || Number(remainingAllowance || 0) <= 0;

    console.log("isDisabled", isDisabled);

    // Handle mint function
    const handleMint = async () => {

        setTokenPrice(Number(mintPrice));
        if (!mintPrice) {
            setTokenPrice(0);
        }

        console.log("handleMint");
        try {
            setError(null);

            if (!address) {
                setError("Please connect your wallet first");
                return;
            }

            // if (!isAuthenticated) {
            //     setError("Please sign in with your wallet first");
            //     return;
            // }

            // if (!mintPrice) {
            //     setTokenPrice(0);
            // }

            // Calculate the total value in wei
            const totalValue = BigInt(Number(mintPrice)) * BigInt(amount);

            writeContract({
                address: contractAddresses.tokenMint as `0x${string}`,
                abi: contractABIs.tokenMint,
                functionName: "mint",
                args: [BigInt(amount)],
                value: totalValue,
            });
        } catch (err) {
            console.error("Error minting tokens:", err);
            setError(err instanceof Error ? err.message : "Failed to mint tokens");
        }
    };

    // Update UI based on transaction status
    useEffect(() => {
        if (isConfirmed) {
            setIsSuccess(true);
            resetStates();
        }
    }, [isConfirmed]);


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
        <div className="container max-w-4xl py-8">
            <Card className="border-slate-200 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Mint {tokenName as string || "Tokens"}</CardTitle>
                    <CardDescription>
                        Mint up to {Number(remainingAllowance ?? 10).toString()} tokens per day
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label htmlFor="amount">Amount to Mint</Label>
                                <Badge variant="outline" className="font-mono">
                                    {amount} {tokenSymbol as string || "Tokens"}
                                </Badge>
                            </div>

                            <div className="pt-4 pb-2">
                                <Slider
                                    id="amount"
                                    value={[amount]}
                                    max={Number(remainingAllowance || 10)}
                                    min={1}
                                    step={1}
                                    onValueChange={(value) => setAmount(value[0])}
                                    disabled={!isConnected || Number(remainingAllowance || 0) <= 0}
                                />
                            </div>

                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>1</span>
                                <span>{Number(remainingAllowance || 10)}</span>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label>Total Cost</Label>
                            <div className="text-2xl font-bold">
                                {mintPrice ? formatEther(BigInt(Number(mintPrice) * amount)) : "0"} ETH
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Plus gas fees
                            </p>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircleIcon className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {isSuccess && (
                            <Alert className="bg-green-50 border-green-200">
                                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                <AlertTitle className="text-green-800">Success!</AlertTitle>
                                <AlertDescription className="text-green-700">
                                    Tokens minted successfully!{" "}
                                    {hash && (
                                        <a
                                            href={`${blockExplorer.tokenMint.split("?")[0]}/tx/${hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline font-medium"
                                        >
                                            View transaction
                                        </a>
                                    )}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>

                <CardFooter>
                    <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        size="lg"
                        onClick={handleMint}
                        disabled={isDisabled}
                    >
                        {isPending || isConfirming ? (
                            <>
                                <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                                {isPending ? "Confirm in Wallet" : "Processing..."}
                            </>
                        ) : Number(remainingAllowance || 0) <= 0 ? (
                            <>Daily Limit Reached</>
                        ) : (
                            <>Mint Tokens</>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default TokenMint;