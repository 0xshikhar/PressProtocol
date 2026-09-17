import { PenLine, KeyRound, Globe2, ShieldCheck } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Write or import",
      description:
        "Start from scratch in a clean, distraction-free markdown and rich-text editor, or import existing work from Medium, Ghost, Notion, or Markdown.",
      details: ["Distraction-free typography", "One-click markdown import", "Full media & formatting support"],
      icon: PenLine,
    },
    {
      number: "02",
      title: "Seal your publication",
      description:
        "Cryptographically sign your publication directly in your browser so readers can verify that the version they are reading matches the version you published.",
      details: ["Client-side Ed25519 signing", "Zero server custody of keys", "Mathematical tamper resistance"],
      icon: KeyRound,
    },
    {
      number: "03",
      title: "Publish & share",
      description:
        "Preserve your publication across independent infrastructure and share it as a standard web link readable by anyone in the world.",
      details: ["Multi-mirror fallback routing", "Direct Tor v3 hidden circuits", "Standard HTTPS web link"],
      icon: Globe2,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-canvas border-t border-hairline relative scroll-mt-12">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12">
        <div className="max-w-2xl mb-14">
          <div className="text-[11px] font-mono tracking-widest text-secondary uppercase mb-3">
            Publishing Process
          </div>
          <h2 className="font-hero text-3xl sm:text-4xl lg:text-5xl font-normal text-primary tracking-tight leading-[1.05] mb-4">
            From draft to durable publication.
          </h2>
          <p className="text-secondary text-base sm:text-lg font-light leading-relaxed">
            Familiar as a modern text editor on the surface, backed by verifiable decentralized infrastructure underneath.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="rounded-[6px] border border-hairline bg-surface p-7 flex flex-col justify-between transition-colors hover:border-focus"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-hero text-2xl text-muted font-normal">
                      {step.number}
                    </span>
                    <Icon className="h-5 w-5 text-secondary" />
                  </div>

                  <h3 className="font-sans font-medium text-lg text-primary mb-3">
                    {step.title}
                  </h3>

                  <p className="text-sm text-secondary font-light leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                <ul className="pt-5 border-t border-hairline/80 space-y-2">
                  {step.details.map((detail, i) => (
                    <li key={i} className="text-xs text-muted flex items-center gap-2 font-mono">
                      <span className="h-1 w-1 rounded-full bg-secondary" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Reader Zero Friction Reassurance Banner */}
        <div className="rounded-[6px] border border-hairline bg-surface/70 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-verified shrink-0 hidden sm:block" />
            <p className="text-xs sm:text-sm text-primary font-normal">
              <strong className="text-primary font-medium">Reader experience:</strong> No account, login, or special software required to read. Direct links open instantly in any standard browser.
            </p>
          </div>
          <span className="text-xs font-mono text-muted whitespace-nowrap">
            Works in Chrome, Safari, Firefox, Brave &amp; Tor
          </span>
        </div>
      </div>
    </section>
  );
}
