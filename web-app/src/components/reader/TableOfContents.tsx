"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentRef?: React.RefObject<HTMLElement>;
}

export function TableOfContents({ contentRef }: TableOfContentsProps) {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Extract headings from content
    const extractHeadings = () => {
      const content = contentRef?.current || document.querySelector(".article-content");
      if (!content) return [];

      const headings = content.querySelectorAll("h1, h2, h3, h4");
      const items: TocItem[] = [];

      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.substring(1));
        const text = heading.textContent || "";
        
        // Create ID if doesn't exist
        let id = heading.id;
        if (!id) {
          id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
          heading.id = id;
        }

        items.push({ id, text, level });
      });

      return items;
    };

    setToc(extractHeadings());

    // Track active heading on scroll
    const handleScroll = () => {
      const headings = document.querySelectorAll(".article-content h1, .article-content h2, .article-content h3, .article-content h4");
      let currentActiveId = "";

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100 && rect.top >= -100) {
          currentActiveId = heading.id;
        }
      });

      setActiveId(currentActiveId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [contentRef]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setOpen(false);
    }
  };

  if (toc.length === 0) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed right-4 top-20 z-40 shadow-lg"
          title="Table of Contents"
        >
          <List className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Table of Contents</SheetTitle>
          <SheetDescription>
            Jump to any section in this article
          </SheetDescription>
        </SheetHeader>
        <nav className="mt-6">
          <ul className="space-y-2">
            {toc.map((item) => (
              <li
                key={item.id}
                style={{
                  paddingLeft: `${(item.level - 1) * 12}px`,
                }}
              >
                <button
                  onClick={() => scrollToHeading(item.id)}
                  className={`text-left w-full py-1 px-2 rounded text-sm transition-colors hover:bg-muted ${
                    activeId === item.id
                      ? "text-primary font-medium bg-muted"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
