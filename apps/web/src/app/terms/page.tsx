import { Metadata } from "next";
import Link from "next/link";
import { FileText, Scale, ShieldAlert, Globe, Code, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terms of Service & Protocol Disclaimers",
  description: "PressProtocol decentralized protocol terms, immutable content disclaimers, and open-source licensing.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl space-y-10">
        {/* Navigation Breadcrumb */}
        <div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-4 border-b pb-8">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-xs">
              <Scale className="h-3 w-3 mr-1" /> Protocol Agreement
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Last Updated: September 2026</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight">
            Terms of Service & Disclaimers
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            PressProtocol is a set of autonomous, open-source smart contracts, peer-to-peer daemon software, and decentralized web interfaces. By accessing or interacting with the protocol, you acknowledge and agree to these terms.
          </p>
        </div>

        {/* Highlight Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border-border/60 bg-muted/20">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">Autonomous Protocol</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                PressProtocol operates permissionlessly across decentralized networks. There is no central administrator capable of censoring, modifying, or reversing published data.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/20">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">Author Responsibility</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Publishers cryptographically sign their manifests. You are solely and legally responsible for the accuracy and legality of the content you broadcast.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Terms */}
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section className="space-y-3">
            <h2 className="text-2xl font-serif font-bold">1. Nature of the Protocol</h2>
            <p className="text-muted-foreground leading-relaxed">
              PressProtocol is an open-source decentralized communications tool. It is not an editorial publication, news agency, publisher, or hosting provider. 
              The software connects authors to peer-to-peer storage (IPFS) and anonymity layers (Tor v3) using public cryptographic primitives.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-serif font-bold">2. Permanent Content Immutability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Because content is stored on decentralized peer-to-peer networks using cryptographic content addressing (CIDs), 
              <strong>content once published cannot be modified or deleted by PressProtocol maintainers</strong>. 
              Authors must exercise extreme caution not to publish sensitive personal data, unredacted private keys, or non-public personal information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-serif font-bold">3. Prohibited Conduct</h2>
            <p className="text-muted-foreground leading-relaxed">
              While the protocol is permissionless by design, the web portal interfaces maintained by the PressProtocol community enforce strict zero-tolerance policies regarding:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Child sexual abuse material (CSAM) or exploitation.</li>
              <li>Direct incitement to imminent violent harm or terrorism.</li>
              <li>Distribution of malicious software, malware, or credential harvesting exploits.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Public gateways maintained by PressProtocol will block routing to CIDs containing known abusive content using standard decentralized denylist filters.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-serif font-bold">4. Disclaimer of Warranties & Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed font-mono text-xs bg-muted/40 p-4 rounded border">
              THE SOFTWARE IS PROVIDED &ldquo;AS IS&rdquo;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-serif font-bold">5. Open Source Licensing</h2>
            <p className="text-muted-foreground leading-relaxed">
              PressProtocol is free software released under the <strong>MIT License</strong>. You are entitled to inspect, modify, fork, and self-host independent PressProtocol Nodes and web gateways without restriction.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-mono">
            MIT License &bull; Free & Sovereign Public Good
          </p>
          <div className="flex gap-3">
            <Link href="/privacy">
              <Button variant="outline" size="sm" className="text-xs">Privacy Policy</Button>
            </Link>
            <Link href="/spec">
              <Button variant="outline" size="sm" className="text-xs">Technical Spec</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
