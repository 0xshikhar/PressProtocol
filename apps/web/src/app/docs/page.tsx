import { Metadata } from "next";
import { DocsViewer } from "@/components/docs/DocsViewer";

export const metadata: Metadata = {
  title: "Documentation & Developer Guides | PressProtocol",
  description: "Comprehensive guides for running a PressProtocol Node, integrating the browser extension, installing WordPress bridges, and verifying Ed25519 signatures.",
};

export default function DocsPage() {
  return <DocsViewer />;
}
