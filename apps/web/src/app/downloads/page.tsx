import { Metadata } from "next";
import Link from "next/link";
import { 
  Download, 
  Chrome, 
  Globe, 
  FileText, 
  Terminal, 
  ExternalLink, 
  Check, 
  Copy, 
  ArrowRight, 
  ArrowLeft,
  Shield, 
  Cpu, 
  Layers, 
  Package, 
  FolderDown, 
  CheckCircle2, 
  HelpCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DownloadsClientView } from "./DownloadsClientView";

export const metadata: Metadata = {
  title: "Downloads & Prebuilt Extensions | PressProtocol",
  description: "Download official PressProtocol Chromium extensions, WordPress publishing bridge, Obsidian plugins, Docker Compose, and developer SDKs with 1-click.",
};

export default function DownloadsPage() {
  return <DownloadsClientView />;
}
