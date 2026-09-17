import Link from "next/link";
import { ArrowRight, Download, Puzzle, FileText, Terminal, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IntegrationMoat() {
  const integrations = [
    {
      name: "Obsidian Community Plugin",
      type: "Local-First Markdown",
      description: "Publish sealed, independently preserved publications straight from your local writing vault without changing how you write.",
      href: "/downloads",
      cta: "Download Plugin",
      icon: FileText,
    },
    {
      name: "WordPress Official Plugin",
      type: "CMS Distribution",
      description: "Add an independently preserved, tamper-evident copy of your WordPress publications without altering your existing blog setup.",
      href: "/downloads",
      cta: "Get WP Plugin",
      icon: Globe,
    },
    {
      name: "Browser Companion Extension",
      type: "Chrome, Brave & Firefox",
      description: "Verify cryptographic Ed25519 signatures locally on the client side so you never have to trust an intermediary server blindly.",
      href: "/downloads",
      cta: "Install Extension",
      icon: Puzzle,
    },
    {
      name: "Developer SDKs & CLI",
      type: "TypeScript, Python, Go, Rust",
      description: "Integrate sovereign signing, content addressing, and multi-gateway resolution directly into your existing publishing pipelines.",
      href: "/developers",
      cta: "View Documentation",
      icon: Terminal,
    },
  ];

  const importers = [
    { name: "Substack", href: "/import" },
    { name: "Ghost", href: "/import" },
    { name: "Medium", href: "/import" },
    { name: "Notion", href: "/import/notion" },
    { name: "Standard Markdown", href: "/write" },
    { name: "RSS / Atom Feeds", href: "/import" },
  ];

  return (
    <section id="integrations" className="py-20 sm:py-28 bg-canvas border-t border-hairline relative scroll-mt-12">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mb-14">
          <div className="text-[11px] font-mono tracking-widest text-secondary uppercase mb-3">
            Ecosystem &amp; Tools
          </div>
          <h2 className="font-hero text-3xl sm:text-4xl lg:text-5xl font-normal text-primary tracking-tight leading-[1.05] mb-4">
            Keep the workflow you already have.
          </h2>
          <p className="text-secondary text-base sm:text-lg font-light leading-relaxed">
            PressProtocol does not ask you to abandon your tools or become a different kind of publisher.
          </p>
          <p className="text-primary font-medium text-base sm:text-lg mt-2">
            Your workflow stays familiar. Your publication becomes more independent.
          </p>
        </div>

        {/* 4 Core Integrations */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {integrations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-[6px] border border-hairline bg-surface p-7 flex flex-col justify-between transition-colors hover:border-focus"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
                      {item.type}
                    </span>
                    <Icon className="h-4 w-4 text-muted" />
                  </div>

                  <h3 className="font-sans font-medium text-lg text-primary mb-2">
                    {item.name}
                  </h3>

                  <p className="text-sm text-secondary font-light leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-5 border-t border-hairline/80 flex items-center justify-between">
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-xs font-mono text-secondary hover:text-primary hover:bg-overlay rounded-[6px] gap-1.5 -ml-3"
                    >
                      <Download className="h-3 w-3" />
                      <span>{item.cta}</span>
                    </Button>
                  </Link>
                  <span className="text-[11px] font-mono text-muted">Ready for production</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 1-Click Importers Strip */}
        <div className="rounded-[6px] border border-hairline bg-surface p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="font-sans font-medium text-sm text-primary">
                Instant Migration &amp; Import Rails
              </h4>
              <p className="text-xs text-secondary font-light mt-0.5">
                Migrate existing publications in seconds without reformatting.
              </p>
            </div>
            <Link href="/import">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-mono border-hairline bg-transparent hover:bg-overlay text-secondary hover:text-primary gap-1.5 rounded-[6px]"
              >
                <span>Launch Importer</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-hairline/80">
            {importers.map((imp, i) => (
              <Link key={i} href={imp.href}>
                <span className="inline-flex items-center px-3 py-1.5 rounded-[4px] bg-canvas border border-hairline text-xs font-mono text-secondary hover:text-primary hover:border-focus transition-colors">
                  {imp.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
