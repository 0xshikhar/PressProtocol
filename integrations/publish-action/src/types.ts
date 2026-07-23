export interface ActionInputs {
  contentDir: string;
  privateKey?: string;
  gatewayUrl: string;
  authorPseudonym: string;
  manifestPath: string;
  filterModifiedOnly: boolean;
  dryRun: boolean;
  tags: string[];
}

export interface ActionOutputs {
  publishedCount: number;
  latestCid: string;
  manifestPath: string;
  cids: string[];
  publicKey: string;
}

export interface ParsedFrontmatter {
  title?: string;
  date?: string;
  author?: string;
  byline?: string;
  tags?: string[] | string;
  categories?: string[] | string;
  keywords?: string[] | string;
  slug?: string;
  permalink?: string;
  description?: string;
  summary?: string;
  excerpt?: string;
  draft?: boolean | string;
  coverImage?: string;
  image?: string;
  [key: string]: any;
}

export interface MarkdownArticle {
  filePath: string;
  relativePath: string;
  frontmatter: ParsedFrontmatter;
  rawContent: string;
  bodyMarkdown: string;
  title: string;
  date: string;
  author: string;
  tags: string[];
  slug: string;
  excerpt: string;
  isDraft: boolean;
  coverImage?: string;
}

export interface PublishResultItem {
  filePath: string;
  slug: string;
  title: string;
  date: string;
  author: string;
  tags: string[];
  cid: string;
  signature: string;
  publicKey: string;
  readingTimeMinutes: number;
  wordCount: number;
  shareUrl: string;
  mirrors: {
    ipfs: string;
    gateway: string;
    tor?: string;
  };
  publishedAt: string;
}

export interface PressProtocolManifest {
  manifestVersion: string;
  generator: string;
  updatedAt: string;
  publicKey: string;
  author: string;
  repository?: string;
  totalArticles: number;
  articles: PublishResultItem[];
}
