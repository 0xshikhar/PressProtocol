import { Metadata } from "next";
import Link from "next/link";
import { Scale, ShieldAlert, Globe, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terms of Service & Protocol Disclaimers | PressProtocol",
  description: "PressProtocol decentralized protocol terms, immutable content disclaimers, and open-source licensing.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-primary selection:bg-accent-tint selection:text-primary py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="container mx-auto max-w-4xl space-y-10">
        {/* Navigation Breadcrumb */}
        <div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted hover:text-primary hover:bg-surface text-xs font-mono rounded-[6px]">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-4 border-b border-hairline pb-8">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-hairline bg-overlay text-secondary font-mono text-xs rounded-[6px]">
              <Scale className="h-3 w-3 mr-1 text-muted" /> Protocol Agreement
            </Badge>
            <span className="text-xs text-muted font-mono">Last Updated: September 2026</span>
          </div>
          <h1 className="font-hero text-4xl sm:text-5xl font-normal tracking-tight text-primary">
            Terms of Service &amp; Disclaimers
          </h1>
          <p className="text-base sm:text-lg text-secondary leading-relaxed font-light">
            PressProtocol is a set of autonomous, open-source smart contracts, peer-to-peer daemon software, and decentralized web interfaces. By accessing or interacting with the protocol, you acknowledge and agree to these terms.
          </p>
        </div>

        {/* Highlight Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border-hairline bg-surface text-primary rounded-[6px]">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-[6px] bg-surface-raised border border-hairline flex items-center justify-center text-secondary">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="font-sans font-semibold text-base text-primary">Autonomous Protocol</h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed font-sans">
                PressProtocol operates permissionlessly across decentralized networks. There is no central administrator capable of censoring, modifying, or reversing published data.
              </p>
            </CardContent>
          </Card>

          <Card className="border-hairline bg-surface text-primary rounded-[6px]">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-[6px] bg-surface-raised border border-hairline flex items-center justify-center text-warning">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="font-sans font-semibold text-base text-primary">Author Responsibility</h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed font-sans">
                Publishers cryptographically sign their manifests. You are solely and legally responsible for the accuracy and legality of the content you broadcast.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Terms */}
        <div className="space-y-8 text-secondary font-sans leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-hero font-normal text-primary">1. Nature of the Protocol</h2>
            <p className="text-sm text-secondary leading-relaxed font-light">
              PressProtocol is an open-source decentralized communications tool. It is not an editorial publication, news agency, publisher, or hosting provider. 
              The software connects authors to peer-to-peer storage (IPFS) and anonymity layers (Tor v3) using public cryptographic primitives.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-hero font-normal text-primary">2. Permanent Content Immutability</h2>
            <p className="text-sm text-secondary leading-relaxed font-light">
              Because content is stored on decentralized peer-to-peer networks using cryptographic content addressing (CIDs), 
              <strong className="text-primary font-normal">content once published cannot be modified or deleted by PressProtocol maintainers</strong>. 
              Authors must exercise extreme caution not to publish sensitive personal data, unredacted private keys, or non-public personal information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-hero font-normal text-primary">3. Prohibited Conduct</h2>
            <p className="text-sm text-secondary leading-relaxed font-light">
              While the protocol is permissionless by design, the web portal interfaces maintained by the PressProtocol community enforce strict zero-tolerance policies regarding:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-muted font-light">
              <li>Child sexual abuse material (CSAM) or exploitation.</li>
              <li>Direct incitement to imminent violent harm or terrorism.</li>
              <li>Distribution of malicious software, malware, or credential harvesting exploits.</li>
            </ul>
            <p className="text-sm text-secondary leading-relaxed font-light">
              Public gateways maintained by PressProtocol will block routing to CIDs containing known abusive content using standard decentralized denylist filters.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-hero font-normal text-primary">4. Disclaimer of Warranties &amp; Limitation of Liability</h2>
            <p className="text-muted leading-relaxed font-mono text-xs bg-surface-raised p-4 rounded-[6px] border border-hairline">
              THE SOFTWARE IS PROVIDED &ldquo;AS IS&rdquo;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-hero font-normal text-primary">5. Open Source Licensing</h2>
            <p className="text-sm text-secondary leading-relaxed font-light">
              PressProtocol is free software released under the <strong className="text-primary font-normal">MIT License</strong>. You are entitled to inspect, modify, fork, and self-host independent PressProtocol Nodes and web gateways without restriction.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-hairline pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted font-mono">
            MIT License &bull; Free &amp; Sovereign Public Good
          </p>
          <div className="flex gap-3">
            <Link href="/privacy">
              <Button variant="outline" size="sm" className="text-xs font-mono border-hairline bg-surface hover:bg-overlay text-primary rounded-[6px]">Privacy Policy</Button>
            </Link>
            <Link href="/spec">
              <Button variant="outline" size="sm" className="text-xs font-mono border-hairline bg-surface hover:bg-overlay text-primary rounded-[6px]">Technical Spec</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
