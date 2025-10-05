"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    InfoIcon,
    ImageIcon,
    RefreshCwIcon,
    CheckCircleIcon,
    AlertCircleIcon,
    UserIcon,
    LinkIcon,
    PencilIcon,
    FileUpIcon
} from "lucide-react";
import { contractAddresses, contractABIs, blockExplorer } from "@/lib/contracts";
import { useAuth } from "@/hooks/useAuth";
import { readContract } from "viem/actions";

export default function NFTProfilePage() {
    // Form state
    const [name, setName] = useState<string>("");
    const [bio, setBio] = useState<string>("");
    const [socialLink, setSocialLink] = useState<string>("");
    const [imageUrl, setImageUrl] = useState<string>("");
    const [activeTab, setActiveTab] = useState<string>("create");

    // NFT update state
    const [tokenId, setTokenId] = useState<string>("");
    const [profileData, setProfileData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Transaction state
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const { address, isConnected } = useAccount();
    const { isAuthenticated } = useAuth();

    // File upload ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset states when transaction completes
    const resetStates = () => {
        setTimeout(() => {
            setIsSuccess(false);
            setError(null);
        }, 5000);
    };

    // Read contract data
    const { data: mintPrice } = useReadContract({
        address: contractAddresses.nft as `0x${string}`,
        abi: contractABIs.nft,
        functionName: "mintPrice",
    });

    // Write contract
    const { data: hash, isPending, writeContract } = useWriteContract();

    // Wait for transaction receipt
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        });

    const { data: existingProfile } = useReadContract({
        address: contractAddresses.nft as `0x${string}`,
        abi: contractABIs.nft,
        functionName: "getProfile",
        args: [BigInt(tokenId)],
    });

    // Fetch profile data
    const fetchProfile = async () => {
        if (!tokenId) return;

        try {
            setIsLoading(true);
            setError(null);

            setProfileData(existingProfile);

            // Pre-fill form fields with existing data
            if (existingProfile) {
                console.log("existingProfile", existingProfile);
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError("Profile not found or error fetching data");
            setProfileData(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle create profile
    const handleCreateProfile = async () => {
        console.log("handleCreateProfile");
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

            if (!name) {
                setError("Name is required");
                return;
            }

            if (!imageUrl) {
                setError("Profile image URL is required");
                return;
            }

            const value = mintPrice ? mintPrice.toString() : "0";

            writeContract({
                address: contractAddresses.nft as `0x${string}`,
                abi: contractABIs.nft,
                functionName: "createProfile",
                args: [name, bio, socialLink, imageUrl],
                value: BigInt(value),
            });
        } catch (err) {
            console.error("Error creating profile:", err);
            setError(err instanceof Error ? err.message : "Failed to create profile");
        }
    };

    // Handle update profile
    const handleUpdateProfile = async () => {
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

            if (!tokenId) {
                setError("Token ID is required");
                return;
            }

            if (!name) {
                setError("Name is required");
                return;
            }

            writeContract({
                address: contractAddresses.nft as `0x${string}`,
                abi: contractABIs.nft,
                functionName: "updateProfile",
                args: [BigInt(tokenId), name, bio, socialLink],
            });
        } catch (err) {
            console.error("Error updating profile:", err);
            setError(err instanceof Error ? err.message : "Failed to update profile");
        }
    };

    // Handle update profile image
    const handleUpdateImage = async () => {
        try {
            setError(null);

            if (!address) {
                setError("Please connect your wallet first");
                return;
            }

            if (!isAuthenticated) {
                setError("Please sign in with your wallet first");
                return;
            }

            if (!tokenId) {
                setError("Token ID is required");
                return;
            }

            if (!imageUrl) {
                setError("New image URL is required");
                return;
            }

            writeContract({
                address: contractAddresses.nft as `0x${string}`,
                abi: contractABIs.nft,
                functionName: "updateProfileImage",
                args: [BigInt(tokenId), imageUrl],
            });
        } catch (err) {
            console.error("Error updating profile image:", err);
            setError(err instanceof Error ? err.message : "Failed to update profile image");
        }
    };

    // Update UI based on transaction status
    useEffect(() => {
        if (isConfirmed) {
            setIsSuccess(true);
            resetStates();
        }
    }, [isConfirmed]);

    return (
        <div className="container max-w-4xl py-12">
            <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                NFT Profile Portal
            </h1>

            <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="create">Create New Profile</TabsTrigger>
                    <TabsTrigger value="manage">Manage Existing Profile</TabsTrigger>
                </TabsList>

                <TabsContent value="create">
                    <Card className="border-slate-200 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl">Create Your NFT Profile</CardTitle>
                            <CardDescription>
                                Mint a unique NFT that represents your digital identity
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Display Name *</Label>
                                    <div className="flex items-center">
                                        <UserIcon className="w-5 h-5 mr-2 text-slate-400" />
                                        <Input
                                            id="name"
                                            placeholder="Your display name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Biography</Label>
                                    <Textarea
                                        id="bio"
                                        placeholder="Tell us about yourself"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="socialLink">Social Media Link</Label>
                                    <div className="flex items-center">
                                        <LinkIcon className="w-5 h-5 mr-2 text-slate-400" />
                                        <Input
                                            id="socialLink"
                                            placeholder="https://twitter.com/yourusername"
                                            value={socialLink}
                                            onChange={(e) => setSocialLink(e.target.value)}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="imageUrl">Profile Image URL *</Label>
                                    <div className="flex items-center">
                                        <ImageIcon className="w-5 h-5 mr-2 text-slate-400" />
                                        <Input
                                            id="imageUrl"
                                            placeholder="https://example.com/your-image.jpg"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            className="flex-1"
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Enter a URL to your profile image (IPFS or other permanent storage recommended)
                                    </p>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label>Mint Price</Label>
                                    <div className="text-2xl font-bold">
                                        {mintPrice ? formatEther(mintPrice as bigint) : "0"} ETH
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
                                            Profile NFT created successfully!{" "}
                                            {hash && (
                                                <a
                                                    href={`${blockExplorer.nft.split("?")[0]}/tx/${hash}`}
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
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                size="lg"
                                onClick={handleCreateProfile}
                                disabled={!isConnected || isPending || isConfirming}
                            >
                                {isPending || isConfirming ? (
                                    <>
                                        <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                                        {isPending ? "Confirm in Wallet" : "Processing..."}
                                    </>
                                ) : (
                                    <>Create NFT Profile</>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="manage">
                    <Card className="border-slate-200 shadow-lg mb-8">
                        <CardHeader>
                            <CardTitle className="text-2xl">Manage Your NFT Profile</CardTitle>
                            <CardDescription>
                                Update your existing profile information
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="tokenId">Profile Token ID *</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="tokenId"
                                            placeholder="Enter your NFT token ID"
                                            value={tokenId}
                                            onChange={(e) => setTokenId(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button
                                            variant="secondary"
                                            onClick={fetchProfile}
                                            disabled={!tokenId || isLoading}
                                        >
                                            {isLoading ? (
                                                <RefreshCwIcon className="h-4 w-4 animate-spin" />
                                            ) : (
                                                "Fetch"
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {profileData && (
                                    <>
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-black">
                                            <h4 className="font-medium mb-2">Current Profile Data</h4>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="text-slate-500">Name:</div>
                                                <div className="font-medium">{profileData.name}</div>
                                                <div className="text-slate-500">Bio:</div>
                                                <div className="font-medium">{profileData.bio || "—"}</div>
                                                <div className="text-slate-500">Social Link:</div>
                                                <div className="font-medium">{profileData.socialLink || "—"}</div>
                                                <div className="text-slate-500">Created:</div>
                                                <div className="font-medium">
                                                    {new Date(Number(profileData.creationDate) * 1000).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-2">
                                            <Label htmlFor="name">Update Display Name *</Label>
                                            <div className="flex items-center">
                                                <UserIcon className="w-5 h-5 mr-2 text-slate-400" />
                                                <Input
                                                    id="name"
                                                    placeholder="Your display name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Update Biography</Label>
                                            <Textarea
                                                id="bio"
                                                placeholder="Tell us about yourself"
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                className="min-h-[100px]"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="socialLink">Update Social Media Link</Label>
                                            <div className="flex items-center">
                                                <LinkIcon className="w-5 h-5 mr-2 text-slate-400" />
                                                <Input
                                                    id="socialLink"
                                                    placeholder="https://twitter.com/yourusername"
                                                    value={socialLink}
                                                    onChange={(e) => setSocialLink(e.target.value)}
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <Button
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                                                onClick={handleUpdateProfile}
                                                disabled={!isConnected || isPending || isConfirming}
                                            >
                                                {isPending || isConfirming ? (
                                                    <RefreshCwIcon className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <PencilIcon className="w-4 h-4 mr-2" />
                                                        Update Profile
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        <Separator />

                                        <div className="space-y-2">
                                            <Label htmlFor="imageUrl">Update Profile Image URL</Label>
                                            <div className="flex items-center">
                                                <ImageIcon className="w-5 h-5 mr-2 text-slate-400" />
                                                <Input
                                                    id="imageUrl"
                                                    placeholder="https://example.com/your-image.jpg"
                                                    value={imageUrl}
                                                    onChange={(e) => setImageUrl(e.target.value)}
                                                    className="flex-1"
                                                />
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Enter a URL to your new profile image
                                            </p>
                                        </div>

                                        <Button
                                            className="w-full"
                                            variant="outline"
                                            onClick={handleUpdateImage}
                                            disabled={!isConnected || isPending || isConfirming || !imageUrl}
                                        >
                                            {isPending || isConfirming ? (
                                                <RefreshCwIcon className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <FileUpIcon className="w-4 h-4 mr-2" />
                                                    Update Profile Image
                                                </>
                                            )}
                                        </Button>
                                    </>
                                )}

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
                                            Profile updated successfully!{" "}
                                            {hash && (
                                                <a
                                                    href={`${blockExplorer.nft.split("?")[0]}/tx/${hash}`}
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
                    </Card>

                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-indigo-800">
                        <div className="flex items-start">
                            <InfoIcon className="h-5 w-5 mr-2 mt-0.5 text-indigo-500" />
                            <div>
                                <h4 className="font-medium mb-1">How to find your Token ID?</h4>
                                <p className="text-sm">
                                    You can find your token ID by checking your wallet&apos;s NFT collection or by viewing your transaction history on the blockchain explorer.
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>
                    Contract Address:{" "}
                    <a
                        href={blockExplorer.nft}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-600"
                    >
                        {contractAddresses.nft}
                    </a>
                </p>
            </div>
        </div>
    );
} 