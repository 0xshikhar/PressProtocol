"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

import { AuthButton } from "./AuthButton";

export default function InstructionsComponent() {
	return (
		<div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
			<Card className="w-full max-w-2xl bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
				<CardHeader className="text-center">
					<CardTitle className="text-4xl font-bold">
						Create <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Nextjs14 Template</span>
					</CardTitle>
					<p className="text-xl text-slate-300 mt-4">
						Using RainbowKit, Wagmi, Prisma, Shadcn/UI, and TailwindCSS
					</p>
				</CardHeader>

				<CardContent className="space-y-6">
					<div className="text-center">
						<p className="text-lg mb-4">
							Get started by editing this page in{" "}
							<code className="bg-slate-700 text-blue-300 px-2 py-1 rounded-md">
								/pages/index.tsx
							</code>
						</p>

						<div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
							<Button
								variant="outline"
								className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 border-slate-600 text-white"
								onClick={() => window.open('https://github.com/0xshikhar/next-entree', '_blank')}
							>
								Give a Star on Github
							</Button>

							<AuthButton />
						</div>
					</div>

					<div className="text-center mt-8">
						<p className="text-sm text-slate-400">
							Created by{" "}
							<a
								href="https://twitter.com/0xshikhar"
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-400 hover:underline"
							>
								0xShikhar
							</a>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
