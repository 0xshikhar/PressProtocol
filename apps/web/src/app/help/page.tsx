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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Find answers, learn about features, and get the most out of PressProtocol
            </p>
            
            {/* Search */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-4 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Help Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {helpCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.title} className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/30">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">{category.articles} articles</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Quick answers to common questions
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">More Resources</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Card key={link.title} className="hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">{link.title}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Contact Support */}
        <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-12 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Our support team is here to help you with any questions or issues you may have.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Support
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <MessageCircle className="h-5 w-5" />
                Join Community
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
