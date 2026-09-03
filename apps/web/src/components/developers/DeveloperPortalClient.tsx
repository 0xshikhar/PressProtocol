"use client";

import React from "react";
import DeveloperHero from "./DeveloperHero";
import SandboxKeyCard from "./SandboxKeyCard";
import ApiExplorer from "./ApiExplorer";
import WidgetPlayground from "./WidgetPlayground";
import SdkCodeSnippets from "./SdkCodeSnippets";
import ArchitectureGuarantees from "./ArchitectureGuarantees";
import { useSandboxKey } from "./useSandboxKey";

export default function DeveloperPortalClient() {
  const { apiKey, keyCopied, generateNewSandboxKey, copyApiKey } = useSandboxKey();
  const [selectedEndpoint, setSelectedEndpoint] = React.useState<any>("publish_raw");

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <DeveloperHero onSelectEndpoint={setSelectedEndpoint} />

      {/* 1-Click Sandbox API Key */}
      <SandboxKeyCard
        apiKey={apiKey}
        keyCopied={keyCopied}
        onGenerateNewKey={generateNewSandboxKey}
        onCopyKey={copyApiKey}
      />

      {/* Interactive API Explorer */}
      <ApiExplorer apiKey={apiKey} initialEndpoint={selectedEndpoint} />

      {/* Universal Web Component Playground */}
      <WidgetPlayground />

      {/* Multi-Language SDK Ecosystem */}
      <SdkCodeSnippets apiKey={apiKey} />

      {/* Protocol Architecture Guarantees */}
      <ArchitectureGuarantees />
    </div>
  );
}
