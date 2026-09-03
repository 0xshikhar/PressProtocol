"use client"

import { useState } from "react";
import { HelpCircle, Search, Book, MessageCircle, FileText, Shield, Zap, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const helpCategories = [
    {
      icon: Book,
      title: "Getting Started",
      description: "Learn the basics of PressProtocol",
      articles: 12
    },
    {
      icon: FileText,
      title: "Publishing",
      description: "Create and manage your content",
      articles: 18
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Keep your account secure",
      articles: 10
    },
    {
      icon: Zap,
      title: "Advanced Features",
      description: "Make the most of PressProtocol",
      articles: 15
    }
  ];

  const faqs = [
    {
      question: "What is PressProtocol?",
      answer: "PressProtocol is a decentralized, censorship-resistant publishing platform that distributes your content across IPFS, Tor, and gateway mirrors. This ensures your content remains accessible even if one network goes down."
    },
    {
      question: "How does content distribution work?",
      answer: "When you publish content, it's automatically uploaded to IPFS, created as a Tor onion service, and distributed across multiple gateway mirrors. This multi-network approach ensures maximum availability and censorship resistance."
    },
    {
      question: "Is my content really censorship-resistant?",
      answer: "Yes. By distributing content across multiple decentralized networks (IPFS, Tor, gateway mirrors), there's no single point of failure. Even if one network is blocked or goes down, your content remains accessible through other channels."
    },
    {
      question: "Can I publish anonymously?",
      answer: "Absolutely. PressProtocol supports anonymous publishing. You can create content without revealing your identity, and your Ed25519 cryptographic signatures verify authenticity without exposing personal information."
    },
    {
      question: "How do I verify content authenticity?",
      answer: "All content on PressProtocol is signed with Ed25519 cryptographic signatures. Readers can verify the signature to ensure the content hasn't been tampered with and comes from the claimed publisher."
    },
    {
      question: "What are the costs involved?",
      answer: "PressProtocol is free to use. Publishing and distributing content across our networks is completely free. There are no subscription fees or hidden costs."
    },
    {
      question: "How do I share my published content?",
      answer: "After publishing, you'll receive a unique pressprotocol:// link and a canonical web URL. Share this link anywhere, and readers with the PressProtocol browser extension can access your content through the fastest available mirror."
    },
    {
      question: "Can I edit or delete published content?",
      answer: "You can publish new versions of your content, which will be cryptographically linked to previous versions. However, once content is on IPFS and Tor, it becomes part of the permanent record - a feature, not a bug, for censorship resistance."
    },
    {
      question: "What is the browser extension for?",
      answer: "The browser extension automatically resolves pressprotocol:// links and selects the fastest available mirror (IPFS, Tor, or gateway) based on your connection. It ensures optimal reading experience and maximum availability."
    },
    {
      question: "How secure are my Ed25519 keys?",
      answer: "Your signing keys are stored securely and never leave your device unless you explicitly export them. We recommend backing up your keys securely and never sharing them with anyone."
    }
  ];

  const quickLinks = [
    { title: "Documentation", href: "#", icon: Book },
    { title: "API Reference", href: "#", icon: FileText },
    { title: "Community Forum", href: "#", icon: MessageCircle },
    { title: "Contact Support", href: "#", icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0B0D14]/80 backdrop-blur-xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.12),transparent_70%)]" />

        <div className="container relative z-10 mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400">
              <HelpCircle className="h-8 w-8 text-cyan-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-sans font-bold text-white mb-4 tracking-tight">How can we help you?</h1>
            <p className="text-sm md:text-base text-neutral-400 mb-8 max-w-xl mx-auto">
              Find answers, learn about protocol features, and get the most out of PressProtocol
            </p>
            
            {/* Search */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search for help articles, cryptographic guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-4 text-base bg-[#0B0D14] border-white/10 text-white placeholder:text-neutral-500 rounded-2xl focus-visible:ring-cyan-500/30"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Help Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-sans font-bold text-white mb-6">Browse by Category</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {helpCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.title} className="hover:shadow-[0_0_25px_rgba(6,182,212,0.1)] transition-all cursor-pointer border border-white/10 bg-[#0B0D14] hover:border-cyan-500/40 rounded-2xl">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                      <Icon className="h-6 w-6 text-cyan-400" />
                    </div>
                    <CardTitle className="text-lg text-white font-sans font-bold">{category.title}</CardTitle>
                    <CardDescription className="text-neutral-400 text-xs">{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="border-white/10 bg-white/[0.04] text-cyan-300 font-mono text-xs">{category.articles} articles</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-sans font-bold text-white mb-2">Frequently Asked Questions</h2>
            <p className="text-sm text-neutral-400">
              Quick answers to common questions about decentralized publishing
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-white/10 bg-[#0B0D14] rounded-xl px-4">
                  <AccordionTrigger className="text-left text-white hover:text-cyan-300 text-sm font-medium py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-neutral-400 text-xs leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-16">
          <h2 className="text-2xl font-sans font-bold text-white mb-6 text-center">More Resources</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Card key={link.title} className="hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all cursor-pointer border border-white/10 bg-[#0B0D14] hover:border-cyan-500/40 rounded-2xl">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 text-cyan-400">
                      <Icon className="h-6 w-6 text-cyan-400" />
                    </div>
                    <h3 className="font-semibold text-white text-sm">{link.title}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Contact Support */}
        <Card className="border border-white/10 bg-[#0B0D14] relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),transparent_70%)]" />
          <CardContent className="p-12 text-center relative z-10">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-cyan-400" />
            <h2 className="text-2xl font-sans font-bold text-white mb-2">Still need help?</h2>
            <p className="text-neutral-400 mb-6 max-w-md mx-auto text-xs leading-relaxed">
              Our open-source team and developer community are here to help you configure your gateway or self-hosted node.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs">
                <MessageCircle className="h-4 w-4" />
                Contact Protocol Support
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white rounded-xl text-xs">
                <MessageCircle className="h-4 w-4" />
                Join Community Swarm
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
