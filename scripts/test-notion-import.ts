/**
 * PressProtocol Milestone 3: Notion 1-Click Sovereign Importer Test Suite
 * Tests Notion page ID extraction across diverse URL formats, rich text array rendering,
 * block tree hierarchy conversion, callout preservation, markdown fallback parsing,
 * and Ed25519 cryptographic signing over Notion documents.
 */
import path from "path";
import { fileURLToPath } from "url";
import {
  extractNotionPageId,
  formatUuid,
  renderNotionRichText,
  convertNotionBlocksToHtml,
  parseNotionMarkdown,
} from "../apps/web/src/lib/notion";
import { generateKeypair, signPayload, verifySignature } from "../packages/sdk/src/index";
import { POST as postImportNotion } from "../apps/web/src/app/api/import/notion/route";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const monorepoRoot = path.resolve(__dirname, "..");

let passed = 0;
let total = 0;

function assert(condition: boolean, message: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Mock Notion recordMap fixture
const MOCK_PAGE_ID = "3b1a2c3d4e5f6a7b8c9d0e1f2a3b4c5d";
const MOCK_FORMATTED_PAGE_ID = formatUuid(MOCK_PAGE_ID);

const MOCK_RECORD_MAP = {
  block: {
    [MOCK_FORMATTED_PAGE_ID]: {
      value: {
        id: MOCK_FORMATTED_PAGE_ID,
        type: "page",
        properties: {
          title: [["Decentralized Storage Specifications", [["b"]]]],
        },
        format: {
          page_icon: "💡",
        },
        content: ["block_h1", "block_p1", "block_callout1", "block_quote1", "block_code1", "block_list1", "block_list2", "block_todo1", "block_hr1"],
      },
    },
    block_h1: {
      value: {
        id: "block_h1",
        type: "header",
        properties: {
          title: [["Section 1: The Cryptographic Core"]],
        },
      },
    },
    block_p1: {
      value: {
        id: "block_p1",
        type: "text",
        properties: {
          title: [
            ["In-memory keys allow "],
            ["instant zero-knowledge verification", [["b"]]],
            [" across all transports."],
          ],
        },
      },
    },
    block_callout1: {
      value: {
        id: "block_callout1",
        type: "callout",
        format: {
          page_icon: "🚨",
        },
        properties: {
          title: [["Critical Security Notice: Never transmit unencrypted private keys."]],
        },
      },
    },
    block_quote1: {
      value: {
        id: "block_quote1",
        type: "quote",
        properties: {
          title: [["Truth requires cryptographic proofs, not centralized authority."]],
        },
      },
    },
    block_code1: {
      value: {
        id: "block_code1",
        type: "code",
        properties: {
          title: [["const signature = await ed25519.sign(msgBytes, privKey);"]],
          language: [["typescript"]],
        },
      },
    },
    block_list1: {
      value: {
        id: "block_list1",
        type: "bulleted_list",
        properties: {
          title: [["IPFS Swarm distribution"]],
        },
      },
    },
    block_list2: {
      value: {
        id: "block_list2",
        type: "bulleted_list",
        properties: {
          title: [["Tor v3 Onion hidden services"]],
        },
      },
    },
    block_todo1: {
      value: {
        id: "block_todo1",
        type: "to_do",
        properties: {
          title: [["Implement optical sneakernet scanner"]],
          checked: [["Yes"]],
        },
      },
    },
    block_hr1: {
      value: {
        id: "block_hr1",
        type: "divider",
      },
    },
  },
};

async function runTests() {
  console.log("\n🧪 Running Milestone 3: Notion 1-Click Sovereign Importer Test Suite");
  console.log("===================================================================");

  // Group 1: Notion Page ID Resolution Across Formats
  console.log("\n[1] Notion Page ID Extraction Across URL Variants");
  const url1 = "https://www.notion.so/workspace/My-Research-Paper-3b1a2c3d4e5f6a7b8c9d0e1f2a3b4c5d";
  assert(extractNotionPageId(url1) === MOCK_PAGE_ID, "Extracted 32-char ID from standard Notion URL");

  const url2 = "https://dao-research.notion.site/Threat-Model-3b1a2c3d4e5f6a7b8c9d0e1f2a3b4c5d?pvs=4";
  assert(extractNotionPageId(url2) === MOCK_PAGE_ID, "Extracted 32-char ID from notion.site URL with query params");

  const url3 = "https://notion.so/3b1a2c3d4e5f6a7b8c9d0e1f2a3b4c5d";
  assert(extractNotionPageId(url3) === MOCK_PAGE_ID, "Extracted ID from short Notion URL");

  const url4 = "3b1a2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d";
  assert(extractNotionPageId(url4) === MOCK_PAGE_ID, "Normalized hyphenated UUID to 32 hex chars");

  assert(extractNotionPageId("https://google.com/search") === null, "Correctly rejected non-Notion URL");
  assert(extractNotionPageId("") === null, "Handled empty input cleanly");

  // Group 2: Notion Rich Text Renderer
  console.log("\n[2] Notion Rich Text Formatter");
  const richSample = [
    ["Plain text and "],
    ["Bold text", [["b"]]],
    [" and "],
    ["Inline Code", [["c"]]],
    [" and "],
    ["Hyperlink", [["a", "https://pressprotocol.com"]]],
  ];
  const renderedRich = renderNotionRichText(richSample);
  assert(renderedRich.includes("<strong>Bold text</strong>"), "Rendered bold modifier");
  assert(renderedRich.includes("<code"), "Rendered inline code modifier");
  assert(renderedRich.includes('href="https://pressprotocol.com"'), "Rendered external hyperlink");

  // Group 3: Block Tree Hierarchy to Semantic HTML5 Conversion
  console.log("\n[3] Block Tree to Semantic HTML5 Conversion");
  const article = convertNotionBlocksToHtml(MOCK_RECORD_MAP, MOCK_PAGE_ID);
  assert(article.title.includes("Decentralized Storage Specifications"), "Extracted root document title");
  assert(article.icon === "💡", "Preserved document icon");
  assert(article.cleanHtml.includes("<h1"), "Mapped Notion header to semantic <h1>");
  assert(article.cleanHtml.includes('data-type="callout"'), "Converted Notion callout to PressProtocol callout");
  assert(article.cleanHtml.includes('data-callout-type="warning"'), "Mapped warning icon to warning callout");
  assert(article.cleanHtml.includes("<blockquote"), "Converted Notion quote to <blockquote>");
  assert(article.cleanHtml.includes("<pre"), "Converted Notion code block to syntax-highlighted block");
  assert(article.cleanHtml.includes("<ul"), "Grouped bulleted list items into <ul>");
  assert(article.cleanHtml.includes("<hr"), "Converted divider to <hr>");
  assert(article.stats.calloutsConverted === 1, "Recorded 1 callout converted in telemetry");
  assert(article.stats.headingsConverted === 1, "Recorded 1 heading converted in telemetry");
  assert(article.stats.codeBlocksConverted === 1, "Recorded 1 code block converted in telemetry");
  assert(article.wordCount > 10, "Calculated positive word count");

  // Group 4: Markdown Export Fallback Parser
  console.log("\n[4] Notion Markdown Export Fallback Parser");
  const sampleMd = `# Sovereign Manifesto
> 💡 Notice: This is a callout block.

## Threat Analysis
> "Censorship is the tool of fragile institutions."

\`\`\`typescript
const key = ed25519.randomPrivateKey();
\`\`\`

- [x] Ephemeral keys active
- [ ] Centralized accounts avoided
`;
  const parsedMd = parseNotionMarkdown(sampleMd);
  assert(parsedMd.title === "Sovereign Manifesto", "Extracted markdown document title");
  assert(parsedMd.cleanHtml.includes('data-type="callout"'), "Parsed callout block from markdown");
  assert(parsedMd.cleanHtml.includes("<blockquote"), "Parsed quote block from markdown");
  assert(parsedMd.cleanHtml.includes("<code"), "Parsed code fence from markdown");
  assert(parsedMd.stats.calloutsConverted === 1, "Tracked markdown callout count");

  // Group 5: Ed25519 Cryptographic Signing Over Converted Notion Documents
  console.log("\n[5] Sovereign Cryptographic Signing Over Notion Content");
  const keypair = await generateKeypair();
  const signable = JSON.stringify({
    title: article.title,
    tags: ["notion", "sovereign-doc"],
    timestamp: new Date().toISOString(),
  });
  const sig = await signPayload(signable, keypair.privateKey);
  const isValid = await verifySignature(signable, sig, keypair.publicKey);
  assert(isValid === true, "Author Ed25519 signature verified over converted Notion payload");

  // Group 6: API Route Input Validation
  console.log("\n[6] API Endpoint Validation");
  const mockReqEmpty = { json: async () => ({}) } as any;
  const resEmpty = await postImportNotion(mockReqEmpty);
  assert(resEmpty.status === 400, "Rejected empty request payload (HTTP 400)");

  const mockReqInvalidId = { json: async () => ({ url: "https://notion.so/invalid" }) } as any;
  const resInvalid = await postImportNotion(mockReqInvalidId);
  assert(resInvalid.status === 400, "Rejected invalid Notion URL (HTTP 400)");

  const mockReqMarkdown = {
    json: async () => ({
      rawMarkdown: "# Instant Notion Note\n\nContent paragraph here.",
      autoPublish: false,
    }),
  } as any;
  const resMd = await postImportNotion(mockReqMarkdown);
  const dataMd = await resMd.json();
  assert(resMd.status === 200, "Successfully converted pasted Notion markdown via API (HTTP 200)");
  assert(dataMd.article.title === "Instant Notion Note", "Returned converted title from API");

  console.log(`\n🎉 Notion 1-Click Sovereign Importer Test Suite Complete: ${passed}/${total} checks passed!\n`);
}

runTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
