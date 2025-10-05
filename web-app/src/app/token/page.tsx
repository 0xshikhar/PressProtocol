
import TokenMint from "@/components/TokenMint";
import TokenStats from "@/components/TokenStats";

export default function TokenMintPage() {
    return (
        <div className="flex flex-col">
            <div className="container max-w-4xl gap-4 py-16">
                <TokenStats />
                <TokenMint />
            </div>
        </div>
    );
}
